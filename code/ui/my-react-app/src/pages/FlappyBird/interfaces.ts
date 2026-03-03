export type GameState = 'idle' | 'playing' | 'gameover'

export interface BirdState {
  y: number
  velocity: number
}

export interface Pipe {
  x: number
  topHeight: number
  scored: boolean
}
