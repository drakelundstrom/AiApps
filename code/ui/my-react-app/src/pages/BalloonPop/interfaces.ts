import type { CSSProperties } from 'react'

export interface Balloon {
  id: number
  x: number
  y: number
  size: number
  speed: number
  wobbleAmp: number
  wobbleSpeed: number
  wobbleOffset: number
  color: string
  emoji: string
  popping: boolean
  popTime: number
}

export interface BalloonParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
}

export interface BalloonCanvasSize {
  w: number
  h: number
  dpr: number
}

export interface BalloonPopStyles {
  [key: string]: CSSProperties
}
