import type { CSSProperties } from 'react'

export interface CalendarEvent {
  id: string
  title: string
  day: number          // 0=Sun … 6=Sat
  startHour: number    // decimal, e.g. 9.5 = 9:30 AM
  endHour: number
  color: string
  icon: string
}

export interface DayColumn {
  dayIndex: number
  label: string
  events: CalendarEvent[]
}

export interface TimeBlock {
  startHour: number
  endHour: number
  events: CalendarEvent[]
}

export interface CalendarStyles {
  [key: string]: CSSProperties | ((...args: never[]) => CSSProperties)
}
