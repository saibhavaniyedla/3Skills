// ---------------------------------------------------------------------------
// draw.js — all canvas 2D drawing logic, completely decoupled from React
// ---------------------------------------------------------------------------

export function drawBackground(ctx, W, H) {
  ctx.fillStyle = '#07071a'
  ctx.fillRect(0, 0, W, H)
}

export function drawStars(ctx, stars) {
  stars.forEach(s => {
    ctx.globalAlpha = s.alpha
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1
}

export function drawPlayer(ctx, x, y) {
  ctx.save()
  ctx.translate(x, y)

  // Engine flame
  ctx.fillStyle = '#ff8822'
  ctx.beginPath()
  ctx.moveTo(-5, 12)
  ctx.lineTo(0, 22)
  ctx.lineTo(5, 12)
  ctx.closePath()
  ctx.fill()

  // Main body
  ctx.fillStyle = '#44aaff'
  ctx.beginPath()
  ctx.moveTo(0, -14)
  ctx.lineTo(16, 14)
  ctx.lineTo(8, 8)
  ctx.lineTo(-8, 8)
  ctx.lineTo(-16, 14)
  ctx.closePath()
  ctx.fill()

  // Cockpit
  ctx.fillStyle = '#99ddff'
  ctx.beginPath()
  ctx.moveTo(0, -10)
  ctx.lineTo(5, 2)
  ctx.lineTo(-5, 2)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

export function drawEnemy(ctx, e, frame) {
  ctx.save()
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2)

  if (e.type === 2) {
    // Commander — red UFO
    ctx.fillStyle = '#ff5555'
    ctx.beginPath()
    ctx.ellipse(0, 3, 13, 7, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffaaaa'
    ctx.beginPath()
    ctx.ellipse(0, -2, 7, 5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ff0000'
    const eyeOffset = frame % 2 === 0 ? -2 : 2
    ctx.beginPath()
    ctx.arc(eyeOffset - 4, 3, 2, 0, Math.PI * 2)
    ctx.arc(eyeOffset + 4, 3, 2, 0, Math.PI * 2)
    ctx.fill()
  } else if (e.type === 1) {
    // Soldier — purple fighter
    ctx.fillStyle = '#aa77ff'
    ctx.beginPath()
    ctx.moveTo(0, -11)
    ctx.lineTo(13, 6)
    ctx.lineTo(8, 11)
    ctx.lineTo(-8, 11)
    ctx.lineTo(-13, 6)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#ddbbff'
    const cx = frame % 2 === 0 ? -2 : 2
    ctx.beginPath()
    ctx.arc(cx, 0, 4, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // Grunt — green invader
    ctx.fillStyle = '#44ffaa'
    ctx.fillRect(-13, -7, 26, 14)
    ctx.fillStyle = '#22dd88'
    const legX = frame % 2 === 0 ? -3 : 3
    ctx.fillRect(-13 + legX, -12, 6, 7)
    ctx.fillRect(7 - legX, -12, 6, 7)
    ctx.fillStyle = '#000'
    ctx.fillRect(-6, -2, 4, 4)
    ctx.fillRect(2, -2, 4, 4)
  }

  ctx.restore()
}

export function drawBullet(ctx, b, isEnemy) {
  ctx.save()
  ctx.shadowColor = isEnemy ? '#ff8844' : '#44ffee'
  ctx.shadowBlur = 8
  ctx.fillStyle = isEnemy ? '#ff8844' : '#88ffee'
  ctx.fillRect(b.x - 2, b.y - 8, 4, 14)
  ctx.restore()
}

export function drawParticles(ctx, particles) {
  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1
}

export function drawBorder(ctx, W, H) {
  ctx.strokeStyle = '#1a2a4a'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, W, H)
}
