import type { CalendarEvent, TimeBlock } from '../interfaces'

/** Merge overlapping/adjacent event time ranges into contiguous active blocks */
export function buildActiveBlocks(
  allEvents: CalendarEvent[],
  paddingHours: number = 0.25,
): TimeBlock[] {
  if (allEvents.length === 0) return []

  const ranges = allEvents
    .map((e) => ({
      start: Math.floor(e.startHour - paddingHours),
      end: Math.ceil(e.endHour + paddingHours),
    }))
    .sort((a, b) => a.start - b.start)

  const merged: { start: number; end: number }[] = [ranges[0]]
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1]
    if (ranges[i].start <= last.end) {
      last.end = Math.max(last.end, ranges[i].end)
    } else {
      merged.push({ ...ranges[i] })
    }
  }

  return merged.map(({ start, end }) => ({
    startHour: Math.max(0, start),
    endHour: Math.min(24, end),
    events: allEvents.filter((e) => e.startHour < end && e.endHour > start),
  }))
}

export function formatHour(h: number): string {
  const hour = Math.floor(h)
  const min = Math.round((h - hour) * 60)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return min === 0 ? `${display} ${suffix}` : `${display}:${String(min).padStart(2, '0')} ${suffix}`
}

export function eventTopPercent(eventStart: number, blockStart: number, blockEnd: number): number {
  return ((eventStart - blockStart) / (blockEnd - blockStart)) * 100
}

export function eventHeightPercent(eventStart: number, eventEnd: number, blockStart: number, blockEnd: number): number {
  return ((eventEnd - eventStart) / (blockEnd - blockStart)) * 100
}
