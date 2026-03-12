import React, { useState, useMemo, type CSSProperties } from 'react'
import { WEEK_EVENTS, DAY_LABELS } from './constants/calendarData'
import { styles } from './constants/styles'
import { buildActiveBlocks, formatHour, eventTopPercent, eventHeightPercent } from './utils/calendarLogic'
import type { CalendarEvent } from './interfaces'

const HOUR_PX = 48
const DAYS = [1, 2, 3, 4, 5, 6, 0] // Mon → Sun

export default function CompressedCalendar() {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(() => {
    const today = new Date().getDay()
    return new Set([today])
  })

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>()
    for (const d of DAYS) map.set(d, [])
    for (const ev of WEEK_EVENTS) {
      map.get(ev.day)?.push(ev)
    }
    return map
  }, [])

  const totalEvents = WEEK_EVENTS.length
  const totalHours = WEEK_EVENTS.reduce((s, e) => s + (e.endHour - e.startHour), 0)
  const busiestDay = DAYS.reduce((best, d) => {
    const count = eventsByDay.get(d)?.length ?? 0
    return count > (eventsByDay.get(best)?.length ?? 0) ? d : best
  }, DAYS[0])

  function toggleDay(day: number) {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  return (
    <div className="page-container" style={styles.container as CSSProperties}>
      <header style={styles.header as CSSProperties}>
        <h1 style={styles.title as CSSProperties}>📅 Compressed Calendar</h1>
        <p style={styles.subtitle as CSSProperties}>
          Each day compresses empty time independently
        </p>
      </header>

      <div style={styles.statsBar as CSSProperties}>
        <div style={styles.statItem as CSSProperties}>
          <span style={styles.statNumber as CSSProperties}>{totalEvents}</span>
          <span style={styles.statLabel as CSSProperties}>Events</span>
        </div>
        <div style={styles.statItem as CSSProperties}>
          <span style={styles.statNumber as CSSProperties}>{totalHours.toFixed(0)}h</span>
          <span style={styles.statLabel as CSSProperties}>Booked</span>
        </div>
        <div style={styles.statItem as CSSProperties}>
          <span style={styles.statNumber as CSSProperties}>{DAY_LABELS[busiestDay]}</span>
          <span style={styles.statLabel as CSSProperties}>Busiest Day</span>
        </div>
      </div>

      <div style={styles.daysContainer as CSSProperties}>
        {DAYS.map((day) => {
          const dayEvents = eventsByDay.get(day) ?? []
          const isExpanded = expandedDays.has(day)
          const isToday = day === new Date().getDay()
          const blocks = buildActiveBlocks(dayEvents)

          return (
            <div
              key={day}
              style={{
                ...(styles.dayCard as CSSProperties),
                ...(isToday ? { border: '1px solid rgba(251, 191, 36, 0.3)' } : {}),
              }}
            >
              <div
                style={styles.dayHeader as CSSProperties}
                onClick={() => toggleDay(day)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDay(day) }}
                role="button"
                tabIndex={0}
              >
                <div style={styles.dayHeaderLeft as CSSProperties}>
                  <span style={styles.dayName as CSSProperties}>
                    {DAY_LABELS[day]}
                    {isToday && <span style={{ ...(styles.todayDot as CSSProperties), marginLeft: '6px' }} />}
                  </span>
                  <span style={styles.eventCount as CSSProperties}>
                    {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <span
                  style={{
                    ...(styles.chevron as CSSProperties),
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ▼
                </span>
              </div>

              <div
                style={{
                  ...(styles.dayBody as CSSProperties),
                  maxHeight: isExpanded ? '800px' : '0px',
                  opacity: isExpanded ? 1 : 0,
                }}
              >
                {dayEvents.length === 0 ? (
                  <div style={styles.emptyDay as CSSProperties}>No events — enjoy the free time!</div>
                ) : (
                  <DayTimeline blocks={blocks} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface DayTimelineProps {
  blocks: ReturnType<typeof buildActiveBlocks>
}

function DayTimeline({ blocks }: DayTimelineProps) {
  return (
    <div style={styles.timelineContainer as CSSProperties}>
      {blocks.map((block, bi) => {
        const blockSpan = block.endHour - block.startHour
        const blockHeight = blockSpan * HOUR_PX

        const hourTicks: number[] = []
        for (let h = Math.ceil(block.startHour); h <= Math.floor(block.endHour); h++) {
          hourTicks.push(h)
        }

        return (
          <React.Fragment key={bi}>
            {bi > 0 && (
              <div style={styles.compressedGap as CSSProperties}>
                · · · free · · ·
              </div>
            )}
            <div style={{ ...(styles.blockRow as CSSProperties), height: `${blockHeight}px` }}>
              <div style={styles.timeColumn as CSSProperties}>
                {hourTicks.map((h) => (
                  <span
                    key={h}
                    style={{
                      ...(styles.timeTick as CSSProperties),
                      top: `${((h - block.startHour) / blockSpan) * 100}%`,
                    }}
                  >
                    {formatHour(h)}
                  </span>
                ))}
              </div>
              <div style={styles.eventsColumn as CSSProperties}>
                {block.events.map((ev) => {
                  const clampedStart = Math.max(ev.startHour, block.startHour)
                  const clampedEnd = Math.min(ev.endHour, block.endHour)
                  const top = eventTopPercent(clampedStart, block.startHour, block.endHour)
                  const height = eventHeightPercent(clampedStart, clampedEnd, block.startHour, block.endHour)

                  return (
                    <div
                      key={ev.id}
                      title={`${ev.title}\n${formatHour(ev.startHour)} – ${formatHour(ev.endHour)}`}
                      style={{
                        ...(styles.eventChip as CSSProperties),
                        top: `${top}%`,
                        height: `${height}%`,
                        background: `linear-gradient(135deg, ${ev.color}cc, ${ev.color}88)`,
                        color: '#fff',
                        minHeight: '18px',
                      }}
                    >
                      <span>{ev.icon}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ev.title}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}
