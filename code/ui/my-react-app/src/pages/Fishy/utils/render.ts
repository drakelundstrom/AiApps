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
  
  // Check if close to winning - triggers special eye background
  const closeToWin = state.player.size >= 220 || state.score >= 3000
  const winProgress = Math.min(1, Math.max(
    (state.player.size - 220) / 80,
    (state.score - 3000) / 1000
  ))
  
  if (closeToWin && winProgress > 0) {
    // Dark void background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, dimensions.W(), dimensions.H())
    
    // Calculate zoom out effect
    const zoomOut = winProgress * 0.5 + 1 // 1.0 to 1.5x
    const eyeCenterX = dimensions.W() / 2
    const eyeCenterY = dimensions.H() / 2
    
    ctx.save()
    ctx.translate(eyeCenterX, eyeCenterY)
    ctx.scale(1 / zoomOut, 1 / zoomOut)
    ctx.translate(-eyeCenterX, -eyeCenterY)
    
    // Massive eye in the background
    const baseEyeSize = Math.max(dimensions.W(), dimensions.H()) * 0.8
    const pulse = Math.sin(timestamp * 0.001) * 0.05 + 1
    const eyeSize = baseEyeSize * pulse
    
    // Eye white/sclera with veins
    const eyeGradient = ctx.createRadialGradient(eyeCenterX, eyeCenterY, 0, eyeCenterX, eyeCenterY, eyeSize)
    eyeGradient.addColorStop(0, '#4a3a3a')
    eyeGradient.addColorStop(0.6, '#2a1a1a')
    eyeGradient.addColorStop(1, '#0a0000')
    ctx.fillStyle = eyeGradient
    ctx.beginPath()
    ctx.arc(eyeCenterX, eyeCenterY, eyeSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Blood vessels radiating from center
    ctx.strokeStyle = '#8b0000'
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.3 + winProgress * 0.3
    for (let i = 0; i < 20; i += 1) {
      const angle = (Math.PI * 2 * i) / 20 + Math.sin(timestamp * 0.0005 + i) * 0.2
      ctx.beginPath()
      ctx.moveTo(eyeCenterX + Math.cos(angle) * eyeSize * 0.3, eyeCenterY + Math.sin(angle) * eyeSize * 0.3)
      for (let j = 0; j < 5; j += 1) {
        const segmentRatio = j / 5
        const wobble = Math.sin(timestamp * 0.002 + i + j) * 30
        const x = eyeCenterX + Math.cos(angle + wobble * 0.01) * eyeSize * (0.3 + segmentRatio * 0.6)
        const y = eyeCenterY + Math.sin(angle + wobble * 0.01) * eyeSize * (0.3 + segmentRatio * 0.6)
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    
    // Iris
    const irisSize = eyeSize * 0.35
    const irisGradient = ctx.createRadialGradient(eyeCenterX, eyeCenterY, 0, eyeCenterX, eyeCenterY, irisSize)
    irisGradient.addColorStop(0, '#1a0000')
    irisGradient.addColorStop(0.6, '#8b0000')
    irisGradient.addColorStop(1, '#2a0000')
    ctx.fillStyle = irisGradient
    ctx.beginPath()
    ctx.arc(eyeCenterX, eyeCenterY, irisSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Pupil - watching
    const pupilSize = eyeSize * 0.15
    const pupilGradient = ctx.createRadialGradient(eyeCenterX, eyeCenterY, 0, eyeCenterX, eyeCenterY, pupilSize)
    pupilGradient.addColorStop(0, '#000000')
    pupilGradient.addColorStop(0.8, '#000000')
    pupilGradient.addColorStop(1, '#1a0000')
    ctx.fillStyle = pupilGradient
    ctx.beginPath()
    ctx.arc(eyeCenterX, eyeCenterY, pupilSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Pupil reflection
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.beginPath()
    ctx.arc(eyeCenterX - pupilSize * 0.3, eyeCenterY - pupilSize * 0.3, pupilSize * 0.3, 0, Math.PI * 2)
    ctx.fill()
    
    // As you zoom out, reveal tentacles/appendages lurking
    if (winProgress > 0.4) {
      const lurkerAlpha = (winProgress - 0.4) / 0.6
      ctx.globalAlpha = lurkerAlpha * 0.5
      
      // Writhing appendages around the eye
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8
        const tentacleLength = eyeSize * (1.3 + winProgress * 0.5)
        
        ctx.strokeStyle = '#0a0000'
        ctx.lineWidth = eyeSize * 0.08
        ctx.lineCap = 'round'
        ctx.beginPath()
        
        const startX = eyeCenterX + Math.cos(angle) * eyeSize * 1.1
        const startY = eyeCenterY + Math.sin(angle) * eyeSize * 1.1
        ctx.moveTo(startX, startY)
        
        const segments = 6
        for (let s = 1; s <= segments; s += 1) {
          const segmentRatio = s / segments
          const wobble = Math.sin(timestamp * 0.003 + i + s) * 0.4
          const x = eyeCenterX + Math.cos(angle + wobble) * tentacleLength * (1 + segmentRatio * 0.5)
          const y = eyeCenterY + Math.sin(angle + wobble) * tentacleLength * (1 + segmentRatio * 0.5)
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    
    ctx.restore()
    return
  }
  
  // Normal background
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
  const fishData = fish as Fish
  const fishColor = isPlayer ? PLAYER_COLORS[0] : fishData.color
  const fishSize = fish.size
  const isPredator = fishData.isPredator || false
  const distorted = fishData.distorted || false
  const eyeCount = fishData.eyeCount || 2

  ctx.save()
  ctx.translate(fish.x, fish.y)
  if (!facingRight && !isPredator) ctx.scale(-1, 1)

  // Draw predators as horrific non-fish entities
  if (isPredator) {
    const pulseTime = Date.now() * 0.003
    const pulse = Math.sin(pulseTime) * 0.15 + 1
    
    // Dark shadowy mass
    ctx.shadowBlur = 25 + Math.sin(pulseTime * 2) * 10
    ctx.shadowColor = '#ff0000'
    
    // Central amorphous blob
    ctx.fillStyle = fishColor
    ctx.globalAlpha = 0.85
    ctx.beginPath()
    for (let i = 0; i < 12; i += 1) {
      const angle = (Math.PI * 2 * i) / 12
      const wobble = Math.sin(pulseTime * 3 + i) * fishSize * 0.2
      const radius = fishSize * (0.7 + Math.sin(pulseTime + i * 0.5) * 0.3) + wobble
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius * 0.8
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()

    // Writhing tentacles
    const tentacleCount = 5 + Math.floor(eyeCount / 2)
    for (let t = 0; t < tentacleCount; t += 1) {
      const angle = (Math.PI * 2 * t) / tentacleCount + pulseTime * 0.5
      const tentacleLength = fishSize * (1.2 + Math.sin(pulseTime + t) * 0.4)
      
      ctx.strokeStyle = fishColor
      ctx.lineWidth = fishSize * 0.15 * (1 - Math.sin(pulseTime + t) * 0.3)
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.moveTo(0, 0)
      
      const segments = 4
      for (let s = 1; s <= segments; s += 1) {
        const segmentRatio = s / segments
        const x = Math.cos(angle + Math.sin(pulseTime * 2 + t + s) * 0.6) * tentacleLength * segmentRatio
        const y = Math.sin(angle + Math.sin(pulseTime * 2 + t + s) * 0.6) * tentacleLength * segmentRatio
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    ctx.globalAlpha = 1
    ctx.shadowBlur = 15
    
    // Many disturbing eyes scattered across the mass
    const actualEyeCount = Math.max(5, eyeCount)
    for (let i = 0; i < actualEyeCount; i += 1) {
      const angle = (Math.PI * 2 * i) / actualEyeCount + Math.sin(pulseTime + i) * 0.3
      const dist = fishSize * (0.3 + Math.sin(pulseTime * 2 + i) * 0.2)
      const eyeX = Math.cos(angle) * dist
      const eyeY = Math.sin(angle) * dist * 0.7
      const eyeSize = fishSize * (0.12 + Math.sin(pulseTime * 3 + i) * 0.04)
      
      // Eye white
      ctx.fillStyle = '#fff'
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.ellipse(eyeX, eyeY, eyeSize, eyeSize * 1.3, angle, 0, Math.PI * 2)
      ctx.fill()
      
      // Glowing red pupil
      ctx.fillStyle = '#ff0000'
      ctx.globalAlpha = 0.95
      ctx.beginPath()
      ctx.arc(eyeX + eyeSize * 0.15, eyeY, eyeSize * 0.5, 0, Math.PI * 2)
      ctx.fill()
      
      // Pupil glow
      ctx.fillStyle = '#8b0000'
      ctx.globalAlpha = 0.4
      ctx.beginPath()
      ctx.arc(eyeX + eyeSize * 0.15, eyeY, eyeSize * 0.8, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
    ctx.restore()
    return
  }

  // Distort shape for wrong-looking fish
  if (distorted && !isPlayer) {
    ctx.scale(1, 0.7 + Math.random() * 0.6)
  }

  drawFishBody(ctx, fishSize, isPlayer ? lerpHex(PLAYER_COLORS[0], '#2a0a0a', Math.max(0, (dread - 0.5) * 2)) : fishColor)

  // Tail
  ctx.fillStyle = isPlayer ? PLAYER_COLORS[1] : fishColor
  ctx.beginPath()
  ctx.moveTo(-fishSize, 0)
  ctx.lineTo(-fishSize - fishSize * 0.75, -fishSize * 0.4)
  ctx.lineTo(-fishSize - fishSize * 0.75, fishSize * 0.4)
  ctx.closePath()
  ctx.fill()

  // Draw multiple eyes for distorted fish
  if (!isPlayer) {
    const actualEyeCount = eyeCount
    
    if (actualEyeCount <= 2) {
      // Normal eye
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(fishSize * 0.4, -fishSize * 0.1, Math.max(2.5, fishSize * 0.16), 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.arc(fishSize * 0.45, -fishSize * 0.1, Math.max(1.5, fishSize * 0.09), 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Multiple wrong eyes
      for (let i = 0; i < actualEyeCount; i += 1) {
        const angle = (Math.PI * 2 * i) / actualEyeCount
        const eyeX = fishSize * 0.3 + Math.cos(angle) * fishSize * 0.25
        const eyeY = Math.sin(angle) * fishSize * 0.3
        const eyeSize = Math.max(2, fishSize * (0.1 + Math.random() * 0.08))

        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#0f172a'
        ctx.beginPath()
        ctx.arc(eyeX + eyeSize * 0.2, eyeY, eyeSize * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else {
    // Player eyes
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(fishSize * 0.4, -fishSize * 0.1, Math.max(2.5, fishSize * 0.16), 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = isPlayer && dread > 0.5 ? '#8b0000' : '#0f172a'
    ctx.beginPath()
    ctx.arc(fishSize * 0.45, -fishSize * 0.1, Math.max(1.5, fishSize * 0.09), 0, Math.PI * 2)
    ctx.fill()
  }

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
