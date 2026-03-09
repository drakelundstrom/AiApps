import type { WaifuStyles } from '../interfaces'

export const styles: WaifuStyles = {
  /* ── page wrapper ─────────────────────────────────────────────── */
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1025 0%, #2d1b4e 40%, #1a1025 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem 4rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#f0e6ff',
  },

  /* ── title area ───────────────────────────────────────────────── */
  title: {
    fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
    margin: '0 0 0.25rem',
    background: 'linear-gradient(90deg, #ff6b9d, #c084fc, #60a5fa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: '1rem',
    opacity: 0.7,
    margin: '0 0 2rem',
    textAlign: 'center' as const,
  },

  /* ── filter panel ─────────────────────────────────────────────── */
  filtersCard: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(14px)',
    borderRadius: '1rem',
    padding: '1.5rem 2rem',
    width: '100%',
    maxWidth: 700,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
    border: '1px solid rgba(255,255,255,0.10)',
    marginBottom: '1.5rem',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  filterLabel: {
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    opacity: 0.6,
  },
  select: {
    padding: '0.55rem 0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#f0e6ff',
    fontSize: '0.95rem',
    cursor: 'pointer',
    outline: 'none',
  },

  /* ── generate button ──────────────────────────────────────────── */
  generateBtn: {
    padding: '0.75rem 2.5rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    border: 'none',
    borderRadius: '2rem',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #ff6b9d, #c084fc)',
    color: '#fff',
    letterSpacing: '0.04em',
    boxShadow: '0 4px 20px rgba(192,132,252,0.4)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    marginBottom: '2rem',
  },

  /* ── result card ──────────────────────────────────────────────── */
  resultCard: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(14px)',
    borderRadius: '1.25rem',
    padding: '2rem',
    width: '100%',
    maxWidth: 460,
    textAlign: 'center' as const,
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
    animation: 'waifuFadeIn 0.45s ease-out',
  },
  resultEmoji: {
    fontSize: '4rem',
    lineHeight: 1.1,
    marginBottom: '0.5rem',
  },
  resultName: {
    fontSize: '1.8rem',
    fontWeight: 700,
    margin: '0.25rem 0',
    background: 'linear-gradient(90deg, #ff6b9d, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  resultSeries: {
    fontSize: '1rem',
    opacity: 0.7,
    marginBottom: '0.75rem',
  },
  resultQuote: {
    fontStyle: 'italic',
    opacity: 0.65,
    margin: '0.5rem 0 1rem',
    lineHeight: 1.5,
  },
  traitBadge: {
    display: 'inline-block',
    padding: '0.3rem 0.75rem',
    borderRadius: '999px',
    background: 'rgba(192,132,252,0.2)',
    fontSize: '0.82rem',
    margin: '0.25rem',
    border: '1px solid rgba(192,132,252,0.3)',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem',
    flexWrap: 'wrap' as const,
  },
  statPill: {
    fontSize: '0.82rem',
    padding: '0.3rem 0.75rem',
    borderRadius: '999px',
    background: 'rgba(96,165,250,0.15)',
    border: '1px solid rgba(96,165,250,0.25)',
  },

  /* ── empty state ──────────────────────────────────────────────── */
  empty: {
    opacity: 0.5,
    marginTop: '3rem',
    textAlign: 'center' as const,
    fontSize: '1.1rem',
  },

  /* ── match count ──────────────────────────────────────────────── */
  matchCount: {
    fontSize: '0.85rem',
    opacity: 0.5,
    marginBottom: '0.5rem',
  },
}
