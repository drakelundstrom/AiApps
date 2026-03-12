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

  legend: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
    fontSize: '0.75rem',
    color: '#94a3b8',
  } as CSSProperties,

  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  } as CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: '60px repeat(7, 1fr)',
    gap: '0',
    width: '100%',
    maxWidth: '1100px',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(8px)',
  } as CSSProperties,

  dayHeader: {
    padding: '0.6rem 0.25rem',
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
    background: 'rgba(99, 102, 241, 0.15)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    color: '#c7d2fe',
    whiteSpace: 'nowrap',
  } as CSSProperties,

  timeLabel: {
    padding: '0.3rem 0.5rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#94a3b8',
    textAlign: 'right',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    background: 'rgba(30, 27, 75, 0.4)',
  } as CSSProperties,

  cell: {
    position: 'relative',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    borderRight: '1px solid rgba(255,255,255,0.04)',
    minHeight: '48px',
  } as CSSProperties,

  compressedDivider: {
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.15rem 0',
    color: '#475569',
    fontSize: '0.65rem',
    background: 'rgba(30, 27, 75, 0.3)',
    borderTop: '1px dashed rgba(255,255,255,0.08)',
    borderBottom: '1px dashed rgba(255,255,255,0.08)',
    gap: '0.5rem',
    letterSpacing: '0.15em',
    userSelect: 'none',
  } as CSSProperties,

  eventChip: {
    position: 'absolute',
    left: '2px',
    right: '2px',
    borderRadius: '6px',
    padding: '2px 5px',
    fontSize: '0.65rem',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    zIndex: 2,
  } as CSSProperties,

  todayDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#fbbf24',
    display: 'inline-block',
    marginLeft: '4px',
  } as CSSProperties,

  statsBar: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '1rem',
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

  toggleRow: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    marginBottom: '1rem',
  } as CSSProperties,

  toggleBtn: {
    padding: '0.4rem 1rem',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#e2e8f0',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  toggleBtnActive: {
    padding: '0.4rem 1rem',
    borderRadius: '999px',
    border: '1px solid #818cf8',
    background: 'rgba(129, 140, 248, 0.2)',
    color: '#c7d2fe',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as CSSProperties,
}
