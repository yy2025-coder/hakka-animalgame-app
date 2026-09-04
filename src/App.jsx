import { useState } from 'react'
import { AccentProvider } from './hooks/AccentContext'
import Home from './pages/Home'
import ListenPage from './pages/ListenPage'
import GamesHub from './pages/GamesHub'
import MatchGame from './pages/MatchGame'
import CatchGame from './pages/CatchGame'
import BubbleGame from './pages/BubbleGame'

export default function App() {
  const [view, setView] = useState('home')

  const goHome = () => setView('home')
  const goGamesHub = () => setView('games')

  let page
  switch (view) {
    case 'listen':
      page = <ListenPage onBack={goHome} />
      break
    case 'games':
      page = <GamesHub onBack={goHome} onNavigate={setView} />
      break
    case 'game-match':
      page = <MatchGame onBack={goGamesHub} />
      break
    case 'game-catch':
      page = <CatchGame onBack={goGamesHub} />
      break
    case 'game-bubble':
      page = <BubbleGame onBack={goGamesHub} />
      break
    default:
      page = <Home onNavigate={setView} />
  }

  return <AccentProvider>{page}</AccentProvider>
}
