// HUD.jsx — Heads-Up Display shown above the canvas
export default function HUD({ score, level, lives, maxLives = 3 }) {
  return (
    <div className="flex items-center justify-between w-full px-1 py-2 font-mono text-xs tracking-widest select-none">
      {/* Score */}
      <div className="hud-panel min-w-[130px]">
        <span className="text-space-blue/60 mr-2">SCORE</span>
        <span className="text-space-cyan">{String(score).padStart(6, '0')}</span>
      </div>

      {/* Level */}
      <div className="hud-panel">
        <span className="text-space-blue/60 mr-2">LEVEL</span>
        <span className="text-space-green">{level}</span>
      </div>

      {/* Lives */}
      <div className="hud-panel min-w-[130px] text-right">
        <span className="text-space-blue/60 mr-2">LIVES</span>
        {Array.from({ length: maxLives }).map((_, i) => (
          <span
            key={i}
            className={`text-base ${i < lives ? 'text-space-red' : 'text-space-border'}`}
          >
            ♥
          </span>
        ))}
      </div>
    </div>
  )
}
