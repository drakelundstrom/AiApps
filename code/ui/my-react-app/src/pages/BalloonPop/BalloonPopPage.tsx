import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent, TouchEvent } from 'react'
import type { Balloon, BalloonCanvasSize, BalloonParticle } from './interfaces'
import { styles } from './constants/styles'
import { createAudioContext, playPop, startMusic } from './audio/audioEngine'
import { makeBalloon } from './utils/makeBalloon'

function drawBalloonBody(ctx: CanvasRenderingContext2D, balloon: Balloon, cx: number, cy: number, scale = 1): void {
  const width = balloon.size * 0.38 * scale
  const height = balloon.size * 0.5 * scale

  ctx.fillStyle = balloon.color
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = Math.max(1.5, balloon.size * 0.03)
  ctx.beginPath()

  switch (balloon.shape) {
    case 'oval':
      ctx.ellipse(cx, cy, width * 0.85, height * 1.1, 0, 0, Math.PI * 2)
      break
    case 'diamond':
      ctx.moveTo(cx, cy - height)
      ctx.lineTo(cx + width, cy)
      ctx.lineTo(cx, cy + height)
      ctx.lineTo(cx - width, cy)
      ctx.closePath()
      break
    case 'heart': {
      const topY = cy - height * 0.2
      ctx.moveTo(cx, cy + height)
      ctx.bezierCurveTo(cx - width * 1.2, cy + height * 0.35, cx - width * 1.2, topY, cx, topY)
      ctx.bezierCurveTo(cx + width * 1.2, topY, cx + width * 1.2, cy + height * 0.35, cx, cy + height)
      break
    }
    case 'star': {
      const spikes = 5
      const outer = Math.max(width, height)
      const inner = outer * 0.45
      const step = Math.PI / spikes
      ctx.moveTo(cx, cy - outer)
      for (let i = 1; i < spikes * 2; i += 1) {
        const radius = i % 2 === 0 ? outer : inner
        const angle = -Math.PI / 2 + i * step
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
      }
      ctx.closePath()
      break
    }
    case 'round':
    default:
      ctx.ellipse(cx, cy, width, height, 0, 0, Math.PI * 2)
      break
  }

  ctx.fill()
  ctx.stroke()

  ctx.save()
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(cx - width * 0.35, cy - height * 0.35, width * 0.22, height * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.strokeStyle = `${balloon.color}88`
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, cy + height * 0.8)
  ctx.quadraticCurveTo(cx + width * 0.2, cy + height * 1.25, cx, cy + height * 1.55)
  ctx.stroke()
}

