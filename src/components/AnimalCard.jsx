import { CARD_BG, CARD_BORDER, CARD_TEXT } from '../utils/colors'

export default function AnimalCard({ animal, onClick, playing, showCard = false, className = '' }) {
  const bg = CARD_BG[animal.color] || 'bg-orange-200'
  const border = CARD_BORDER[animal.color] || 'border-orange-400'
  const text = CARD_TEXT[animal.color] || 'text-orange-700'
  return (
    <button
      onClick={onClick}
      className={`relative rounded-3xl border-4 ${border} ${bg} shadow-md p-3 flex flex-col items-center
        active:scale-95 transition-transform duration-150 ${playing ? 'animate-pop ring-4 ring-white' : ''} ${className}`}
    >
      <img
        src={showCard ? animal.card : animal.pic}
        alt={animal.hanzi}
        className="w-full aspect-[4/3] object-contain rounded-2xl bg-white/60"
        draggable={false}
      />
      <div className={`mt-2 font-extrabold text-2xl ${text}`}>{animal.hanzi}</div>
      <div className="text-sm text-stone-500">{animal.pinyin}</div>
      {playing && <div className="absolute top-2 right-2 text-3xl">🔊</div>}
    </button>
  )
}
