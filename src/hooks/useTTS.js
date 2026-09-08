import { useState, useRef, useCallback } from 'react'
import { IS_VERCEL, TTS_BASE } from '../config'

let cachedToken = null
let tokenExpiry = 0
const audioBlobCache = new Map() // key = text|lang|voice|rate

async function getLocalTTSToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  const res = await fetch(`${TTS_BASE}/api/v1/tts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: import.meta.env.VITE_TTS_USERNAME,
      password: import.meta.env.VITE_TTS_PASSWORD,
      rememberMe: true,
    }),
  })
  const data = await res.json()
  cachedToken = data.token || data.access_token
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000
  return cachedToken
}

async function synthesizeLocal({ text, textType, lang, voice, rate }) {
  const token = await getLocalTTSToken()
  const res = await fetch(`${TTS_BASE}/api/v1/tts/synthesize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text, textType },
      voice: { model: 'broncitts', languageCode: lang, name: voice },
      audioConfig: { speakingRate: rate },
      outputConfig: { streamMode: 0 },
    }),
  })
  if (!res.ok) throw new Error('TTS 合成失敗（HTTP ' + res.status + '）')
  return await res.blob()
}

async function synthesizeVercel({ text, textType, lang, voice, rate }) {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, textType, lang, voice, rate }),
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error('TTS 合成失敗：' + (msg || res.status))
  }
  return await res.blob()
}

/**
 * useTTS：播放客語 / 華語語音。
 * speak(text, { lang, voice, rate, textType })：直接把 text 送去合成語音。
 * text 應該已經是要念出來的最終文字（本 App 內都是教材裡既有的正確客語漢字）。
 */
export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const speak = useCallback(
    async (text, options = {}) => {
      if (!text || !text.trim()) return
      stop()
      setError(null)
      const {
        lang = 'hak-xi-TW',
        voice = 'hak-xi-TW-vs2-F01',
        rate = 0.75,
        textType = 'characters',
      } = options
      const cacheKey = `${text}|${lang}|${voice}|${rate}`
      try {
        setIsPlaying(true)
        let blob = audioBlobCache.get(cacheKey)
        if (!blob) {
          blob = IS_VERCEL
            ? await synthesizeVercel({ text, textType, lang, voice, rate })
            : await synthesizeLocal({ text, textType, lang, voice, rate })
          audioBlobCache.set(cacheKey, blob)
        }
        const audio = new Audio(URL.createObjectURL(blob))
        audioRef.current = audio
        audio.onended = () => {
          setIsPlaying(false)
          audioRef.current = null
        }
        audio.onerror = () => {
          setIsPlaying(false)
          audioRef.current = null
        }
        await audio.play()
      } catch (err) {
        setIsPlaying(false)
        setError(err.message || String(err))
      }
    },
    [stop]
  )

  // playFile：直接播放一個靜態音檔（例如老師實際錄好的正確客語發音），
  // 不經過 TTS 合成，用來取代某些字 TTS 念不準的情況。
  const playFile = useCallback(
    async (url) => {
      if (!url) return
      stop()
      setError(null)
      try {
        setIsPlaying(true)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => {
          setIsPlaying(false)
          audioRef.current = null
        }
        audio.onerror = () => {
          setIsPlaying(false)
          audioRef.current = null
          setError('錄音檔播放失敗：' + url)
        }
        await audio.play()
      } catch (err) {
        setIsPlaying(false)
        setError(err.message || String(err))
      }
    },
    [stop]
  )

  // speakAnimal：播放一隻動物的發音。如果這筆資料有 audio 欄位
  // （代表 TTS 念這個字不準確，老師錄了正確發音取代），優先播放錄音檔，
  // 否則照原本方式呼叫 TTS 合成 animal.hanzi。
  const speakAnimal = useCallback(
    (animal, options = {}) => {
      if (!animal) return
      if (animal.audio) return playFile(animal.audio)
      return speak(animal.hanzi, options)
    },
    [playFile, speak]
  )

  return { speak, playFile, speakAnimal, stop, isPlaying, error }
}
