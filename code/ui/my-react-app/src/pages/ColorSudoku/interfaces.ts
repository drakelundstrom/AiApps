import type { CSSProperties } from 'react'

export type SudokuCell = number
export type SudokuBoard = SudokuCell[][]
export type CellPosition = [number, number]

export type ThemeKey =
  | 'classic'
  | 'neon'
  | 'pastel'
  | 'emoji'
  | 'shapes'
  | 'numbers'
  | 'grayscale'
  | 'rainbow'

export interface SudokuTheme {
  label: string
  desc: string
  colors: string[]
  names: string[]
  cell: (value: SudokuCell) => string | null
  content: (value: SudokuCell) => string | null
  symbols?: string[]
  contentColor?: (value: SudokuCell) => string | null
  glow?: boolean
  darkText?: boolean
  animated?: boolean
}

export interface SudokuPuzzleState {
  puzzle: SudokuBoard
  solution: SudokuBoard
}

export interface ColorSudokuStyles {
  [key: string]: CSSProperties
}
