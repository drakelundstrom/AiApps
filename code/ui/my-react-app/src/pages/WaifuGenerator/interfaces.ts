import type { CSSProperties } from 'react'

/** Union of supported hair-color filter values */
export type HairColor =
  | 'any'
  | 'black'
  | 'brown'
  | 'blonde'
  | 'red'
  | 'blue'
  | 'pink'
  | 'white'
  | 'green'
  | 'purple'
  | 'orange'

/** Union of supported eye-color filter values */
export type EyeColor =
  | 'any'
  | 'brown'
  | 'blue'
  | 'green'
  | 'red'
  | 'amber'
  | 'purple'
  | 'pink'
  | 'heterochromia'

/** Gender filter */
export type WaifuGender = 'any' | 'girl' | 'boy'

/** Personality archetype */
export type Personality =
  | 'any'
  | 'tsundere'
  | 'yandere'
  | 'kuudere'
  | 'dandere'
  | 'genki'
  | 'ojou-sama'
  | 'tomboy'

/** Source media type */
export type SourceMedia = 'any' | 'anime' | 'manga' | 'game' | 'light-novel'

/** The set of filters the user can choose */
export interface WaifuFilters {
  gender: WaifuGender
  hairColor: HairColor
  eyeColor: EyeColor
  personality: Personality
  sourceMedia: SourceMedia
}

/** A single waifu character entry */
export interface WaifuCharacter {
  name: string
  series: string
  gender: WaifuGender
  hairColor: HairColor
  eyeColor: EyeColor
  personality: Personality
  sourceMedia: SourceMedia
  emoji: string
  quote: string
  traits: string[]
}

/** Re-usable inline-style map */
export interface WaifuStyles {
  [key: string]: CSSProperties
}
