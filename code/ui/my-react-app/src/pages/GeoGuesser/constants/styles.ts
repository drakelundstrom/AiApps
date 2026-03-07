import type { CSSProperties } from 'react'

export const containerStyle: CSSProperties = {
  width: '100%',
  maxWidth: 1100,
  margin: '0 auto',
  padding: '1rem',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  color: '#f0f4ff',
}

export const mapContainerStyle: CSSProperties = {
  width: '100%',
  height: 420,
  borderRadius: 12,
  overflow: 'hidden',
  border: '2px solid rgba(255,255,255,0.15)',
  cursor: 'crosshair',
}

export const clueCardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '1.25rem 1.5rem',
  marginBottom: '1rem',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.12)',
}

export const buttonStyle: CSSProperties = {
  padding: '0.75rem 2rem',
  fontSize: '1.1rem',
  fontWeight: 700,
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: '#fff',
  transition: 'transform 0.15s, box-shadow 0.15s',
  boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
}

export const secondaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: 'rgba(255,255,255,0.12)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
}

export const headerStyle: CSSProperties = {
  textAlign: 'center',
  margin: '0.5rem 0 1rem',
}

export const scoreBarStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
  padding: '0.5rem 1rem',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 10,
  fontSize: '0.95rem',
}

export const summaryCardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 10,
  padding: '0.75rem 1rem',
  marginBottom: '0.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

export const resultLineStyle: CSSProperties = {
  stroke: '#f43f5e',
  strokeWidth: 3,
  strokeDasharray: '8 6',
  fill: 'none',
}
