export type FishyElements = {
  canvas: HTMLCanvasElement | null
  scoreEl: HTMLElement | null
  sizeEl: HTMLElement | null
  statusEl: HTMLElement | null
  levelEl: HTMLElement | null
  hudEl: HTMLElement | null
}

export type PointerState = { x: number; y: number }
export type PlayerState = { x: number; y: number; size: number; vx: number }

export type Fish = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  isRare: boolean
  pattern: number
  scaleAnim: number
}

export type Bubble = {
  x: number
  y: number
  r: number
  speed: number
  wobble: number
  alpha: number
  bloody: boolean
}

export type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  life: number
}

export type Seaweed = {
  x: number
  height: number
  width: number
  segments: number
  phase: number
  color: string
}

export type Whisper = {
  text: string
  x: number
  y: number
  life: number
  maxLife: number
  size: number
  drift: number
}

export type GameDimensions = {
  W: () => number
  H: () => number
}

export type FishyState = {
  pointer: PointerState
  player: PlayerState
  fishes: Fish[]
  bubbles: Bubble[]
  particles: Particle[]
  seaweeds: Seaweed[]
  whispers: Whisper[]
  score: number
  level: number
  eaten: number
  isGameOver: boolean
  spawnTimer: number
  lastTime: number
  comboCount: number
  comboTimer: number
  shakeAmount: number
  whisperTimer: number
}
