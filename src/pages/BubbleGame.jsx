import { useCallback, useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import StarRating from '../components/StarRating'
import { ANIMALS } from '../data/animals'
import { useTTS } from '../hooks/useTTS'
import { useAccent } from '../hooks/AccentContext'
import { CARD_BORDER } from '../utils/colors'

const TOTAL_ROUNDS = 3
const ROUND_SECONDS = 20
const SPAWN_INTERVAL = 600 // 毫秒，每隔多久冒一顆泡泡（縮短間隔讓泡泡更快出現）
const TARGET_CHANCE = 0.6 // 冒出來的泡泡是正確目標的機率（提高機率讓目標動物更常出現）
const MAX_BUBBLES = 9 // 畫面上同時存在的泡泡上限
const FLOAT_DURATION = 9 // 秒，泡泡從底部飄到頂部要花的時間

function pickTarget(excludeId) {
  const pool = ANIMALS.filter((a) => a.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}

function roundStars(correctCount) {
  if (correctCount >= 7) return 3
  if (correctCount >= 4) return 2
  if (correctCount >= 1) return 1
  return 0
}

let bubbleUid = 0

export default function BubbleGame({ onBack }) {
  const { speakAnimal, error: ttsError } = useTTS()
  const { voice } = useAccent()

  const [phase, setPhase] = useState('intro') // intro | playing | roundEnd | finished
  const [roundNo, setRoundNo] = useState(1)
  const [target, setTarget] = useState(() => pickTarget())
  const [bubbles, setBubbles] = useState([])
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [totalStars, setTotalStars] = useState(0)
  const [lastRoundStars, setLastRoundStars] = useState(0)

  const spawnTimerRef = useRef(null)
  const countdownRef = useRef(null)
  const poppingRef = useRef(new Set())
  // ⚠️ 坑：spawnBubble 會被放進 setInterval，如果它讀取的是 React state（target）
  // 透過閉包取值，setInterval 註冊當下鎖住的就是「舊的」target，之後 setTarget()
  // 觸發的重新 render 不會讓已經在跑的 interval 換成新的函式，導致新回合開始後
  // 冒出來的泡泡永遠對應到「上一輪」的目標動物，畫面上想找的動物泡泡因此完全不會出現。
  // 用 ref 讓 spawnBubble 每次執行時都讀到當下最新的目標，徹底避開這個問題。
  const targetRef = useRef(target)

  useEffect(() => {
    targetRef.current = target
  }, [target])

  const announceTarget = useCallback(
    (animal) => {
      speakAnimal(animal, { lang: voice.languageCode, voice: voice.female, rate: 0.75 })
    },
    [speakAnimal, voice]
  )

  const spawnBubble = useCallback(() => {
    setBubbles((prev) => {
      if (prev.length >= MAX_BUBBLES) return prev // 畫面上最多同時存在幾顆，避免太擁擠
      const currentTarget = targetRef.current
      const isTarget = Math.random() < TARGET_CHANCE
      const animal = isTarget ? currentTarget : pickTarget(currentTarget.id)
      const uid = bubbleUid++
      const duration = FLOAT_DURATION + Math.random() * 2.5
      const bubble = {
        uid,
        animal,
        left: 5 + Math.random() * 65, // 5% ~ 70%，泡泡變大後留更多邊界避免超出畫面
        duration,
      }
      // 泡泡飄到頂端沒被戳到就自動消失，避免卡在畫面上佔用名額（不扣分，維持低挫折感）
      setTimeout(() => {
        setBubbles((cur) => cur.filter((b) => b.uid !== uid))
      }, duration * 1000 + 150)
      return [...prev, bubble]
    })
  }, [])

  // 開始一個新回合：重置狀態、公布目標、開始冒泡與倒數
  const startRound = useCallback(
    (animal) => {
      setBubbles([])
      setCorrectCount(0)
      setTimeLeft(ROUND_SECONDS)
      setPhase('playing')
      poppingRef.current = new Set()
      announceTarget(animal)

      spawnTimerRef.current = setInterval(spawnBubble, SPAWN_INTERVAL)
      countdownRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(countdownRef.current)
            clearInterval(spawnTimerRef.current)
            return 0
          }
          return t - 1
        })
      }, 1000)
    },
    [announceTarget, spawnBubble]
  )

  useEffect(() => {
    return () => {
      clearInterval(spawnTimerRef.current)
      clearInterval(countdownRef.current)
    }
  }, [])

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      const stars = roundStars(correctCount)
      setLastRoundStars(stars)
      setTotalStars((s) => s + stars)
      setPhase('roundEnd')
      setBubbles([])
    }
  }, [timeLeft, phase, correctCount])

  const handleStart = () => {
    setRoundNo(1)
    const first = pickTarget()
    setTarget(first)
    startRound(first)
  }

  const handleNextRound = () => {
    if (roundNo >= TOTAL_ROUNDS) {
      setPhase('finished')
      return
    }
    const next = pickTarget()
    setTarget(next)
    setRoundNo((r) => r + 1)
    startRound(next)
  }

  const handleRestart = () => {
    setTotalStars(0)
    handleStart()
  }

  const popBubble = (bubble) => {
    if (poppingRef.current.has(bubble.uid)) return
    if (bubble.animal.id === target.id) {
      poppingRef.current.add(bubble.uid)
      setCorrectCount((c) => c + 1)
      setBubbles((prev) => prev.filter((b) => b.uid !== bubble.uid))
    } else {
      setBubbles((prev) =>
        prev.map((b) => (b.uid === bubble.uid ? { ...b, wrong: true } : b))
      )
      setTimeout(() => {
        setBubbles((prev) => prev.map((b) => (b.uid === bubble.uid ? { ...b, wrong: false } : b)))
      }, 400)
    }
  }

  const finalStars = Math.round((totalStars / (TOTAL_ROUNDS * 3)) * 3)

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="🫧 泡泡射擊" onBack={onBack} />

      {phase === 'intro' && (
        <div className="max-w-sm mx-auto text-center bg-white rounded-3xl shadow-xl p-8 mt-6">
          <div className="text-6xl mb-3">🫧🐯🫧</div>
          <p className="text-xl text-stone-600 mb-1">泡泡會從下面一直冒出來，</p>
          <p className="text-xl text-stone-600 mb-4">聽清楚要找哪隻動物，點對的泡泡把它戳破！</p>
          <button
            onClick={handleStart}
            className="min-h-[80px] w-full rounded-3xl bg-sky-500 text-white text-2xl font-extrabold shadow active:scale-95 transition-transform"
          >
            ▶️ 開始玩
          </button>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <div className="flex flex-col items-center gap-2 mt-2 mb-2">
            <p className="text-stone-500 text-lg">第 {roundNo} / {TOTAL_ROUNDS} 關．剩下 {timeLeft} 秒</p>
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow px-4 py-2">
              <span className="text-lg text-stone-500">找一找：</span>
              <img src={target.pic} alt={target.hanzi} className="w-12 h-12 object-contain" />
              <span className="text-2xl font-extrabold text-stone-700">{target.hanzi}</span>
              <button
                onClick={() => announceTarget(target)}
                className="min-h-[48px] min-w-[48px] rounded-2xl bg-sky-400 text-white text-xl active:scale-95 transition-transform"
              >
                🔊
              </button>
            </div>
            <p className="text-stone-400">已經戳到 {correctCount} 個 🎈</p>
            {ttsError && <p className="text-red-500">🔇 {ttsError}</p>}
          </div>

          <div className="relative mx-auto max-w-2xl h-[420px] overflow-hidden rounded-[2rem] bg-gradient-to-b from-sky-100 to-sky-200 border-4 border-sky-300 shadow-inner">
            {bubbles.map((b) => {
              const border = CARD_BORDER[b.animal.color] || 'border-sky-400'
              return (
                <button
                  key={b.uid}
                  onClick={() => popBubble(b)}
                  className={`absolute w-28 h-28 rounded-full bg-white/80 border-4 ${border} shadow-lg
                    flex items-center justify-center overflow-hidden active:scale-90 transition-transform
                    ${b.wrong ? 'animate-shake' : ''}`}
                  style={{
                    left: `${b.left}%`,
                    animation: `float-up ${b.duration}s linear forwards`,
                  }}
                >
                  <img src={b.animal.pic} alt="" className="w-20 h-20 object-contain" draggable={false} />
                </button>
              )
            })}
          </div>
          <style>{`
            @keyframes float-up {
              from { bottom: -90px; }
              to { bottom: 440px; }
            }
          `}</style>
        </>
      )}

      {phase === 'roundEnd' && (
        <div className="max-w-sm mx-auto text-center bg-white rounded-3xl shadow-xl p-8 mt-6">
          <div className="text-6xl mb-2">🎈</div>
          <p className="text-2xl font-extrabold text-stone-700 mb-1">第 {roundNo} 關結束！</p>
          <p className="text-lg text-stone-500 mb-3">戳到了 {correctCount} 個 {target.hanzi}</p>
          <div className="flex justify-center mb-4">
            <StarRating count={lastRoundStars} />
          </div>
          <button
            onClick={handleNextRound}
            className="min-h-[72px] w-full rounded-3xl bg-sky-500 text-white text-xl font-bold shadow active:scale-95 transition-transform"
          >
            {roundNo >= TOTAL_ROUNDS ? '🏁 看總成績' : '➡️ 下一關'}
          </button>
        </div>
      )}

      {phase === 'finished' && (
        <div className="max-w-sm mx-auto text-center bg-white rounded-3xl shadow-xl p-8 mt-6">
          <div className="text-6xl mb-2">🏆</div>
          <p className="text-2xl font-extrabold text-stone-700 mb-2">泡泡射擊完成！</p>
          <div className="flex justify-center mb-4">
            <StarRating count={finalStars} />
          </div>
          <button
            onClick={handleRestart}
            className="min-h-[72px] w-full rounded-3xl bg-sky-500 text-white text-xl font-bold shadow active:scale-95 transition-transform"
          >
            🔄 再玩一次
          </button>
        </div>
      )}
    </div>
  )
}
