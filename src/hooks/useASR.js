import { useState, useRef, useCallback } from 'react'
import { IS_VERCEL, ASR_BASE, ASR_WS } from '../config'

// 評分函式：比對辨識結果與期望文字的字元重疊比例，回傳 0~100。
// 幼教複習遊戲準則：答錯不扣分、不中斷，這裡只用分數決定星星數，不做扣分懲罰。
export function calcScore(expected, got) {
  if (!expected || !got) return 0
  const a = expected.replace(/\s/g, '')
  const b = got.replace(/\s/g, '')
  if (a === b) return 100
  let matches = 0
  const bChars = b.split('')
  for (const ch of a) {
    const idx = bChars.indexOf(ch)
    if (idx !== -1) {
      matches++
      bChars.splice(idx, 1)
    }
  }
  return Math.round((matches / Math.max(a.length, 1)) * 100)
}

export function scoreToStars(score) {
  if (score >= 80) return 3
  if (score >= 50) return 2
  if (score > 0) return 1
  return 0
}

async function getLocalAsrCredentials() {
  const res = await fetch(`${ASR_BASE}/api/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: import.meta.env.VITE_ASR_USERNAME,
      password: import.meta.env.VITE_ASR_PASSWORD,
      rememberMe: true,
    }),
  })
  const { token } = await res.json()
  const infoRes = await fetch(`${ASR_BASE}/api/v1/streaming/transcript/access-info`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const infoData = await infoRes.json()
  const ticket = infoData?.data?.[0]?.ticket
  if (!ticket) throw new Error('取得 ASR ticket 失敗')
  return { wsBase: ASR_WS, ticket }
}

async function getVercelAsrCredentials() {
  const res = await fetch('/api/asr-token', { method: 'POST' })
  const data = await res.json()
  if (!data.ticket) throw new Error(data.error || '取得 ASR ticket 失敗')
  // Vercel serverless 無法保持 WebSocket，直連交大伺服器
  return { wsBase: 'wss://140.113.30.204:8451', ticket: data.ticket }
}

/**
 * useASR：錄音並即時送到 BRONCI ASR 辨識，回傳客語漢字辨識結果。
 * ticket 效期僅 30 秒，取得後要立刻連線（見經驗包坑）。
 */
export function useASR() {
  const [isRecording, setIsRecording] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)

  const wsRef = useRef(null)
  const audioCtxRef = useRef(null)
  const streamRef = useRef(null)
  const processorRef = useRef(null)
  const sourceRef = useRef(null)
  const latestTranscriptRef = useRef('')

  const cleanupAudio = useCallback(() => {
    try {
      processorRef.current?.disconnect()
      sourceRef.current?.disconnect()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      audioCtxRef.current?.close()
    } catch {
      /* ignore cleanup errors */
    }
    processorRef.current = null
    sourceRef.current = null
    streamRef.current = null
    audioCtxRef.current = null
  }, [])

  const stopListening = useCallback(() => {
    try {
      wsRef.current?.send('EOS')
    } catch {
      /* socket may already be closed */
    }
    cleanupAudio()
    setIsRecording(false)
  }, [cleanupAudio])

  const startListening = useCallback(
    async ({ modelName = 'hakka-bun-1023', onResult, onDone } = {}) => {
      setError(null)
      setTranscript('')
      latestTranscriptRef.current = ''
      setIsConnecting(true)
      try {
        const { wsBase, ticket } = IS_VERCEL ? await getVercelAsrCredentials() : await getLocalAsrCredentials()
        const wsUrl = `${wsBase}/ws/v1/transcript?ticket=${encodeURIComponent(
          ticket
        )}&type=raw&rate=16000&modelName=${modelName}`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream
            const AudioContextCtor = window.AudioContext || window.webkitAudioContext
            const audioCtx = new AudioContextCtor()
            audioCtxRef.current = audioCtx
            const source = audioCtx.createMediaStreamSource(stream)
            sourceRef.current = source
            const processor = audioCtx.createScriptProcessor(4096, 1, 1)
            processorRef.current = processor
            const inputRate = audioCtx.sampleRate

            processor.onaudioprocess = (e) => {
              if (ws.readyState !== WebSocket.OPEN) return
              const input = e.inputBuffer.getChannelData(0)
              const down = downsampleTo16k(input, inputRate)
              const pcm16 = floatTo16BitPCM(down)
              ws.send(pcm16)
            }
            source.connect(processor)
            processor.connect(audioCtx.destination)
            setIsConnecting(false)
            setIsRecording(true)
          } catch (mediaErr) {
            setError('無法取得麥克風權限：' + (mediaErr.message || mediaErr))
            setIsConnecting(false)
            ws.close()
          }
        }

        ws.onmessage = (evt) => {
          try {
            const msg = JSON.parse(evt.data)
            if (msg.code === 200) {
              const text = msg.result?.[0]?.transcript || ''
              latestTranscriptRef.current = text
              setTranscript(text)
              onResult?.(text)
            }
            if (msg.code === 204) {
              onDone?.(latestTranscriptRef.current)
              cleanupAudio()
              setIsRecording(false)
              ws.close()
            }
          } catch {
            /* 非 JSON 訊息，略過 */
          }
        }

        ws.onerror = () => {
          setError('語音辨識連線發生錯誤，請確認網路或重新整理後再試一次')
          setIsConnecting(false)
          setIsRecording(false)
          cleanupAudio()
        }

        ws.onclose = () => {
          setIsRecording(false)
        }
      } catch (err) {
        setError(err.message || String(err))
        setIsConnecting(false)
      }
    },
    [cleanupAudio]
  )

  return { startListening, stopListening, isRecording, isConnecting, transcript, error }
}

function downsampleTo16k(buffer, inputRate) {
  const targetRate = 16000
  if (inputRate === targetRate) return buffer
  const ratio = inputRate / targetRate
  const newLength = Math.round(buffer.length / ratio)
  const result = new Float32Array(newLength)
  let offsetResult = 0
  let offsetBuffer = 0
  while (offsetResult < newLength) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio)
    let accum = 0
    let count = 0
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i]
      count++
    }
    result[offsetResult] = count > 0 ? accum / count : 0
    offsetResult++
    offsetBuffer = nextOffsetBuffer
  }
  return result
}

function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2)
  const view = new DataView(buffer)
  let offset = 0
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32Array[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return buffer
}
