import TopBar from '../components/TopBar'
import BigButton from '../components/BigButton'

const GAMES = [
  { key: 'game-match', label: '連連看', desc: '圖片配對客語詞卡', emoji: '🔗', color: 'bg-teal-400' },
  { key: 'game-catch', label: '抓動物', desc: '聽聲音，抓對動物', emoji: '🕹️', color: 'bg-orange-400' },
  { key: 'game-bubble', label: '泡泡射擊', desc: '聽聲音，戳破對的泡泡', emoji: '🫧', color: 'bg-sky-400' },
]

export default function GamesHub({ onBack, onNavigate }) {
  return (
    <div className="min-h-screen pb-10">
      <TopBar title="🎮 動物遊戲區" onBack={onBack} />
      <p className="text-center text-stone-500 mt-3 mb-4 text-lg">選一個遊戲，玩玩看客語動物名</p>
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto px-4">
        {GAMES.map((g) => (
          <BigButton
            key={g.key}
            color={g.color}
            className="!min-h-[110px] !justify-start !text-left"
            onClick={() => onNavigate(g.key)}
          >
            <span className="text-5xl">{g.emoji}</span>
            <span className="flex flex-col items-start">
              <span className="text-2xl">{g.label}</span>
              <span className="text-base font-medium opacity-90">{g.desc}</span>
            </span>
          </BigButton>
        ))}
      </div>
    </div>
  )
}
