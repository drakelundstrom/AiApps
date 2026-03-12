import type { CSSProperties } from 'react'
import type { CalendarStyles } from '../interfaces'

export const styles: CalendarStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    color: '#e2e8f0',
    padding: '2rem 1rem',
    fontFamily: "'Inter', system-ui, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as CSSProperties,

  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  } as CSSProperties,

  title: {
    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
    fontWeight: 800,
    background: 'linear-gradient(90deg, #818cf8, #f472b6, #fbbf24)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.25rem',
  } as CSSProperties,

  subtitle: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  } as CSSProperties,

  statsBar: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
    fontSize: '0.8rem',
  } as CSSProperties,

  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.15rem',
  } as CSSProperties,

  statNumber: {
    fontSize: '1.4rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #818cf8, #f472b6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as CSSProperties,

  statLabel: {
    color: '#64748b',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  } as CSSProperties,

  daysContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
    maxWidth: '700px',
  } as CSSProperties,

  dayCard: {
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s ease',
  } as CSSProperties,

  dayHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    background: 'rgba(99, 102, 241, 0.1)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    userSelect: 'none',
    transition: 'background 0.2s ease',
  } as CSSProperties,

  dayHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  } as CSSProperties,

  dayName: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#e2e8f0',
  } as CSSProperties,

  eventCount: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#818cf8',
    background: 'rgba(129, 140, 248, 0.15)',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
  } as CSSProperties,

  chevron: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    transition: 'transform 0.3s ease',
  } as CSSProperties,

  dayBody: {
    overflow: 'hidden',
    transition: 'max-height 0.4s ease, opacity 0.3s ease',
  } as CSSProperties,

  timelineContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
  } as CSSProperties,

  blockRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  } as CSSProperties,

  timeColumn: {
    width: '60px',
    minWidth: '60px',
    position: 'relative',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(30, 27, 75, 0.3)',
  } as CSSProperties,

  timeTick: {
    position: 'absolute',
    right: '0.4rem',
    fontSize: '0.6rem',
    fontWeight: 600,
    color: '#94a3b8',
    lineHeight: 1,
    transform: 'translateY(-50%)',
  } as CSSProperties,

  eventsColumn: {
    flex: 1,
    position: 'relative',
  } as CSSProperties,

  eventChip: {
    position: 'absolute',
    left: '4px',
    right: '4px',
    borderRadius: '6px',
    padding: '3px 6px',
    fontSize: '0.7rem',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    zIndex: 2,
  } as CSSProperties,

  compressedGap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.2rem 0',
    color: '#475569',
    fontSize: '0.6rem',
    background: 'rgba(30, 27, 75, 0.25)',
    borderTop: '1px dashed rgba(255,255,255,0.06)',
    borderBottom: '1px dashed rgba(255,255,255,0.06)',
    letterSpacing: '0.1em',
    userSelect: 'none',
  } as CSSProperties,

  todayDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#fbbf24',
    display: 'inline-block',
  } as CSSProperties,

  emptyDay: {
    padding: '1.5rem',
    textAlign: 'center',
    color: '#475569',
    fontSize: '0.8rem',
    fontStyle: 'italic',
  } as CSSProperties,
}
