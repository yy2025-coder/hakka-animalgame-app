import { useState } from 'react'
import TopBar from '../components/TopBar'
import AnimalCard from '../components/AnimalCard'
import { ANIMALS } from '../data/animals'
import { useTTS } from '../hooks/useTTS'
import { useAccent } from '../hooks/AccentContext'

export default function ListenPage({ onBack }) {
  const { speak, isPlaying, error } = useTTS()
  const { voice } = useAccent()
  const [activeId, setActiveId] = useState(null)
  const [flippedId, setFlippedId] = useState(null)

  const handleTap = async (animal) => {
    setActiveId(animal.id)
    await speak(animal.hanzi, { lang: voice.languageCode, voice: voice.female, rate: 0.75 })
    setFlippedId(animal.id)
    setTimeout(() => setFlippedId((cur) => (cur === animal.id ? null : cur)), 2200)
  }

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="👂 聽一聽" onBack={onBack} />
      <p className="text-center text-stone-500 mt-3 mb-2 text-lg">點動物卡片，聽客語怎麼說</p>
      {error && <p className="text-center text-red-500 mb-2">{error}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 max-w-4xl mx-auto">
        {ANIMALS.map((animal) => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            playing={isPlaying && activeId === animal.id}
            showCard={flippedId === animal.id}
            onClick={() => handleTap(animal)}
          />
        ))}
      </div>
    </div>
  )
}
