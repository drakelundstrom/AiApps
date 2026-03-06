import { createAudioState, playEatSound, playHeartbeat, stopAudio, unlockAudio, updateAudio } from './audio/audioEngine'
import type { FishyElements, FishyState } from './interfaces'
import { clamp, getDread, getLevel, getSpawnInterval, rand } from './utils/math'
import {
  drawBackground,
  drawBubbles,
  drawCombo,
  drawFish,
  drawParticles,
  drawSeaweed,
  drawVignette,
  drawWhispers,
} from './utils/render'
import { generateSeaweeds, spawnBubble, spawnFish, spawnParticles, spawnPredator, spawnWhisper } from './utils/spawn'

export function startFishyGame({
  canvas,
  scoreEl,
  sizeEl,
  statusEl,
  levelEl,
  hudEl,
}: FishyElements): () => void {
  if (!canvas || !scoreEl || !sizeEl || !statusEl || !levelEl || !hudEl) {
    return () => {}
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const state: FishyState = {
    pointer: { x: 0, y: 0 },
    player: { x: 0, y: 0, size: 20, vx: 0 },
    fishes: [],
    bubbles: [],
    particles: [],
    seaweeds: [],
    whispers: [],
    score: 0,
    level: 1,
    eaten: 0,
    isGameOver: false,
    spawnTimer: 0,
    lastTime: 0,
    comboCount: 0,
    comboTimer: 0,
    shakeAmount: 0,
    whisperTimer: 0,
    predatorTimer: 0,
  }

  const audio = createAudioState()
  let isDestroyed = false
  let frameId: number | null = null
  let highScore = Number.parseInt(localStorage.getItem('fishyHighScore') ?? '0', 10)

  const W = () => window.innerWidth
  const H = () => window.innerHeight

  const renderContext = { ctx, state, dimensions: { W, H } }

  const updateHud = () => {
    const dread = getDread(state.eaten)
    hudEl.classList.toggle('dread', dread >= 0.3 && dread < 0.7)
    hudEl.classList.toggle('abyss', dread >= 0.7)
    levelEl.classList.toggle('dread', dread >= 0.3 && dread < 0.7)
    levelEl.classList.toggle('abyss', dread >= 0.7)

    scoreEl.textContent = `Score ${state.score}`
    sizeEl.textContent = `Size ${Math.round(state.player.size)}`

    const nextLevel = getLevel(state.score)
    if (nextLevel !== state.level) {
      state.level = nextLevel
      state.shakeAmount = 8 + dread * 15
    }

    levelEl.textContent = dread > 0.7 ? `Depth ${state.level}` : `Level ${state.level}`
  }

  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (!state.player.x && !state.player.y) {
      state.player.x = W() * 0.5
      state.player.y = H() * 0.5
      state.pointer.x = state.player.x
      state.pointer.y = state.player.y
    }

    generateSeaweeds(state, W())
  }

  const resetGame = () => {
    state.player.size = 20
    state.player.x = W() * 0.5
    state.player.y = H() * 0.5
    state.pointer.x = state.player.x
    state.pointer.y = state.player.y
    state.score = 0
    state.level = 1
    state.eaten = 0
    state.comboCount = 0
    state.comboTimer = 0
    state.spawnTimer = 0
    state.lastTime = 0
    state.whisperTimer = 0
    state.predatorTimer = 0
    state.fishes.length = 0
    state.bubbles.length = 0
    state.particles.length = 0
    state.whispers.length = 0
    state.isGameOver = false
    statusEl.textContent = 'Move with mouse or touch'
    stopAudio(audio)
    updateHud()
  }

  const onPointerMove = (clientX: number, clientY: number) => {
    state.pointer.x = clientX
    state.pointer.y = clientY
  }

  const onMouseMove = (event: MouseEvent) => {
    onPointerMove(event.clientX, event.clientY)
  }

  const onTouchMove = (event: TouchEvent) => {
    event.preventDefault()
    const touch = event.touches[0]
    if (touch) onPointerMove(touch.clientX, touch.clientY)
  }

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (touch) onPointerMove(touch.clientX, touch.clientY)
    void unlockAudio(audio)
    if (state.isGameOver) resetGame()
  }

  const onClick = () => {
    void unlockAudio(audio)
    if (state.isGameOver) resetGame()
  }

  const onKeyDown = () => {
    void unlockAudio(audio)
  }

  const step = (timestamp: number) => {
    if (isDestroyed) return

    if (!state.lastTime) state.lastTime = timestamp
    const dt = Math.min((timestamp - state.lastTime) / 1000, 0.04)
    state.lastTime = timestamp
    const dread = getDread(state.eaten)

    ctx.save()
    const shake = state.shakeAmount + (dread > 0.7 ? Math.sin(timestamp * 0.02) * dread * 2 : 0)
    if (shake > 0.5) {
      ctx.translate(rand(-shake, shake), rand(-shake, shake))
      state.shakeAmount *= 0.9
    } else {
      state.shakeAmount = 0
    }

    drawBackground(renderContext, timestamp)
    drawSeaweed(renderContext, timestamp)

    if (!state.isGameOver) {
      updateAudio(audio, dread)

      const followSpeed = 7
      const prevX = state.player.x
      state.player.x += (state.pointer.x - state.player.x) * followSpeed * dt
      state.player.y += (state.pointer.y - state.player.y) * followSpeed * dt
      state.player.vx = state.player.x - prevX
      state.player.x = clamp(state.player.x, state.player.size, W() - state.player.size)
      state.player.y = clamp(state.player.y, state.player.size, H() - state.player.size)

      if (Math.random() < 0.075 * (1 - dread * 0.6)) {
        spawnBubble(state, state.player.x - state.player.size * 0.8, state.player.y)
      }

      state.spawnTimer += dt
      if (state.spawnTimer >= getSpawnInterval(state.level)) {
        const maxOnScreen = state.level >= 7 ? 18 : state.level >= 5 ? 22 : 25
        const count = state.level <= 2 && Math.random() < 0.2 ? 2 : 1
        for (let i = 0; i < count && state.fishes.length < maxOnScreen; i += 1) {
          spawnFish(state, { W, H })
        }
        state.spawnTimer = 0
      }

      // Win condition: Become the void
      if (state.player.size >= 300 || state.score >= 4000) {
        state.isGameOver = true
        state.shakeAmount = 30
        stopAudio(audio)
        if (state.score > highScore) {
          highScore = state.score
          localStorage.setItem('fishyHighScore', String(highScore))
        }
        statusEl.textContent = 'you are the abyss now • nothing remains • tap to become again'
        state.fishes = []
        state.whispers = []
      }

      state.comboTimer -= dt
      if (state.comboTimer <= 0) state.comboCount = 0

      if (dread > 0.15) {
        state.whisperTimer += dt
        const freq = dread > 0.7 ? 2 : dread > 0.4 ? 4 : 7
        if (state.whisperTimer >= freq && state.whispers.length < 3) {
          spawnWhisper(state, { W, H })
          state.whisperTimer = 0
        }
      }

      // Spawn predators only when close to winning
      const closeToWin = state.player.size >= 220 || state.score >= 3000
      if (closeToWin) {
        state.predatorTimer += dt
        const predFreq = state.player.size >= 280 || state.score >= 3800 ? 15 : 25
        if (state.predatorTimer >= predFreq) {
          spawnPredator(state, { W, H })
          state.predatorTimer = 0
        }
      }

      for (let i = state.fishes.length - 1; i >= 0; i -= 1) {
        const fish = state.fishes[i]
        fish.x += fish.vx * dt
        fish.y += fish.vy * dt
        fish.scaleAnim = Math.min(1, fish.scaleAnim + 3 * dt)

        if (fish.y < fish.size + 10) {
          fish.y = fish.size + 10
          fish.vy = Math.abs(fish.vy)
        }
        if (fish.y > H() - 50 - fish.size) {
          fish.y = H() - 50 - fish.size
          fish.vy = -Math.abs(fish.vy)
        }
        if (fish.x < -160 || fish.x > W() + 160) {
          state.fishes.splice(i, 1)
          continue
        }

        const dx = fish.x - state.player.x
        const dy = fish.y - state.player.y
        const dist = Math.hypot(dx, dy)
        const hitRange = fish.size * 0.6 + state.player.size * 0.6
        if (dist > hitRange) continue

        if (fish.size <= state.player.size) {
          const points = fish.isRare ? 50 : fish.size > state.player.size * 0.7 ? 15 : 10
          state.score += points
          state.player.size += fish.size > state.player.size * 0.7 ? 1.2 : 0.5
          state.eaten += 1
          state.comboCount += 1
          state.comboTimer = 2.5
          spawnParticles(state, fish.x, fish.y, fish.color)
          spawnBubble(state, fish.x, fish.y)
          spawnBubble(state, fish.x, fish.y)
          playEatSound(audio, dread)
          state.fishes.splice(i, 1)
          updateHud()
        } else {
          state.isGameOver = true
          state.shakeAmount = 20
          stopAudio(audio)
          if (state.score > highScore) {
            highScore = state.score
            localStorage.setItem('fishyHighScore', String(highScore))
          }
          
          // Different messages based on dread level
          let gameOverMsg: string
          if (dread < 0.2) {
            gameOverMsg = 'Game over! Tap to restart'
          } else if (dread < 0.4) {
            gameOverMsg = 'A bigger fish • Tap to try again'
          } else if (dread < 0.6) {
            gameOverMsg = 'Swallowed whole • Tap to restart'
          } else if (dread < 0.8) {
            gameOverMsg = 'consumed by the deep'
          } else {
            gameOverMsg = 'the abyss claimed you • nothing escapes'
          }
          statusEl.textContent = gameOverMsg
          break
        }
      }
    }

    drawBubbles(renderContext, dt)
    const sortedFish = [...state.fishes].sort((a, b) => a.size - b.size)
    for (const fish of sortedFish) {
      ctx.save()
      const scaleAmount = fish.scaleAnim
      if (scaleAmount < 1) {
        ctx.globalAlpha = scaleAmount
        ctx.translate(fish.x, fish.y)
        ctx.scale(scaleAmount, scaleAmount)
        ctx.translate(-fish.x, -fish.y)
      }
      drawFish(renderContext, fish, false)
      ctx.restore()
    }

    drawFish(renderContext, state.player, true)
    drawParticles(renderContext, dt)
    drawWhispers(renderContext, dt)
    drawCombo(renderContext)
    drawVignette(renderContext)

    if (state.isGameOver) {
      ctx.fillStyle = `rgba(5,0,0,${0.8 + Math.sin(timestamp * 0.002) * 0.1})`
      ctx.fillRect(0, 0, W(), H())
      const cx = W() / 2
      const cy = H() / 2
      ctx.fillStyle = '#8b0000'
      ctx.textAlign = 'center'
      ctx.font = '800 42px Georgia, serif'
      
      // Different messages based on dread level
      let canvasMsg: string
      if (state.eaten >= 100) {
        canvasMsg = 'You consumed everything.'
      } else if (dread < 0.2) {
        canvasMsg = 'Better luck next time'
      } else if (dread < 0.4) {
        canvasMsg = 'A bigger fish'
      } else if (dread < 0.6) {
        canvasMsg = 'Swallowed whole'
      } else if (dread < 0.8) {
        canvasMsg = 'Consumed by the deep'
      } else {
        canvasMsg = 'The abyss claimed you'
      }
      
      ctx.fillText(canvasMsg, cx, cy - 60)
      ctx.fillStyle = '#664444'
      ctx.font = 'italic 20px Georgia, serif'
      ctx.fillText(dread < 0.4 ? `${state.eaten} fish eaten` : `${state.eaten} lives ended`, cx, cy - 15)
      ctx.fillStyle = '#553333'
      ctx.font = '600 16px system-ui, sans-serif'
      ctx.fillText(`Score: ${state.score} | Size: ${Math.round(state.player.size)}`, cx, cy + 20)
      ctx.fillStyle = `rgba(68,51,51,${0.4 + Math.sin(timestamp * 0.003) * 0.2})`
      ctx.font = '400 14px system-ui, sans-serif'
      ctx.fillText('tap to forget', cx, cy + 85)
    }

    ctx.restore()
    frameId = requestAnimationFrame(step)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('click', onClick)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', resize)

  resize()
  updateHud()
  if (audio.heartbeatInterval === null) {
    audio.heartbeatInterval = window.setInterval(() => playHeartbeat(audio, getDread(state.eaten)), 900)
  }
  frameId = requestAnimationFrame(step)

  return () => {
    isDestroyed = true
    if (frameId !== null) cancelAnimationFrame(frameId)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('click', onClick)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', resize)
    stopAudio(audio)
  }
}
