import type { CSSProperties } from 'react'

export type CardType = 'Hero' | 'Villain' | 'Super Power' | 'Equipment' | 'Location' | 'Starter'
export type CardFilter = CardType | 'All'

export interface CardDefinition {
  name: string
  type: CardType
  vp: number
}

export interface PlayerCard extends CardDefinition {
  qty: number
}

export interface PlayerState {
  id: number
  name: string
  colorIdx: number
  cards: PlayerCard[]
  bonusVP: number
}

export interface GameLogEntry {
  time: Date
  text: string
}

export interface CustomCardInput {
  name: string
  type: CardType
  vp: string
}

export interface DCDeckBuilderStyles {
  [key: string]: CSSProperties
}
