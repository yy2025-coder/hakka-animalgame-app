import { useState, useCallback } from 'react'
import { IS_VERCEL, TTS_BASE, MT_ENDPOINTS } from '../config'

const mtCache = new Map()
let cachedToken = null
let tokenExpiry = 0

async function getLocalToken() {
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

// 本機開發：官方 MT 走 8461 + /MT/translate/{endpoint} + token（坑19：勿走舊版8751會壞）
async function translateLocal(text, accent) {
  const token = await getLocalToken()
  const endpoint = MT_ENDPOINTS[accent]
  const res = await fetch(`${TTS_BASE}/MT/translate/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ input: text }),
  })
  const data = await res.json()
  // ⚠️ code 是字串 "200"，不能用 === 200 比對（坑6）
  if (String(data.code) === '200' && data.output) {
    return { output: data.output, source: 'official' }
  }
  throw new Error('官方 MT 回傳異常：' + JSON.stringify(data))
}

// Vercel 部署：走 serverless function，內含官方 MT + Claude 備援
async function translateVercel(text, accent) {
  const res = await fetch('/api/mt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, accent }),
  })
  const data = await res.json()
  if (data.output) return { output: data.output, source: data.source || 'official' }
  throw new Error(data.error || 'MT 轉換失敗')
}

/**
 * useMT：把華語文字轉換成客語漢字（四縣／海陸），供 TTS 朗讀使用。
 * 這樣可以避免直接把華語送給客語 TTS 唸出怪音（坑4）。
 * 若使用者輸入的本來就已經是客語漢字（例如教材裡的詞卡），
 * 可以不經過 MT，直接把文字丟給 TTS。
 */
export function useMT() {
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState(null)

  const translate = useCallback(async (text, accent = 'xi') => {
    if (!text || !text.trim()) return { output: '', source: 'none' }
    const key = `${accent}|${text}`
    if (mtCache.has(key)) return mtCache.get(key)
    setIsTranslating(true)
    setError(null)
    try {
      const result = IS_VERCEL ? await translateVercel(text, accent) : await translateLocal(text, accent)
      mtCache.set(key, result)
      return result
    } catch (err) {
      setError(err.message || String(err))
      // 轉換失敗時退回原文，讓使用者仍能繼續操作，並清楚標示來源
      return { output: text, source: 'fallback-original' }
    } finally {
      setIsTranslating(false)
    }
  }, [])

  return { translate, isTranslating, error }
}
