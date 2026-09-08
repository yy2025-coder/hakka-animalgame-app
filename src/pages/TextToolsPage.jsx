import { useState } from 'react'
import TopBar from '../components/TopBar'
import { useTTS } from '../hooks/useTTS'
import { useMT } from '../hooks/useMT'
import { useAccent } from '../hooks/AccentContext'

const SOURCE_LABEL = {
  official: { text: '陽明交大官方翻譯', color: 'bg-emerald-100 text-emerald-700 border-emerald-400' },
  claude: { text: 'AI 備援翻譯（僅供參考）', color: 'bg-violet-100 text-violet-700 border-violet-400' },
  'fallback-original': { text: '翻譯服務暫時無法使用，顯示原文', color: 'bg-amber-100 text-amber-700 border-amber-400' },
}

export default function TextToolsPage({ onBack }) {
  const [input, setInput] = useState('')
  const [hakkaText, setHakkaText] = useState('')
  const [source, setSource] = useState(null)
  const [skipMT, setSkipMT] = useState(false)
  const { speak, isPlaying, error: ttsError } = useTTS()
  const { translate, isTranslating, error: mtError } = useMT()
  const { accent, voice } = useAccent()

  const handleConvert = async () => {
    if (!input.trim()) return
    const result = await translate(input, accent)
    setHakkaText(result.output)
    setSource(result.source)
  }

  const handleReadHakka = () => {
    const text = skipMT ? input : hakkaText || input
    speak(text, { lang: voice.languageCode, voice: voice.female, rate: 0.75 })
  }

  const handleReadChinese = () => {
    speak(input, { lang: 'cmn-TW', voice: 'cmn-TW-vs2-F01', rate: 0.9, textType: 'common' })
  }

  const label = source ? SOURCE_LABEL[source] : null

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="📝 文本朗讀" onBack={onBack} />
      <div className="max-w-xl mx-auto px-4 mt-4 flex flex-col gap-4">
        <p className="text-stone-500 text-lg">
          輸入華語句子，先轉換成客語漢字，再用客語發音讀出來，發音會更準確。
          若輸入的內容本來就是客語漢字（例如教材詞卡），可以打開「直接朗讀」。
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="在這裡輸入文字，例如：今天天氣很好"
          rows={4}
          className="w-full rounded-2xl border-2 border-stone-300 p-4 text-xl focus:outline-none focus:border-sky-400 shadow-inner"
        />

        <label className="flex items-center gap-2 text-lg text-stone-600">
          <input type="checkbox" className="w-6 h-6" checked={skipMT} onChange={(e) => setSkipMT(e.target.checked)} />
          輸入的內容已經是客語漢字，直接朗讀（不轉換）
        </label>

        {!skipMT && (
          <button
            onClick={handleConvert}
            disabled={isTranslating || !input.trim()}
            className="min-h-[72px] rounded-3xl bg-violet-500 text-white text-xl font-bold shadow active:scale-95 transition-transform disabled:opacity-50"
          >
            {isTranslating ? '轉換中…' : '🔁 轉換成客語漢字'}
          </button>
        )}

        {!skipMT && hakkaText && (
          <div className="rounded-2xl bg-white shadow p-4">
            <p className="text-2xl font-extrabold text-stone-700 mb-2">{hakkaText}</p>
            {label && (
              <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full border ${label.color}`}>
                {label.text}
              </span>
            )}
          </div>
        )}

        {mtError && <p className="text-red-500">{mtError}</p>}
        {ttsError && <p className="text-red-500">{ttsError}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleReadHakka}
            disabled={!input.trim() || isPlaying}
            className="min-h-[72px] rounded-3xl bg-sky-500 text-white text-xl font-bold shadow active:scale-95 transition-transform disabled:opacity-50"
          >
            🔊 用客語讀出來
          </button>
          <button
            onClick={handleReadChinese}
            disabled={!input.trim() || isPlaying}
            className="min-h-[72px] rounded-3xl bg-stone-400 text-white text-xl font-bold shadow active:scale-95 transition-transform disabled:opacity-50"
          >
            🔊 用華語讀出來（對照用）
          </button>
        </div>
      </div>
    </div>
  )
}
