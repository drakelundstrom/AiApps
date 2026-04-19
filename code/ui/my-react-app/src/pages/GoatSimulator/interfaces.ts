export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface GoatState {
  position: Vector3
  velocity: Vector3
  isJumping: boolean
  isHeadbutting: boolean
  rotation: number
  health: number
  energy: number
  score: number
}

export interface GameObject {
  id: string
  position: Vector3
  size: Vector3
  type: 'obstacle' | 'collectible' | 'trampoline'
  collected?: boolean
}

export interface GameStats {
  score: number
  health: number
  energy: number
  timeElapsed: number
  objectsInteracted: number
}
