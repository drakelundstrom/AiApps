import type { CSSProperties } from 'react'

export interface AngerStage {
  level: number
  face: string
  label: string
  quote: string
  bgColor: string
  shakeIntensity: number
  faceSize: number
  textColor: string
}

export interface FloatingText {
  id: number
  text: string
  x: number
  y: number
}

export interface StyleMap {
  [key: string]: CSSProperties | ((...args: never[]) => CSSProperties)
}
