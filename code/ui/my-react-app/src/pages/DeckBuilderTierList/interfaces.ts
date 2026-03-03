import type { CSSProperties } from 'react'

export type TierId = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface TierDefinition {
  id: TierId
  label: string
  color: string
  description: string
}

export interface DeckBuilderGame {
  id: number
  name: string
  year: number
  players: string
  defaultTier: TierId
  img: string
  desc: string
}

export type TierPlacements = Record<number, TierId>

export interface DeckBuilderTierListStyles {
  [key: string]: CSSProperties
}
