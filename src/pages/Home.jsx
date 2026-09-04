import BigButton from '../components/BigButton'
import { useAccent } from '../hooks/AccentContext'

const MENU = [
  { key: 'listen', label: '聽一聽', desc: '17 種動物客語發音', emoji: '👂', color: 'bg-sky-400' },
  { key: 'games', label: '動物遊戲區', desc: '連連看．抓動物．泡泡射擊', emoji: '🎮', color: 'bg-amber-400' },
]

export default function Home({ onNavigate }) {
  const { accent, setAccent, voice } = useAccent()
  return (
    <div className="min-h-screen px-4 py-6 pb-12">
      <div className="text-center mb-6">
        <div className="text-6xl mb-1 animate-float">🐯🐻🐰</div>
        <h1 className="text-4xl font-extrabold text-stone-700">客語動物園</h1>
        <p className="text-stone-500 text-lg mt-1">聽聽看．玩遊戲學客語</p>
        <button
          onClick={() => setAccent(accent === 'xi' ? 'hoi' : 'xi')}
          className="mt-3 min-h-[56px] px-5 rounded-2xl bg-white shadow text-lg font-bold text-stone-600 active:scale-95 transition-transform"
        >
          目前腔調：🗣️ {voice.label}（點我切換）
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {MENU.map((m) => (
          <BigButton
            key={m.key}
            color={m.color}
            className="!min-h-[160px] !text-left !justify-start"
            onClick={() => onNavigate(m.key)}
          >
            <span className="text-6xl">{m.emoji}</span>
            <span className="flex flex-col items-start">
              <span className="text-3xl">{m.label}</span>
              <span className="text-lg font-medium opacity-90">{m.desc}</span>
            </span>
          </BigButton>
        ))}
      </div>

      <p className="text-center text-stone-400 text-sm mt-8">
        教材來源：《客語真好玩》第一冊 第 17 課．陽明交大 BRONCI 語音技術
      </p>
    </div>
  )
}
