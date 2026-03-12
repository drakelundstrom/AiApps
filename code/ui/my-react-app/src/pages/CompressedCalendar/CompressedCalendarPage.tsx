import React, { useState, useMemo, type CSSProperties } from 'react'
import { WEEK_EVENTS, DAY_LABELS } from './constants/calendarData'
import { styles } from './constants/styles'
import { buildActiveBlocks, formatHour, eventTopPercent, eventHeightPercent } from './utils/calendarLogic'
import type { CalendarEvent, TimeBlock } from './interfaces'

const HOUR_PX = 54
const DAYS = [1, 2, 3, 4, 5, 6, 0] // Mon → Sun

export default function CompressedCalendar() {
  const [compressed, setCompressed] = useState(true)

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>()
    for (const d of DAYS) map.set(d, [])
    for (const ev of WEEK_EVENTS) {
      map.get(ev.day)?.push(ev)
    }
    return map
  }, [])

  // Build unified active blocks across all days
  const activeBlocks = useMemo(() => buildActiveBlocks(WEEK_EVENTS), [])

  // Full-day hours for non-compressed view
  const fullHours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])

  // Stats
  const totalEvents = WEEK_EVENTS.length
  const totalHours = WEEK_EVENTS.reduce((s, e) => s + (e.endHour - e.startHour), 0)
  const busiestDay = DAYS.reduce((best, d) => {
    const count = eventsByDay.get(d)?.length ?? 0
    return count > (eventsByDay.get(best)?.length ?? 0) ? d : best
  }, DAYS[0])

  return (
    <div className="page-container" style={styles.container as CSSProperties}>
      <header style={styles.header as CSSProperties}>
        <h1 style={styles.title as CSSProperties}>📅 Compressed Calendar</h1>
        <p style={styles.subtitle as CSSProperties}>
          Empty time compressed away — only your busy blocks remain
        </p>
      </header>

      {/* Stats */}
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
        <div style={styles.statItem as CSSProperties}>
          <span style={styles.statNumber as CSSProperties}>{activeBlocks.length}</span>
          <span style={styles.statLabel as CSSProperties}>Active Blocks</span>
        </div>
      </div>

      {/* Toggle */}
      <div style={styles.toggleRow as CSSProperties}>
        <button
          type="button"
          style={(compressed ? styles.toggleBtnActive : styles.toggleBtn) as CSSProperties}
          onClick={() => setCompressed(true)}
        >
          ⚡ Compressed
        </button>
        <button
          type="button"
          style={(!compressed ? styles.toggleBtnActive : styles.toggleBtn) as CSSProperties}
          onClick={() => setCompressed(false)}
        >
          📏 Full Day
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ ...styles.grid as CSSProperties, overflowX: 'auto' }}>
        {/* Header row */}
        <div style={{ ...(styles.dayHeader as CSSProperties), background: 'rgba(30, 27, 75, 0.6)' }} />
        {DAYS.map((d) => (
          <div key={d} style={styles.dayHeader as CSSProperties}>
            {DAY_LABELS[d]}
            {d === new Date().getDay() && <span style={styles.todayDot as CSSProperties} />}
          </div>
        ))}

        {compressed
          ? renderCompressed(activeBlocks, eventsByDay)
          : renderFull(fullHours, eventsByDay)}
      </div>
    </div>
  )
}

// ── Compressed view: only active time blocks ──────────────────────
function renderCompressed(
  blocks: TimeBlock[],
  eventsByDay: Map<number, CalendarEvent[]>,
) {
  const rows: React.JSX.Element[] = []

  blocks.forEach((block, bi) => {
    if (bi > 0) {
      rows.push(
        <div key={`gap-${bi}`} style={styles.compressedDivider as CSSProperties}>
          <span>· · · free time · · ·</span>
        </div>,
      )
    }

    const blockSpan = block.endHour - block.startHour
    const blockHeight = blockSpan * HOUR_PX

    // Time labels for this block
    const hoursInBlock = []
    for (let h = Math.ceil(block.startHour); h < block.endHour; h++) {
      hoursInBlock.push(h)
    }

    // Time label column
    rows.push(
      <div
        key={`time-${bi}`}
        style={{
          ...(styles.timeLabel as CSSProperties),
          height: `${blockHeight}px`,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: '0',
          position: 'relative',
        }}
      >
        {hoursInBlock.map((h) => (
          <span
            key={h}
            style={{
              position: 'absolute',
              top: `${((h - block.startHour) / blockSpan) * 100}%`,
              right: '0.5rem',
              fontSize: '0.65rem',
            }}
          >
            {formatHour(h)}
          </span>
        ))}
      </div>,
    )

    // Day columns
    for (const day of DAYS) {
      const dayEvents = (eventsByDay.get(day) ?? []).filter(
        (e) => e.startHour < block.endHour && e.endHour > block.startHour,
      )
      rows.push(
        <div
          key={`cell-${bi}-${day}`}
          style={{
            ...(styles.cell as CSSProperties),
            height: `${blockHeight}px`,
          }}
        >
          {dayEvents.map((ev) => {
            const top = eventTopPercent(
              Math.max(ev.startHour, block.startHour),
              block.startHour,
              block.endHour,
            )
            const height = eventHeightPercent(
              Math.max(ev.startHour, block.startHour),
              Math.min(ev.endHour, block.endHour),
              block.startHour,
              block.endHour,
            )
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
                  minHeight: '16px',
                }}
              >
                <span>{ev.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ev.title}
                </span>
              </div>
            )
          })}
        </div>,
      )
    }
  })

  return <>{rows}</>
}

// ── Full 24h view ────────────────────────────────────────────────
function renderFull(
  hours: number[],
  eventsByDay: Map<number, CalendarEvent[]>,
) {
  const rows: React.JSX.Element[] = []

  for (const h of hours) {
    rows.push(
      <div key={`time-${h}`} style={{ ...(styles.timeLabel as CSSProperties), height: `${HOUR_PX}px` }}>
        {formatHour(h)}
      </div>,
    )

    for (const day of DAYS) {
      const dayEvents = (eventsByDay.get(day) ?? []).filter(
        (e) => e.startHour < h + 1 && e.endHour > h,
      )
      rows.push(
        <div key={`cell-${h}-${day}`} style={{ ...(styles.cell as CSSProperties), height: `${HOUR_PX}px` }}>
          {dayEvents.map((ev) => {
            const cellStart = h
            const cellEnd = h + 1
            const top = eventTopPercent(Math.max(ev.startHour, cellStart), cellStart, cellEnd)
            const height = eventHeightPercent(
              Math.max(ev.startHour, cellStart),
              Math.min(ev.endHour, cellEnd),
              cellStart,
              cellEnd,
            )
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
                  minHeight: '16px',
                }}
              >
                <span>{ev.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ev.title}
                </span>
              </div>
            )
          })}
        </div>,
      )
    }
  }

  return <>{rows}</>
}
