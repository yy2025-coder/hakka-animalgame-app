import { useEffect, useState } from 'react'
import { useTTS } from '../hooks/useTTS'
import { useASR, calcScore, scoreToStars } from '../hooks/useASR'
import { useAccent } from '../hooks/AccentContext'
import StarRating from './StarRating'
import { CARD_BG, CARD_BORDER } from '../utils/colors'

const FEEDBACK = {
  3: { text: '講到蓋好！', emoji: '🌟' },
  2: { text: '真棒，越來越準了！', emoji: '👏' },
  1: { text: '有進步，再試一次！', emoji: '💪' },
  0: { text: '再聽一次模仿看看！', emoji: '🙂' },
}

export default function SpeakPractice({ animal, onNext, showNext = true }) {
  const { speak, isPlaying } = useTTS()
  const { voice } = useAccent()
  const { startListening, stopListening, isRecording, isConnecting, transcript, error } = useASR()
  const [score, setScore] = useState(null)
  const [stars, setStars] = useState(null)
  const [waitingResult, setWaitingResult] = useState(false)

  useEffect(() => {
    setScore(null)
    setStars(null)
    setWaitingResult(false)
  }, [animal.id])

  const playModel = () => speak(animal.hanzi, { lang: voice.languageCode, voice: voice.female, rate: 0.75 })

  const handleRecord = () => {
    if (isRecording) {
      setWaitingResult(true)
      stopListening()
      return
    }
    setScore(null)
    setStars(null)
    startListening({
      modelName: 'hakka-bun-1023',
      onDone: (finalText) => {
        setWaitingResult(false)
        const s = calcScore(animal.hanzi, finalText)
        setScore(s)
        setStars(scoreToStars(s))
      },
    })
  }

  const bg = CARD_BG[animal.color] || 'bg-orange-200'
  const border = CARD_BORDER[animal.color] || 'border-orange-400'

  return (
    <div className={`max-w-md mx-auto rounded-[2rem] border-4 ${border} ${bg} shadow-xl p-6 flex flex-col items-center gap-4`}>
      {animal.pic ? (
        <img src={animal.pic} alt={animal.hanzi} className="w-48 h-36 object-contain bg-white/60 rounded-2xl" draggable={false} />
      ) : (
        <div className="w-48 h-36 flex items-center justify-center bg-white/60 rounded-2xl text-7xl">
          {animal.emoji || '📚'}
        </div>
      )}
      <div className="text-4xl font-extrabold text-stone-700 text-center">{animal.hanzi}</div>
      {animal.pinyin && <div className="text-stone-500 text-lg">{animal.pinyin}</div>}

      <button
        onClick={playModel}
        className={`min-h-[72px] w-full rounded-3xl bg-sky-500 text-white text-xl font-bold shadow active:scale-95 transition-transform flex items-center justify-center gap-2 ${isPlaying ? 'animate-pop' : ''}`}
      >
        🔊 先聽老師講
      </button>

      <button
        onClick={handleRecord}
        disabled={isConnecting || waitingResult}
        className={`min-h-[88px] w-full rounded-3xl text-white text-2xl font-extrabold shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3
          ${isRecording ? 'bg-red-500 animate-wiggle' : 'bg-emerald-500'} disabled:opacity-60`}
      >
        {isConnecting
          ? '連線中…'
          : waitingResult
          ? '⏳ 評分中…'
          : isRecording
          ? '🛑 講完了，停止'
          : '🎤 換你講講看'}
      </button>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {transcript && (
        <p className="text-stone-500 text-lg">
          我聽到：<span className="font-bold text-stone-700">{transcript}</span>
        </p>
      )}

      {stars !== null && (
        <div className="flex flex-col items-center gap-1 mt-1">
          <StarRating count={stars} />
          <p className="text-xl font-bold text-stone-600">
            {FEEDBACK[stars].emoji} {FEEDBACK[stars].text}
          </p>
        </div>
      )}

      {showNext && onNext && (
        <button
          onClick={onNext}
          className="min-h-[64px] w-full rounded-3xl bg-white text-stone-600 text-xl font-bold shadow active:scale-95 transition-transform mt-1"
        >
          下一個 ➡️
        </button>
      )}
    </div>
  )
}
