import { useState } from 'react'
import TopBar from '../components/TopBar'
import StarRating from '../components/StarRating'
import { ANIMALS, sample, shuffle } from '../data/animals'
import { useTTS } from '../hooks/useTTS'
import { useAccent } from '../hooks/AccentContext'
import { CARD_BG, CARD_BORDER, CARD_BG_SOLID } from '../utils/colors'

const ROUND_SIZE = 6

function newRound() {
  const picked = sample(ANIMALS, ROUND_SIZE)
  return {
    animals: picked,
    pics: shuffle(picked),
    words: shuffle(picked),
  }
}

export default function MatchGame({ onBack }) {
  const { speakAnimal, error: ttsError } = useTTS()
  const { voice } = useAccent()
  const [round, setRound] = useState(newRound)
  const [matched, setMatched] = useState(new Set())
  // selected：{ type: 'pic' | 'word', id } | null。只保留單一選取狀態，
  // 這樣配對成功與否可以直接在點擊事件裡判斷，語音才能在使用者手勢當下播放（不會被瀏覽器自動播放政策擋掉）。
  const [selected, setSelected] = useState(null)
  const [wrongIds, setWrongIds] = useState(null) // { pic, word } 短暫顯示搖晃動畫用
  const [mistakes, setMistakes] = useState(0)

  const done = matched.size === ROUND_SIZE

  const handleTap = (type, animal) => {
    if (matched.has(animal.id)) return
    if (wrongIds) return // 搖晃動畫播放中，先不接受新的點擊

    if (!selected) {
      setSelected({ type, id: animal.id })
      return
    }

    if (selected.type === type) {
      // 同一邊再點別的，視為換選取
      setSelected({ type, id: animal.id })
      return
    }

    // 這裡是完成一組配對嘗試，直接在點擊事件（使用者手勢）當下判斷並播放語音
    const isMatch = selected.id === animal.id
    if (isMatch) {
      speakAnimal(animal, { lang: voice.languageCode, voice: voice.female, rate: 0.75 })
      setMatched((prev) => new Set(prev).add(animal.id))
      setSelected(null)
    } else {
      setMistakes((m) => m + 1)
      const picId = type === 'pic' ? animal.id : selected.id
      const wordId = type === 'word' ? animal.id : selected.id
      setWrongIds({ pic: picId, word: wordId })
      setTimeout(() => {
        setWrongIds(null)
        setSelected(null)
      }, 500)
    }
  }

  const restart = () => {
    setRound(newRound())
    setMatched(new Set())
    setSelected(null)
    setWrongIds(null)
    setMistakes(0)
  }

  const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="🔗 連連看" onBack={onBack} />
      <p className="text-center text-stone-500 mt-3 mb-4 text-lg">左邊點動物圖片，右邊點客語詞卡，配對看看！</p>
      {ttsError && <p className="text-center text-red-500 mb-2">🔇 {ttsError}</p>}

      {done ? (
        <div className="max-w-sm mx-auto text-center bg-white rounded-3xl shadow-xl p-8 mt-6">
          <div className="text-6xl mb-2">🎉</div>
          <p className="text-2xl font-extrabold text-stone-700 mb-2">全部配對成功！</p>
          <div className="flex justify-center mb-4">
            <StarRating count={stars} />
          </div>
          <button
            onClick={restart}
            className="min-h-[72px] w-full rounded-3xl bg-teal-500 text-white text-xl font-bold shadow active:scale-95 transition-transform"
          >
            🔄 換一批再玩
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto px-4">
          <div className="flex flex-col gap-3">
            {round.pics.map((animal) => {
              const isMatched = matched.has(animal.id)
              const isSelected = selected?.type === 'pic' && selected.id === animal.id
              const isWrong = wrongIds?.pic === animal.id
              const bg = CARD_BG[animal.color] || 'bg-orange-200'
              const border = CARD_BORDER[animal.color] || 'border-orange-400'
              return (
                <button
                  key={animal.id}
                  disabled={isMatched}
                  onClick={() => handleTap('pic', animal)}
                  className={`min-h-[112px] rounded-2xl border-4 p-2 flex items-center justify-center transition-transform
                    ${isMatched ? 'opacity-30 border-stone-200 bg-stone-100' : `${bg} ${border}`}
                    ${isSelected ? 'ring-4 ring-sky-400 scale-105' : ''}
                    ${isWrong ? 'animate-shake' : ''}`}
                >
                  <img src={animal.pic} alt="" className="h-24 object-contain" draggable={false} />
                </button>
              )
            })}
          </div>
          <div className="flex flex-col gap-3">
            {round.words.map((animal) => {
              const isMatched = matched.has(animal.id)
              const isSelected = selected?.type === 'word' && selected.id === animal.id
              const isWrong = wrongIds?.word === animal.id
              const solid = CARD_BG_SOLID[animal.color] || 'bg-orange-400'
              return (
                <button
                  key={animal.id}
                  disabled={isMatched}
                  onClick={() => handleTap('word', animal)}
                  className={`min-h-[112px] rounded-2xl p-2 flex items-center justify-center text-white text-3xl font-extrabold transition-transform
                    ${isMatched ? 'opacity-30 bg-stone-300' : solid}
                    ${isSelected ? 'ring-4 ring-sky-400 scale-105' : ''}
                    ${isWrong ? 'animate-shake' : ''}`}
                >
                  {animal.hanzi}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
