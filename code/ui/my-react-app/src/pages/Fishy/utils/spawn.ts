import { FISH_PALETTES, WHISPERS } from '../constants/gameConfig'
import type { FishyState, GameDimensions, Fish, Seaweed } from '../interfaces'
import { getDread, getWhisperTier, pickRandom, rand } from './math'

export function generateSeaweeds(state: FishyState, viewportWidth: number): void {
  state.seaweeds.length = 0
  const count = Math.floor(viewportWidth / 80) + 3
  for (let i = 0; i < count; i += 1) {
    const seaweed: Seaweed = {
      x: Math.random() * viewportWidth,
      height: 60 + Math.random() * 120,
      width: 12 + Math.random() * 18,
      segments: 4 + Math.floor(Math.random() * 4),
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? '#0d6b3c' : '#15803d',
    }
    state.seaweeds.push(seaweed)
  }
}

export function spawnFish(state: FishyState, dimensions: GameDimensions): void {
  const fromLeft = Math.random() > 0.5
  const dread = getDread(state.eaten)
  const maxSize = 30 + state.level * 7
  const size = rand(6, maxSize)
  const speedBase = rand(40, 140) / Math.max(size / 18, 1)
  const speed = speedBase * (1 + state.level * 0.06)
  const y = rand(30, dimensions.H() - 30)
  const isRare = Math.random() < 0.08

  // Make fish look wrong at higher dread
  const distorted = dread > 0.4 && Math.random() < dread * 0.6
  const eyeCount = distorted ? (Math.random() < 0.5 ? 3 : Math.floor(Math.random() * 5) + 1) : 2

  let palette: string[]
  if (isRare) palette = FISH_PALETTES.rare
  else if (size <= state.player.size * 0.5) palette = FISH_PALETTES.small
  else if (size <= state.player.size) palette = FISH_PALETTES.medium
  else palette = FISH_PALETTES.danger

  const fish: Fish = {
    x: fromLeft ? -70 : dimensions.W() + 70,
    y,
    vx: fromLeft ? speed : -speed,
    vy: rand(-22, 22),
    size,
    color: pickRandom(palette),
    isRare,
    pattern: Math.floor(Math.random() * 3),
    scaleAnim: 0,
    distorted,
    eyeCount,
  }

  state.fishes.push(fish)
}

export function spawnPredator(state: FishyState, dimensions: GameDimensions): void {
  const fromLeft = Math.random() > 0.5
  const size = state.player.size * (1.3 + Math.random() * 0.5)
  const speed = rand(60, 100)
  const y = rand(60, dimensions.H() - 60)

  const fish: Fish = {
    x: fromLeft ? -100 : dimensions.W() + 100,
    y,
    vx: fromLeft ? speed : -speed,
    vy: rand(-15, 15),
    size,
    color: pickRandom(FISH_PALETTES.predator),
    isRare: false,
    pattern: 0,
    scaleAnim: 0,
    isPredator: true,
    eyeCount: Math.floor(Math.random() * 7) + 3,
    distorted: true,
  }

  state.fishes.push(fish)
}

export function spawnBubble(state: FishyState, x: number, y: number): void {
  const dread = getDread(state.eaten)
  state.bubbles.push({
    x: x + rand(-10, 10),
    y,
    r: rand(2, 7),
    speed: rand(20, 60),
    wobble: rand(0, Math.PI * 2),
    alpha: rand(0.3, 0.7),
    bloody: dread > 0.35 && Math.random() < dread,
  })
}

export function spawnParticles(state: FishyState, x: number, y: number, color: string): void {
  const dread = getDread(state.eaten)
  const count = dread > 0.5 ? 10 : 6
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * rand(30, 80),
      vy: Math.sin(angle) * rand(30, 80),
      r: rand(2, dread > 0.4 ? 7 : 5),
      color: dread > 0.35 && Math.random() < dread ? '#8b0000' : color,
      life: 1,
    })
  }
}

export function spawnWhisper(state: FishyState, dimensions: GameDimensions): void {
  const tier = getWhisperTier(getDread(state.eaten))
  if (tier < 0) return

  const text = pickRandom(WHISPERS[tier])
  if (state.whispers.some((whisper) => whisper.text === text)) return

  state.whispers.push({
    text,
    x: rand(dimensions.W() * 0.1, dimensions.W() * 0.9),
    y: rand(dimensions.H() * 0.15, dimensions.H() * 0.85),
    life: 1,
    maxLife: 4 + Math.random() * 3,
    size: 14 + Math.random() * 10,
    drift: rand(-8, 8),
  })
}
