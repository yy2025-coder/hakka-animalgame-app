import { useAccent } from '../hooks/AccentContext'

export default function TopBar({ title, onBack, showAccentToggle = true }) {
  const { accent, setAccent, voice } = useAccent()
  return (
    <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-20 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="返回"
            className="min-h-[56px] min-w-[56px] rounded-2xl bg-white shadow flex items-center justify-center text-3xl active:scale-95 transition-transform"
          >
            ⬅️
          </button>
        )}
        <h1 className="text-2xl md:text-3xl font-extrabold text-stone-700">{title}</h1>
      </div>
      {showAccentToggle && (
        <button
          onClick={() => setAccent(accent === 'xi' ? 'hoi' : 'xi')}
          className="min-h-[56px] px-4 rounded-2xl bg-white shadow text-lg font-bold text-stone-600 active:scale-95 transition-transform"
        >
          🗣️ {voice.label}
        </button>
      )}
    </div>
  )
}
