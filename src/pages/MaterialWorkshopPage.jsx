import { useState } from 'react'
import TopBar from '../components/TopBar'
import SpeakPractice from '../components/SpeakPractice'
import { useTTS } from '../hooks/useTTS'
import { useMT } from '../hooks/useMT'
import { useAccent } from '../hooks/AccentContext'

const MAX_ITEMS = 24
const COLORS = ['rose', 'amber', 'pink', 'orange', 'yellow', 'stone', 'lime', 'teal', 'green', 'sky']

// 把老師貼上的教材文字拆解成一個一個詞彙／短句：
// 先用換行分段，再用常見標點（、，, 。 頓號 空白 數字項目符號）進一步切開。
function splitMaterial(raw) {
  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)

  const items = []
  for (const line of lines) {
    const cleaned = line.replace(/^[\d一二三四五六七八九十]+[.、）)]\s*/, '')
    const parts = cleaned
      .split(/[、，,。;；\s]+/)
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length > 0) items.push(...parts)
    else items.push(cleaned)
  }
  const unique = [...new Set(items)].filter((t) => t.length > 0 && t.length <= 12)
  return unique.slice(0, MAX_ITEMS)
}

export default function MaterialWorkshopPage({ onBack }) {
  const [raw, setRaw] = useState('')
  const [deck, setDeck] = useState(null) // array of { id, hanzi, source }
  const [building, setBuilding] = useState(false)
  const [playIndex, setPlayIndex] = useState(null)
  const { translate } = useMT()
  const { speak } = useTTS()
  const { accent, voice } = useAccent()

  const handleBuild = async () => {
    const words = splitMaterial(raw)
    if (words.length === 0) return
    setBuilding(true)
    const results = []
    for (let i = 0; i < words.length; i++) {
      const w = words[i]
      // 逐項先轉客語文字，再交給 TTS 朗讀會比較準（依照使用者指定的流程）
      const { output, source } = await translate(w, accent)
      results.push({
        id: `${i}-${w}`,
        hanzi: output || w,
        zh: w,
        source,
        color: COLORS[i % COLORS.length],
      })
    }
    setDeck(results)
    setBuilding(false)
  }

  const reset = () => {
    setDeck(null)
    setPlayIndex(null)
  }

  if (deck && playIndex !== null) {
    return (
      <div className="min-h-screen pb-10">
        <TopBar title="🧩 教材遊戲" onBack={() => setPlayIndex(null)} />
        <p className="text-center text-stone-500 mt-3 mb-4 text-lg">
          第 {playIndex + 1} / {deck.length} 項
        </p>
        <div className="px-4">
          <SpeakPractice
            animal={deck[playIndex]}
            onNext={() => setPlayIndex((i) => (i + 1 < deck.length ? i + 1 : 0))}
          />
        </div>
      </div>
    )
  }

  if (deck) {
    return (
      <div className="min-h-screen pb-10">
        <TopBar title="🧩 教材工坊" onBack={reset} />
        <p className="text-center text-stone-500 mt-3 mb-2 text-lg">
          已產生 {deck.length} 張詞卡，點卡片可以先聽發音，或按下方按鈕逐項跟讀練習
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4 max-w-4xl mx-auto">
          {deck.map((item, idx) => (
            <button
              key={item.id}
              onClick={() =>
                speak(item.hanzi, { lang: voice.languageCode, voice: voice.female, rate: 0.75 })
              }
              className="rounded-2xl border-4 border-violet-300 bg-violet-100 shadow p-4 flex flex-col items-center active:scale-95 transition-transform"
            >
              <span className="text-2xl font-extrabold text-stone-700">{item.hanzi}</span>
              {item.zh !== item.hanzi && <span className="text-sm text-stone-400 mt-1">原文：{item.zh}</span>}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPlayIndex(idx)
                }}
                className="mt-2 text-sm font-bold px-3 py-1 rounded-full bg-rose-400 text-white"
              >
                🎤 跟讀
              </button>
            </button>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPlayIndex(0)}
            className="min-h-[72px] px-8 rounded-3xl bg-rose-500 text-white text-xl font-bold shadow active:scale-95 transition-transform"
          >
            🎤 從第一張開始跟讀練習
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="🧩 教材工坊" onBack={onBack} />
      <div className="max-w-xl mx-auto px-4 mt-4 flex flex-col gap-4">
        <p className="text-stone-500 text-lg">
          把課程單字或句子貼上來（一行一個，或用頓號、逗號分隔），App 會自動拆解成一張張詞卡，
          並轉換成客語漢字，馬上變成聽一聽、說一說的練習遊戲。
        </p>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={'例如：\n蘋果、香蕉、西瓜\n紅色\n跑步'}
          rows={6}
          className="w-full rounded-2xl border-2 border-stone-300 p-4 text-xl focus:outline-none focus:border-violet-400 shadow-inner"
        />
        <button
          onClick={handleBuild}
          disabled={building || !raw.trim()}
          className="min-h-[72px] rounded-3xl bg-violet-500 text-white text-xl font-bold shadow active:scale-95 transition-transform disabled:opacity-50"
        >
          {building ? '製作中…（逐項轉換客語，請稍等）' : '🧩 產生聽說遊戲卡'}
        </button>
        <p className="text-stone-400 text-sm">最多會擷取前 {MAX_ITEMS} 項，太長的教材建議分批貼上。</p>
      </div>
    </div>
  )
}
