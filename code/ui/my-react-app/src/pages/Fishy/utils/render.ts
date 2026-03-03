import { PLAYER_COLORS } from '../constants/gameConfig'
import type { Fish, FishyState, GameDimensions, PlayerState } from '../interfaces'
import { getDread, lerpHex } from './math'

type FishyRenderContext = {
  ctx: CanvasRenderingContext2D
  state: FishyState
  dimensions: GameDimensions
}

function drawFishBody(ctx: CanvasRenderingContext2D, fishSize: number, fishColor: string): void {
  ctx.fillStyle = fishColor
  ctx.beginPath()
  ctx.ellipse(0, 0, fishSize, fishSize * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()
}

export function drawBackground(renderContext: FishyRenderContext, timestamp: number): void {
  const { ctx, state, dimensions } = renderContext
  const dread = getDread(state.eaten)
  const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.H())
  gradient.addColorStop(0, lerpHex('#1a8fc4', '#1a0505', dread))
  gradient.addColorStop(0.3, lerpHex('#1578a8', '#120304', dread))
  gradient.addColorStop(0.7, lerpHex('#0d5f8a', '#080102', dread))
  gradient.addColorStop(1, lerpHex('#062a45', '#000000', dread))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, dimensions.W(), dimensions.H())

  if (dread < 0.85) {
    ctx.save()
    ctx.globalAlpha = 0.06 * (1 - dread)
    for (let i = 0; i < 7; i += 1) {
      const rayX = (i * dimensions.W() / 6) + Math.sin(timestamp * 0.0003 + i) * 40
      const rayW = 30 + Math.sin(timestamp * 0.0005 + i * 2) * 15
      const rayGradient = ctx.createLinearGradient(rayX, 0, rayX, dimensions.H() * 0.8)
      rayGradient.addColorStop(0, dread > 0.5 ? '#4a0000' : '#fffbe6')
      rayGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = rayGradient
      ctx.beginPath()
      ctx.moveTo(rayX - rayW, 0)
      ctx.lineTo(rayX + rayW, 0)
      ctx.lineTo(rayX + rayW * 2.5, dimensions.H() * 0.8)
      ctx.lineTo(rayX - rayW * 2.5, dimensions.H() * 0.8)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }

  ctx.globalAlpha = dread > 0.6 ? 0.04 + dread * 0.06 : 0.08 * (1 - dread * 0.5)
  for (let i = 0; i < 30; i += 1) {
    const cx = ((i * 173.7 + timestamp * 0.02) % (dimensions.W() + 100)) - 50
    const cy = ((i * 113.3 + timestamp * 0.015) % (dimensions.H() + 100)) - 50
    const r = Math.max(0, 10 + Math.sin(timestamp * 0.001 + i) * (6 + dread * 8))
    ctx.fillStyle = dread > 0.5 ? `rgba(120,0,0,${0.3 * dread})` : '#8dd8f8'
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

export function drawSeaweed(renderContext: FishyRenderContext, timestamp: number): void {
  const { ctx, state, dimensions } = renderContext
  const dread = getDread(state.eaten)
  if (dread > 0.95) return

  for (const seaweed of state.seaweeds) {
    ctx.save()
    ctx.fillStyle = dread > 0.4
      ? lerpHex(seaweed.color === '#0d6b3c' ? '#0d6b3c' : '#15803d', '#1a0a00', Math.min(1, dread * 1.5))
      : seaweed.color
    ctx.globalAlpha = 0.6 * (1 - dread * 0.8)

    const baseY = dimensions.H() - 1
    let prevX = seaweed.x
    let prevY = baseY
    const heightMult = 1 - dread * 0.7
    const segH = (seaweed.height * heightMult) / seaweed.segments

    for (let s = 0; s < seaweed.segments; s += 1) {
      const swayAmt = (8 + s * 3) * (1 + dread * 3)
      const sway = Math.sin(timestamp * (0.001 + dread * 0.003) + seaweed.phase + s * 0.5) * swayAmt
      const cx = seaweed.x + sway
      const cy = baseY - (s + 1) * segH
      const w = seaweed.width * (1 - s / seaweed.segments * 0.6) * (1 - dread * 0.5)

      ctx.beginPath()
      ctx.moveTo(prevX - w / 2, prevY)
      ctx.quadraticCurveTo(cx, cy + segH * 0.3, cx - w / 3, cy)
      ctx.lineTo(cx + w / 3, cy)
      ctx.quadraticCurveTo(cx, cy + segH * 0.3, prevX + w / 2, prevY)
      ctx.closePath()
      ctx.fill()

      prevX = cx
      prevY = cy
    }

    ctx.restore()
  }
}

export function drawFish(renderContext: FishyRenderContext, fish: Fish | PlayerState, isPlayer: boolean): void {
  const { ctx, state } = renderContext
  const dread = getDread(state.eaten)
  const facingRight = isPlayer ? state.pointer.x >= state.player.x : (fish as Fish).vx >= 0
  const fishColor = isPlayer ? PLAYER_COLORS[0] : (fish as Fish).color
  const fishSize = fish.size

  ctx.save()
  ctx.translate(fish.x, fish.y)
  if (!facingRight) ctx.scale(-1, 1)

  drawFishBody(ctx, fishSize, isPlayer ? lerpHex(PLAYER_COLORS[0], '#2a0a0a', Math.max(0, (dread - 0.5) * 2)) : fishColor)

  ctx.fillStyle = isPlayer ? PLAYER_COLORS[1] : fishColor
  ctx.beginPath()
  ctx.moveTo(-fishSize, 0)
  ctx.lineTo(-fishSize - fishSize * 0.75, -fishSize * 0.4)
  ctx.lineTo(-fishSize - fishSize * 0.75, fishSize * 0.4)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(fishSize * 0.4, -fishSize * 0.1, Math.max(2.5, fishSize * 0.16), 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = isPlayer && dread > 0.5 ? '#8b0000' : '#0f172a'
  ctx.beginPath()
  ctx.arc(fishSize * 0.45, -fishSize * 0.1, Math.max(1.5, fishSize * 0.09), 0, Math.PI * 2)
  ctx.fill()

  if (isPlayer && state.player.size >= 40) {
    ctx.font = `${Math.min(fishSize * 0.5, 24)}px serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = dread > 0.7 ? '#8b0000' : '#fbbf24'
    ctx.fillText(dread > 0.7 ? 'X' : '*', 0, -fishSize * 0.65)
  }

  ctx.restore()
}

export function drawBubbles(renderContext: FishyRenderContext, dt: number): void {
  const { ctx, state } = renderContext
  for (let i = state.bubbles.length - 1; i >= 0; i -= 1) {
    const bubble = state.bubbles[i]
    bubble.y -= bubble.speed * dt
    bubble.x += Math.sin(bubble.wobble) * 0.4
    bubble.wobble += 2 * dt
    bubble.alpha -= 0.12 * dt

    if (bubble.alpha <= 0 || bubble.y < -20) {
      state.bubbles.splice(i, 1)
      continue
    }

    ctx.globalAlpha = bubble.alpha
    ctx.strokeStyle = bubble.bloody ? '#8b0000' : '#cceeff'
    ctx.beginPath()
    ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

export function drawParticles(renderContext: FishyRenderContext, dt: number): void {
  const { ctx, state } = renderContext
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const particle = state.particles[i]
    particle.x += particle.vx * dt
    particle.y += particle.vy * dt
    particle.life -= 1.8 * dt

    if (particle.life <= 0) {
      state.particles.splice(i, 1)
      continue
    }

    ctx.globalAlpha = particle.life
    ctx.fillStyle = particle.color
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.r * particle.life, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

export function drawWhispers(renderContext: FishyRenderContext, dt: number): void {
  const { ctx, state } = renderContext
  for (let i = state.whispers.length - 1; i >= 0; i -= 1) {
    const whisper = state.whispers[i]
    whisper.life -= dt / whisper.maxLife
    whisper.y -= 6 * dt
    whisper.x += whisper.drift * dt

    if (whisper.life <= 0) {
      state.whispers.splice(i, 1)
      continue
    }

    const fadeIn = Math.min(1, (1 - whisper.life) * 5)
    const fadeOut = Math.min(1, whisper.life * 4)

    ctx.save()
    ctx.globalAlpha = Math.min(fadeIn, fadeOut) * 0.7
    ctx.fillStyle = getDread(state.eaten) > 0.7 ? '#aa0000' : '#ccaaaa'
    ctx.font = `italic ${whisper.size}px Georgia, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(whisper.text, whisper.x, whisper.y)
    ctx.restore()
  }
}

export function drawCombo(renderContext: FishyRenderContext): void {
  const { ctx, state, dimensions } = renderContext
  if (state.comboCount < 2 || state.comboTimer <= 0) return

  const dread = getDread(state.eaten)
  ctx.save()
  ctx.globalAlpha = Math.min(1, state.comboTimer)
  ctx.fillStyle = dread > 0.5 ? '#8b0000' : state.comboCount >= 5 ? '#fbbf24' : '#67e8f9'
  ctx.font = `800 ${Math.min(28 + state.comboCount * 3, 52)}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const bounce = Math.sin(Date.now() * 0.01) * 4
  const comboText = dread > 0.5 ? `${state.comboCount} consumed` : `${state.comboCount}x Combo`
  ctx.fillText(comboText, dimensions.W() / 2, 80 + bounce)
  ctx.restore()
}

export function drawVignette(renderContext: FishyRenderContext): void {
  const { ctx, state, dimensions } = renderContext
  const dread = getDread(state.eaten)
  if (dread < 0.1) return

  const gradient = ctx.createRadialGradient(
    dimensions.W() / 2,
    dimensions.H() / 2,
    Math.min(dimensions.W(), dimensions.H()) * (0.5 - dread * 0.25),
    dimensions.W() / 2,
    dimensions.H() / 2,
    Math.max(dimensions.W(), dimensions.H()) * 0.75,
  )
  gradient.addColorStop(0, 'transparent')
  gradient.addColorStop(1, `rgba(0,0,0,${dread * 0.85})`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, dimensions.W(), dimensions.H())
}
