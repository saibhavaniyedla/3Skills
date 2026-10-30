import { useRef, useEffect, useCallback } from 'react'
import { useKeyboard } from '../hooks/useKeyboard'
import { useGameLoop } from '../hooks/useGameLoop'
import {
  createStars, updateStars, spawnParticles,
  rectCollide, buildEnemyGrid,
} from '../utils/gameUtils'
import {
  drawBackground, drawStars, drawPlayer, drawEnemy,
  drawBullet, drawParticles, drawBorder,
} from '../utils/draw'
import {
  CANVAS_W, CANVAS_H, PLAYER, BULLET_SPEED,
  ENEMY_BULLET_SPEED_BASE, SHOOT_COOLDOWN,
  ENEMY_TYPES, GRID_COLS, ENEMY_W, ENEMY_H,
} from '../utils/constants'

export default function GameCanvas({ running, onScoreChange, onLivesChange, onLevelChange, onGameOver, level }) {
  const canvasRef = useRef(null)
  const keys = useKeyboard()

  // All mutable game state in a single ref — avoids stale closures in rAF
  const gs = useRef(null)

  // Initialise / reset game state
  const resetLevel = useCallback((lvl, keepPlayer = false) => {
    const prev = gs.current
    gs.current = {
      player: keepPlayer && prev
        ? { ...prev.player }
        : { x: CANVAS_W / 2, y: CANVAS_H - 52, ...PLAYER },
      bullets: [],
      enemyBullets: [],
      enemies: buildEnemyGrid(lvl, GRID_COLS, ENEMY_W, ENEMY_H),
      particles: keepPlayer && prev ? prev.particles : [],
      stars: keepPlayer && prev ? prev.stars : createStars(CANVAS_W, CANVAS_H),
      shootCooldown: 0,
      enemyDir: 1,
      enemyMoveDown: false,
      enemyShootTimer: 0,
      animFrame: 0,
      frameCount: 0,
    }
  }, [])

  // Full new game
  const initGame = useCallback((lvl = 1) => {
    resetLevel(lvl, false)
  }, [resetLevel])

  // Kick off when `running` flips to true
  useEffect(() => {
    if (running) initGame(level)
  }, [running]) // eslint-disable-line

  // The main game tick
  const tick = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const g = gs.current
    if (!g) return

    g.frameCount++
    if (g.frameCount % 20 === 0) g.animFrame = (g.animFrame + 1) % 2

    // --- Background ---
    drawBackground(ctx, CANVAS_W, CANVAS_H)
    updateStars(g.stars, CANVAS_W, CANVAS_H)
    drawStars(ctx, g.stars)

    // --- Player movement ---
    const p = g.player
    if (keys.current['ArrowLeft']  && p.x - p.w / 2 > 2)          p.x -= p.speed
    if (keys.current['ArrowRight'] && p.x + p.w / 2 < CANVAS_W - 2) p.x += p.speed

    // --- Shooting ---
    if (keys.current[' '] && g.shootCooldown <= 0) {
      g.bullets.push({ x: p.x, y: p.y - 14 })
      g.shootCooldown = SHOOT_COOLDOWN
    }
    if (g.shootCooldown > 0) g.shootCooldown--

    // --- Player bullets ---
    g.bullets = g.bullets.filter(b => b.y > -12)
    g.bullets.forEach(b => { b.y -= BULLET_SPEED })

    // --- Enemy movement ---
    const liveEnemies = g.enemies.filter(e => e.alive)
    if (liveEnemies.length === 0) {
      // Level complete
      const nextLevel = level + 1
      onLevelChange(nextLevel)
      resetLevel(nextLevel, true)
      return
    }

    const killed = g.enemies.length - liveEnemies.length
    const speed = 0.55 + killed * 0.055 + (level - 1) * 0.22
    let minX = Infinity, maxX = -Infinity
    liveEnemies.forEach(e => { minX = Math.min(minX, e.x); maxX = Math.max(maxX, e.x + e.w) })

    if (maxX + speed * g.enemyDir > CANVAS_W - 4 || minX + speed * g.enemyDir < 4) {
      g.enemyDir *= -1
      g.enemyMoveDown = true
    }

    let invaded = false
    g.enemies.forEach(e => {
      if (!e.alive) return
      e.x += speed * g.enemyDir
      if (g.enemyMoveDown) e.y += 14
      if (e.y + e.h >= p.y - 10) invaded = true
    })
    g.enemyMoveDown = false

    if (invaded) { onGameOver(); return }

    // --- Enemy drawing + bullet collision ---
    g.enemies.forEach(e => {
      if (!e.alive) return
      drawEnemy(ctx, e, g.animFrame)

      g.bullets.forEach((b, bi) => {
        if (rectCollide(b.x - 2, b.y - 8, 4, 14, e.x, e.y, e.w, e.h)) {
          e.alive = false
          g.bullets.splice(bi, 1)
          onScoreChange(prev => prev + ENEMY_TYPES[e.type].points)
          g.particles.push(...spawnParticles(
            e.x + e.w / 2, e.y + e.h / 2,
            ENEMY_TYPES[e.type].color, 10
          ))
        }
      })
    })

    // --- Enemy shooting ---
    const shootRate = Math.max(28, 75 - level * 5)
    g.enemyShootTimer++
    if (g.enemyShootTimer >= shootRate) {
      g.enemyShootTimer = 0
      const alive = g.enemies.filter(e => e.alive)
      const shooter = alive[Math.floor(Math.random() * alive.length)]
      if (shooter) {
        g.enemyBullets.push({ x: shooter.x + shooter.w / 2, y: shooter.y + shooter.h })
      }
    }

    // --- Enemy bullets ---
    const ebSpeed = ENEMY_BULLET_SPEED_BASE + (level - 1) * 0.4
    g.enemyBullets = g.enemyBullets.filter(b => b.y < CANVAS_H + 12)
    g.enemyBullets.forEach((b, bi) => {
      b.y += ebSpeed
      drawBullet(ctx, b, true)
      if (rectCollide(b.x - 2, b.y - 8, 4, 14, p.x - p.w / 2, p.y - p.h / 2, p.w, p.h)) {
        g.enemyBullets.splice(bi, 1)
        g.particles.push(...spawnParticles(p.x, p.y, '#44aaff', 12))
        onLivesChange(prev => {
          const next = prev - 1
          if (next <= 0) onGameOver()
          return next
        })
      }
    })

    // --- Player bullets draw ---
    g.bullets.forEach(b => drawBullet(ctx, b, false))

    // --- Particles ---
    g.particles = g.particles.filter(p => p.life > 0)
    g.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= p.decay })
    drawParticles(ctx, g.particles)

    // --- Player ---
    drawPlayer(ctx, p.x, p.y)

    drawBorder(ctx, CANVAS_W, CANVAS_H)
  }, [keys, level, onScoreChange, onLivesChange, onLevelChange, onGameOver, resetLevel])

  useGameLoop(tick, running)

  // Draw static starfield when not running
  useEffect(() => {
    if (running) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const stars = createStars(CANVAS_W, CANVAS_H)
    drawBackground(ctx, CANVAS_W, CANVAS_H)
    drawStars(ctx, stars)
  }, [running])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="block border border-space-border"
      style={{ cursor: 'none' }}
    />
  )
}
