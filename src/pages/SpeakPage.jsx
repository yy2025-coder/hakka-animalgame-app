import { useState } from 'react'
import TopBar from '../components/TopBar'
import AnimalCard from '../components/AnimalCard'
import SpeakPractice from '../components/SpeakPractice'
import { ANIMALS } from '../data/animals'

export default function SpeakPage({ onBack }) {
  const [selected, setSelected] = useState(null)

  const pickRandom = () => {
    const idx = Math.floor(Math.random() * ANIMALS.length)
    setSelected(ANIMALS[idx])
  }

  if (selected) {
    return (
      <div className="min-h-screen pb-10">
        <TopBar title="🎤 說一說" onBack={() => setSelected(null)} />
        <div className="px-4 mt-4">
          <SpeakPractice animal={selected} showNext={false} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="🎤 說一說" onBack={onBack} />
      <p className="text-center text-stone-500 mt-3 mb-2 text-lg">選一隻動物，跟著客語念念看</p>
      <div className="flex justify-center mb-4">
        <button
          onClick={pickRandom}
          className="min-h-[64px] px-6 rounded-3xl bg-rose-500 text-white text-xl font-bold shadow active:scale-95 transition-transform"
        >
          🎲 隨機挑一個
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 max-w-4xl mx-auto">
        {ANIMALS.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} onClick={() => setSelected(animal)} />
        ))}
      </div>
    </div>
  )
}