export default function BalloonPopPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const balloonsRef = useRef<Balloon[]>([])
  const poppedParticlesRef = useRef<BalloonParticle[]>([])
  const animFrameRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const stopMusicRef = useRef<(() => void) | null>(null)
  const [started, setStarted] = useState(false)
  const scoreRef = useRef(0)
  const sizeRef = useRef<BalloonCanvasSize>({ w: 800, h: 600, dpr: 1 })
  const lastSpawnRef = useRef(0)

  const updateSize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const w = parent.clientWidth
    const h = parent.clientHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    sizeRef.current = { w, h, dpr }
  }, [])

  const handleStart = useCallback(() => {
    const ctx = createAudioContext()
    audioCtxRef.current = ctx
    stopMusicRef.current = startMusic(ctx)
    setStarted(true)

    const { w, h } = sizeRef.current
    balloonsRef.current = []
    for (let i = 0; i < 12; i += 1) {
      const balloon = makeBalloon(w, h)
      balloon.y = Math.random() * h
      balloonsRef.current.push(balloon)
    }
  }, [])

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (!started) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    let popped = false
    balloonsRef.current.forEach((balloon) => {
      if (balloon.popping) return
      const bx = balloon.x + balloon.size / 2
      const by = balloon.y + balloon.size / 2
      const dist = Math.hypot(x - bx, y - by)
      if (dist >= balloon.size * 0.6) return

      balloon.popping = true
      balloon.popTime = performance.now()
      popped = true

      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8
        poppedParticlesRef.current.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * (2 + Math.random() * 3),
          vy: Math.sin(angle) * (2 + Math.random() * 3),
          size: 4 + Math.random() * 6,
          color: balloon.color,
          life: 1,
        })
      }
    })

    if (popped && audioCtxRef.current) {
      playPop(audioCtxRef.current)
      scoreRef.current += 1
    }
  }, [started])

  const onPointerDown = useCallback((
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    if ('touches' in e) {
      for (let i = 0; i < e.touches.length; i += 1) {
        handleInteraction(e.touches[i].clientX, e.touches[i].clientY)
      }
      return
    }
    handleInteraction(e.clientX, e.clientY)
  }, [handleInteraction])

  useEffect(() => {
    if (!started) return

    updateSize()
    window.addEventListener('resize', updateSize)
    let prevTime = performance.now()

    const loop = (now: number) => {
      const dt = Math.min((now - prevTime) / 16.67, 3)
      prevTime = now
      const { w, h, dpr } = sizeRef.current
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#0f0c29')
      grad.addColorStop(0.5, '#302b63')
      grad.addColorStop(1, '#24243e')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      for (let i = 0; i < 40; i += 1) {
        const sx = (i * 137.5) % w
        const sy = (i * 97.3) % h
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(now * 0.001 + i))
        ctx.globalAlpha = twinkle * 0.6
        ctx.beginPath()
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      if (now - lastSpawnRef.current > 800) {
        balloonsRef.current.push(makeBalloon(w, h))
        lastSpawnRef.current = now
      }

      const activeBalloons: Balloon[] = []
      for (const balloon of balloonsRef.current) {
        const cx = balloon.x + balloon.size / 2
        const cy = balloon.y + balloon.size / 2

        if (balloon.popping) {
          if (now - balloon.popTime > 300) continue
          const t = (now - balloon.popTime) / 300
          ctx.globalAlpha = 1 - t
          drawBalloonBody(ctx, balloon, cx, cy, 1 + t * 0.45)
          ctx.globalAlpha = 1
          activeBalloons.push(balloon)
          continue
        }

        balloon.y -= balloon.speed * dt
        const wobble = Math.sin(now * 0.001 * balloon.wobbleSpeed + balloon.wobbleOffset)
          * balloon.wobbleAmp
          * 0.05
          * dt
        balloon.x += wobble

        if (balloon.x < -balloon.size) balloon.x = w
        if (balloon.x > w) balloon.x = -balloon.size

        if (balloon.y < -balloon.size * 2) {
          balloon.y = h + balloon.size
          balloon.x = Math.random() * (w - balloon.size)
          balloon.speed = 0.6 + Math.random() * 1.4
        }

        const glow = ctx.createRadialGradient(cx, cy, balloon.size * 0.1, cx, cy, balloon.size * 0.8)
        glow.addColorStop(0, `${balloon.color}CC`)
        glow.addColorStop(1, `${balloon.color}00`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(cx, cy, balloon.size * 0.8, 0, Math.PI * 2)
        ctx.fill()

        const bounce = Math.sin(now * 0.003 + balloon.wobbleOffset) * 1.8
        drawBalloonBody(ctx, balloon, cx, cy + bounce)

        activeBalloons.push(balloon)
      }
      balloonsRef.current = activeBalloons

      const liveParticles: BalloonParticle[] = []
      for (const particle of poppedParticlesRef.current) {
        particle.x += particle.vx * dt
        particle.y += particle.vy * dt
        particle.vy += 0.1 * dt
        particle.life -= 0.02 * dt
        if (particle.life <= 0) continue

        ctx.globalAlpha = particle.life
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2)
        ctx.fill()
        liveParticles.push(particle)
      }
      poppedParticlesRef.current = liveParticles
      ctx.globalAlpha = 1

      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = 'bold 28px system-ui, sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'top'
      ctx.fillText(`🎈 ${scoreRef.current}`, w - 16, 16)

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', updateSize)
    }
  }, [started, updateSize])

  useEffect(() => {
    return () => {
      stopMusicRef.current?.()
      audioCtxRef.current?.close()
    }
  }, [])

  return (
    <div style={styles.container}>
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        onClick={onPointerDown}
        onTouchStart={(e) => {
          e.preventDefault()
          onPointerDown(e)
        }}
      />
      {!started && (
        <div
          style={styles.overlay}
          onClick={handleStart}
          onTouchStart={(e) => {
            e.preventDefault()
            handleStart()
          }}
        >
          <div style={styles.startCard}>
            <div style={styles.startEmoji}>🎈🐱🐶👶</div>
            <h1 style={styles.title}>Balloon Pop!</h1>
            <p style={styles.subtitle}>
              Distract your cat, dog, or baby!
              <br />
              Tap the balloons to pop them!
            </p>
            <button style={styles.startButton}>▶ Tap to Start</button>
            <p style={styles.hint}>🔊 Music and sound effects will play</p>
          </div>
        </div>
      )}
    </div>
  )
}

