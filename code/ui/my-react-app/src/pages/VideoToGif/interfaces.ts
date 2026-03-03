import type { CSSProperties } from 'react'

export type ConversionStatus = 'idle' | 'loading' | 'converting' | 'done' | 'error'

export interface VideoToGifStyles {
  [key: string]: CSSProperties
}
