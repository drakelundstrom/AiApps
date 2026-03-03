import type { CSSProperties, ChangeEvent } from 'react'

export interface TipCalculatorStyles {
  [key: string]: CSSProperties
}

export type BillInputChangeEvent = ChangeEvent<HTMLInputElement>
