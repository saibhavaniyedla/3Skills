import { useState, useCallback } from 'react'
import GameCanvas from './components/GameCanvas'
import HUD from './components/HUD'
import Overlay from './components/Overlay'

// Game states: 'idle' | 'playing' | 'gameover'
export default function App() {
  const [gameState, setGameState] = useState('idle')
  const [score, setScore]   = useState(0)
  const [lives, setLives]   = useState(3)
  const [level, setLevel]   = useState(1)

  const startGame = useCallback(() => {
    setScore(0)
    setLives(3)
    setLevel(1)
    setGameState('playing')
  }, [])

  const handleGameOver = useCallback(() => {
    setGameState('gameover')
  }, [])

  const handleLevelChange = useCallback((nextLevel) => {
    setLevel(nextLevel)
  }, [])

  return (
    <div className="min-h-screen bg-space-bg flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-0 relative">

        {/* Header */}
        <div className="w-full flex items-center justify-between mb-1 px-1">
          <span className="text-space-blue/30 text-xs tracking-[0.3em] font-mono uppercase">
            Internship Project
          </span>
          <span className="text-space-blue/20 text-xs tracking-widest font-mono">
            React + Tailwind
          </span>
        </div>

        {/* HUD */}
        <HUD score={score} level={level} lives={lives} />

        {/* Canvas + Overlay wrapper */}
        <div className="relative">
          <GameCanvas
            running={gameState === 'playing'}
            level={level}
            onScoreChange={setScore}
            onLivesChange={setLives}
            onLevelChange={handleLevelChange}
            onGameOver={handleGameOver}
          />

          {gameState !== 'playing' && (
            <Overlay
              type={gameState}
              score={score}
              level={level}
              onStart={startGame}
            />
          )}
        </div>

        {/* Footer hint */}
        <p className="text-space-blue/20 text-xs tracking-widest mt-3 font-mono">
          ← → MOVE &nbsp;|&nbsp; SPACE SHOOT
        </p>
      </div>
    </div>
  )
}
