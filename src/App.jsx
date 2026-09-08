import { useState } from 'react'
import Countdown from './components/Countdown.jsx'
import KeoGame from './components/KeoGame.jsx'
import { useGlobalRecord } from './hooks/useGlobalRecord.js'

function App() {
  const [gameActive, setGameActive] = useState(false)
  const globalRecord = useGlobalRecord()

  return (
    <main className={`page ${gameActive ? 'page-game-active' : ''}`}>
      <Countdown />
      <KeoGame
        globalRecord={globalRecord}
        onStart={() => setGameActive(true)}
        onReturn={() => setGameActive(false)}
      />
    </main>
  )
}

export default App
