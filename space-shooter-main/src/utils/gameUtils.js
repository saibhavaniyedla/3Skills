export function createStars(W, H, count = 80) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.3,
    speed: Math.random() * 0.45 + 0.1,
    alpha: Math.random() * 0.6 + 0.3,
  }))
}

export function updateStars(stars, W, H) {
  stars.forEach(s => {
    s.y += s.speed
    if (s.y > H) { s.y = 0; s.x = Math.random() * W }
  })
}

export function spawnParticles(x, y, color, count = 8) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const speed = Math.random() * 2.5 + 1
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: Math.random() * 0.04 + 0.028,
      r: Math.random() * 3 + 1,
      color,
    }
  })
}

export function rectCollide(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

export function buildEnemyGrid(level, GRID_COLS, ENEMY_W, ENEMY_H) {
  const rows = Math.min(2 + level, 5)
  const enemies = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      enemies.push({
        id: `${r}-${c}`,
        x: 50 + c * 60,
        y: 30 + r * 42,
        w: ENEMY_W,
        h: ENEMY_H,
        type: r < 1 ? 2 : r < 3 ? 1 : 0,
        alive: true,
      })
    }
  }
  return enemies
}
