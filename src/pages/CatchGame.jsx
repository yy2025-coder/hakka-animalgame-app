import { useCallback, useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import StarRating from '../components/StarRating'
import { ANIMALS, sample, shuffle } from '../data/animals'
import { useTTS } from '../hooks/useTTS'
import { useAccent } from '../hooks/AccentContext'
import { CARD_BG, CARD_BORDER } from '../utils/colors'

// 題數拉到 12 題，選項從 4 個增加到 6 個，動物種類更豐富。
// 目標動物用「洗牌過的完整 17 種動物清單」依序取用，玩完一輪 12 題內
// 保證不會抽到重複的目標動物，避免使用者反映「一直重複」的狀況。
const TOTAL_ROUNDS = 12
const OPTIONS_PER_ROUND = 6

function buildOptions(target) {
  const distractors = sample(
    ANIMALS.filter((a) => a.id !== target.id),
    OPTIONS_PER_ROUND - 1
  )
  return shuffle([target, ...distractors])
}

function roundStars(mistakes) {
  if (mistakes === 0) return 3
  if (mistakes === 1) return 2
  return 1
}

export default function CatchGame({ onBack }) {
  const { speakAnimal, error: ttsError } = useTTS()
  const { voice } = useAccent()

  // queueRef：洗牌過的完整動物清單，整場遊戲固定不變，roundIdx 依序往下取，
  // 確保 TOTAL_ROUNDS ≤ 17 種動物數量時，目標動物一定不重複。
  const queueRef = useRef(shuffle(ANIMALS))
  const [roundIdx, setRoundIdx] = useState(0) // 0-based
  const target = queueRef.current[roundIdx % queueRef.current.length]
  const [options, setOptions] = useState(() => buildOptions(target))

  const [wrongId, setWrongId] = useState(null)
  const [caughtId, setCaughtId] = useState(null)
  const [mistakesThisRound, setMistakesThisRound] = useState(0)
  const [totalStars, setTotalStars] = useState(0)
  const [finished, setFinished] = useState(false)

  const askTargetRef = useRef(null)
  askTargetRef.current = () => {
    speakAnimal(target, { lang: voice.languageCode, voice: voice.female, rate: 0.75 })
  }

  useEffect(() => {
    askTargetRef.current?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx])

  const handleTap = (animal) => {
    if (caughtId) return
    if (animal.id === target.id) {
      setCaughtId(animal.id)
      const stars = roundStars(mistakesThisRound)
      setTotalStars((s) => s + stars)
      speakAnimal(animal, { lang: voice.languageCode, voice: voice.female, rate: 0.75 })
      setTimeout(() => {
        if (roundIdx + 1 >= TOTAL_ROUNDS) {
          setFinished(true)
        } else {
          const nextIdx = roundIdx + 1
          const nextTarget = queueRef.current[nextIdx % queueRef.current.length]
          setOptions(buildOptions(nextTarget))
          setRoundIdx(nextIdx)
          setMistakesThisRound(0)
          setCaughtId(null)
        }
      }, 1400)
    } else {
      setMistakesThisRound((m) => m + 1)
      setWrongId(animal.id)
      setTimeout(() => setWrongId(null), 450)
    }
  }

  const restart = () => {
    queueRef.current = shuffle(ANIMALS)
    setRoundIdx(0)
    setOptions(buildOptions(queueRef.current[0]))
    setMistakesThisRound(0)
    setCaughtId(null)
    setTotalStars(0)
    setFinished(false)
  }

  const maxStars = TOTAL_ROUNDS * 3
  const finalStars = Math.round((totalStars / maxStars) * 3)

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="🕹️ 抓動物" onBack={onBack} />

      {finished ? (
        <div className="max-w-sm mx-auto text-center bg-white rounded-3xl shadow-xl p-8 mt-6">
          <div className="text-6xl mb-2">🏆</div>
          <p className="text-2xl font-extrabold text-stone-700 mb-2">全部抓到了！</p>
          <div className="flex justify-center mb-4">
            <StarRating count={finalStars} />
          </div>
          <button
            onClick={restart}
            className="min-h-[72px] w-full rounded-3xl bg-orange-500 text-white text-xl font-bold shadow active:scale-95 transition-transform"
          >
            🔄 再玩一次
          </button>
        </div>
      ) : (
        <>
          <div className="text-center mb-2">
            <p className="text-stone-500 text-lg">第 {roundIdx + 1} / {TOTAL_ROUNDS} 關</p>
            {ttsError && <p className="text-red-500">🔇 {ttsError}</p>}
            <button
              onClick={() => askTargetRef.current?.()}
              className="min-h-[64px] px-6 rounded-3xl bg-sky-500 text-white text-xl font-bold shadow active:scale-95 transition-transform mt-1"
            >
              🔊 再聽一次：找找看是誰？
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto px-4 mt-6">
            {options.map((animal) => {
              const bg = CARD_BG[animal.color] || 'bg-orange-200'
              const border = CARD_BORDER[animal.color] || 'border-orange-400'
              const isCaught = caughtId === animal.id
              const isWrong = wrongId === animal.id
              return (
                <button
                  key={animal.id}
                  onClick={() => handleTap(animal)}
                  className={`rounded-3xl border-4 ${border} ${bg} shadow-md p-2 flex flex-col items-center
                    active:scale-95 transition-transform duration-150 animate-float
                    ${isCaught ? 'animate-pop ring-4 ring-emerald-400' : ''}
                    ${isWrong ? 'animate-shake' : ''}`}
                  style={{ animationDelay: `${Math.random() * 1.2}s` }}
                >
                  <img src={animal.pic} alt="" className="w-full aspect-square object-contain" draggable={false} />
                  {isCaught && <span className="text-2xl mt-1">✅</span>}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
