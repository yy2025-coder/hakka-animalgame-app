import { createContext, useContext, useState } from 'react'
import { HAKKA_VOICES } from '../config'

const AccentContext = createContext(null)

export function AccentProvider({ children }) {
  const [accent, setAccent] = useState('xi') // 'xi' 四縣 | 'hoi' 海陸
  const voice = HAKKA_VOICES[accent]
  return (
    <AccentContext.Provider value={{ accent, setAccent, voice }}>
      {children}
    </AccentContext.Provider>
  )
}

export function useAccent() {
  const ctx = useContext(AccentContext)
  if (!ctx) throw new Error('useAccent 必須在 AccentProvider 內使用')
  return ctx
}
