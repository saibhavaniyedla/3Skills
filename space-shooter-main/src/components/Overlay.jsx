// Overlay.jsx — shown before game starts and on game over
export default function Overlay({ type, score, level, onStart }) {
  const isOver = type === 'gameover'

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center
                    bg-space-bg/90 z-10 gap-5 rounded">
      {/* Title */}
      <h1 className={`text-3xl tracking-[0.2em] uppercase font-mono
                      ${isOver ? 'text-space-red' : 'text-space-cyan'}`}>
        {isOver ? 'GAME OVER' : 'SPACE SHOOTER'}
      </h1>

      {/* Stats (only on game over) */}
      {isOver && (
        <div className="flex gap-6 text-sm text-space-blue/80 tracking-widest">
          <span>SCORE <span className="text-space-cyan ml-1">{score}</span></span>
          <span>LEVEL <span className="text-space-green ml-1">{level}</span></span>
        </div>
      )}

      {/* Controls hint (only on start) */}
      {!isOver && (
        <div className="text-space-blue/50 text-xs tracking-widest text-center leading-loose">
          <p>← → &nbsp; MOVE</p>
          <p>SPACE &nbsp; SHOOT</p>
          <p>Destroy all enemies to advance</p>
        </div>
      )}

      {/* High score badge on game over */}
      {isOver && score > 0 && (
        <p className="text-space-amber text-xs tracking-widest animate-pulse">
          ★ WELL PLAYED ★
        </p>
      )}

      <button className="btn-space mt-2" onClick={onStart}>
        {isOver ? 'PLAY AGAIN' : 'START GAME'}
      </button>
    </div>
  )
}
