import { useState, useMemo, type CSSProperties } from 'react'
import type { Show, SortField, StatusFilter } from './interfaces'
import { STUDIOS, INITIAL_SHOWS, ALL_TAGS } from './constants/data'

/* ── helpers ───────────────────────────────────────────────────── */

function studioName(studioId: string): string {
  return STUDIOS.find((s) => s.id === studioId)?.name ?? studioId
}

function studioLogo(studioId: string): string {
  return STUDIOS.find((s) => s.id === studioId)?.logo ?? '🎞️'
}

const STATUS_COLORS: Record<Show['status'], string> = {
  Airing: '#31d071',
  Completed: '#5b8aff',
  Upcoming: '#f0c040',
  Cancelled: '#e05050',
}

/* ── inline styles ─────────────────────────────────────────────── */

const css = {
  page: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '2rem 1rem',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#f0f4ff',
  } satisfies CSSProperties,
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  } satisfies CSSProperties,
  title: {
    fontSize: '2.4rem',
    margin: 0,
    background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } satisfies CSSProperties,
  subtitle: {
    color: '#94a3b8',
    marginTop: '0.4rem',
    fontSize: '1rem',
  } satisfies CSSProperties,

  /* controls */
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    alignItems: 'center',
  } satisfies CSSProperties,
  search: {
    flex: '1 1 220px',
    padding: '0.6rem 1rem',
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#f0f4ff',
    fontSize: '0.95rem',
  } satisfies CSSProperties,
  select: {
    padding: '0.6rem 0.8rem',
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#f0f4ff',
    fontSize: '0.9rem',
    cursor: 'pointer',
  } satisfies CSSProperties,

  /* tabs */
  tabBar: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #1e293b',
    paddingBottom: '0.5rem',
    overflowX: 'auto',
  } satisfies CSSProperties,
  tab: (active: boolean): CSSProperties => ({
    padding: '0.5rem 1.2rem',
    borderRadius: '8px 8px 0 0',
    border: 'none',
    background: active ? '#4f46e5' : 'transparent',
    color: active ? '#fff' : '#94a3b8',
    cursor: 'pointer',
    fontWeight: active ? 700 : 400,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  }),

  /* show cards */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  } satisfies CSSProperties,
  card: {
    background: '#1e293b',
    borderRadius: 12,
    padding: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transition: 'transform 0.15s, box-shadow 0.15s',
    cursor: 'pointer',
    border: '1px solid #334155',
    position: 'relative',
  } satisfies CSSProperties,
  cardHover: {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  } satisfies CSSProperties,
  cardEmoji: {
    fontSize: '2.5rem',
    lineHeight: 1,
  } satisfies CSSProperties,
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: 0,
  } satisfies CSSProperties,
  cardMeta: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  } satisfies CSSProperties,
  statusBadge: (status: Show['status']): CSSProperties => ({
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: 6,
    fontSize: '0.75rem',
    fontWeight: 600,
    background: `${STATUS_COLORS[status]}22`,
    color: STATUS_COLORS[status],
    border: `1px solid ${STATUS_COLORS[status]}44`,
  }),
  cardDesc: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
    lineHeight: 1.5,
    margin: 0,
  } satisfies CSSProperties,
  tags: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
    marginTop: 'auto',
  } satisfies CSSProperties,
  tag: {
    fontSize: '0.7rem',
    padding: '0.15rem 0.45rem',
    borderRadius: 4,
    background: '#334155',
    color: '#a5b4fc',
  } satisfies CSSProperties,
  rating: {
    fontSize: '0.8rem',
    color: '#fbbf24',
    fontWeight: 700,
  } satisfies CSSProperties,
  favBtn: (fav: boolean): CSSProperties => ({
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'none',
    border: 'none',
    fontSize: '1.3rem',
    cursor: 'pointer',
    filter: fav ? 'none' : 'grayscale(1) opacity(0.4)',
    transition: 'filter 0.2s',
  }),

  /* studio section */
  studioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  } satisfies CSSProperties,
  studioCard: {
    background: '#1e293b',
    borderRadius: 12,
    padding: '1rem',
    border: '1px solid #334155',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
  } satisfies CSSProperties,
  studioLogo: {
    fontSize: '2rem',
    lineHeight: 1,
    flexShrink: 0,
  } satisfies CSSProperties,
  studioInfo: {
    flex: 1,
    minWidth: 0,
  } satisfies CSSProperties,
  studioName: {
    fontWeight: 700,
    fontSize: '1rem',
    margin: 0,
  } satisfies CSSProperties,
  studioMeta: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    margin: '0.25rem 0 0.4rem',
  } satisfies CSSProperties,
  studioDesc: {
    fontSize: '0.82rem',
    color: '#cbd5e1',
    lineHeight: 1.45,
    margin: 0,
  } satisfies CSSProperties,
  studioLink: {
    fontSize: '0.78rem',
    color: '#818cf8',
    marginTop: '0.35rem',
    display: 'inline-block',
  } satisfies CSSProperties,

  /* detail modal */
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  } satisfies CSSProperties,
  modal: {
    background: '#0f172a',
    borderRadius: 16,
    padding: '2rem',
    maxWidth: 500,
    width: '100%',
    position: 'relative',
    border: '1px solid #334155',
    maxHeight: '90vh',
    overflowY: 'auto',
  } satisfies CSSProperties,
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.4rem',
    cursor: 'pointer',
  } satisfies CSSProperties,

  /* stats */
  stats: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  } satisfies CSSProperties,
  statBox: {
    background: '#1e293b',
    borderRadius: 10,
    padding: '0.8rem 1.2rem',
    border: '1px solid #334155',
    textAlign: 'center',
    flex: '1 1 120px',
  } satisfies CSSProperties,
  statNum: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#a78bfa',
  } satisfies CSSProperties,
  statLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.15rem',
  } satisfies CSSProperties,

  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#64748b',
    fontSize: '1.1rem',
  } satisfies CSSProperties,
}

/* ── main component ────────────────────────────────────────────── */

type ViewTab = 'shows' | 'studios' | 'favorites'

export default function IndieAnimatedShowsPage(): React.JSX.Element {
  const [shows, setShows] = useState<Show[]>(INITIAL_SHOWS)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('rating')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [studioFilter, setStudioFilter] = useState('All')
  const [tagFilter, setTagFilter] = useState('All')
  const [activeTab, setActiveTab] = useState<ViewTab>('shows')
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [selectedShow, setSelectedShow] = useState<Show | null>(null)

  /* derived */
  const filtered = useMemo(() => {
    let list = activeTab === 'favorites' ? shows.filter((s) => s.favorite) : shows

    if (statusFilter !== 'All') list = list.filter((s) => s.status === statusFilter)
    if (studioFilter !== 'All') list = list.filter((s) => s.studioId === studioFilter)
    if (tagFilter !== 'All') list = list.filter((s) => s.tags.includes(tagFilter))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          studioName(s.studioId).toLowerCase().includes(q)
      )
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'year') return b.year - a.year
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'studio') return studioName(a.studioId).localeCompare(studioName(b.studioId))
      return 0
    })

    return list
  }, [shows, search, sortBy, statusFilter, studioFilter, tagFilter, activeTab])

  const favCount = shows.filter((s) => s.favorite).length
  const avgRating = shows.length ? (shows.reduce((a, s) => a + s.rating, 0) / shows.length).toFixed(1) : '0'
  const studioCount = new Set(shows.map((s) => s.studioId)).size

  function toggleFavorite(id: number): void {
    setShows((prev) => prev.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s)))
  }

  /* ── render ──────────────────────────────────────────────────── */

  return (
    <div style={css.page}>
      {/* header */}
      <header style={css.header}>
        <h1 style={css.title}>🎞️ Indie Animated Shows</h1>
        <p style={css.subtitle}>Curated collection of independent & creator-driven animated shows and studios</p>
      </header>

      {/* stats */}
      <div style={css.stats}>
        <div style={css.statBox}>
          <div style={css.statNum}>{shows.length}</div>
          <div style={css.statLabel}>Shows</div>
        </div>
        <div style={css.statBox}>
          <div style={css.statNum}>{studioCount}</div>
          <div style={css.statLabel}>Studios</div>
        </div>
        <div style={css.statBox}>
          <div style={css.statNum}>⭐ {avgRating}</div>
          <div style={css.statLabel}>Avg Rating</div>
        </div>
        <div style={css.statBox}>
          <div style={css.statNum}>❤️ {favCount}</div>
          <div style={css.statLabel}>Favorites</div>
        </div>
      </div>

      {/* tabs */}
      <div style={css.tabBar}>
        {(['shows', 'studios', 'favorites'] as ViewTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            style={css.tab(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'shows' && '📺 Shows'}
            {tab === 'studios' && '🏢 Studios'}
            {tab === 'favorites' && `❤️ Favorites (${favCount})`}
          </button>
        ))}
      </div>

      {/* controls (shows + favorites tabs) */}
      {activeTab !== 'studios' && (
        <div style={css.controls}>
          <input
            type="text"
            placeholder="Search shows, studios …"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={css.search}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} style={css.select}>
            <option value="All">All Statuses</option>
            <option value="Airing">Airing</option>
            <option value="Completed">Completed</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select value={studioFilter} onChange={(e) => setStudioFilter(e.target.value)} style={css.select}>
            <option value="All">All Studios</option>
            {STUDIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} style={css.select}>
            <option value="All">All Tags</option>
            {ALL_TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)} style={css.select}>
            <option value="rating">Sort: Rating</option>
            <option value="title">Sort: Title</option>
            <option value="year">Sort: Year</option>
            <option value="studio">Sort: Studio</option>
          </select>
        </div>
      )}

      {/* studios tab */}
      {activeTab === 'studios' && (
        <div style={css.studioGrid}>
          {STUDIOS.map((studio) => {
            const count = shows.filter((s) => s.studioId === studio.id).length
            return (
              <div key={studio.id} style={css.studioCard}>
                <div style={css.studioLogo}>{studio.logo}</div>
                <div style={css.studioInfo}>
                  <p style={css.studioName}>{studio.name}</p>
                  <p style={css.studioMeta}>
                    {studio.country} · Est. {studio.founded} · {count} show{count !== 1 ? 's' : ''}
                  </p>
                  <p style={css.studioDesc}>{studio.description}</p>
                  <a href={studio.website} target="_blank" rel="noopener noreferrer" style={css.studioLink}>
                    {studio.website.replace(/^https?:\/\//, '')} ↗
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* shows / favorites grid */}
      {activeTab !== 'studios' && (
        <>
          {filtered.length === 0 ? (
            <div style={css.empty}>
              {activeTab === 'favorites' ? '❤️ No favorites yet — tap the heart on any show card!' : 'No shows match your filters.'}
            </div>
          ) : (
            <div style={css.grid}>
              {filtered.map((show) => (
                <div
                  key={show.id}
                  style={{
                    ...css.card,
                    ...(hoveredCard === show.id ? css.cardHover : {}),
                  }}
                  onMouseEnter={() => setHoveredCard(show.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setSelectedShow(show)}
                >
                  <button
                    type="button"
                    style={css.favBtn(show.favorite)}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(show.id)
                    }}
                    aria-label={show.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    ❤️
                  </button>
                  <div style={css.cardEmoji}>{show.image}</div>
                  <p style={css.cardTitle}>{show.title}</p>
                  <div style={css.cardMeta}>
                    <span>
                      {studioLogo(show.studioId)} {studioName(show.studioId)}
                    </span>
                    <span>{show.year}</span>
                    <span>
                      {show.seasons} season{show.seasons !== 1 ? 's' : ''}
                    </span>
                    <span style={css.statusBadge(show.status)}>{show.status}</span>
                    <span style={css.rating}>⭐ {show.rating}</span>
                  </div>
                  <p style={css.cardDesc}>{show.description}</p>
                  <div style={css.tags}>
                    {show.tags.map((t) => (
                      <span key={t} style={css.tag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* detail modal */}
      {selectedShow && (
        <div style={css.overlay} onClick={() => setSelectedShow(null)}>
          <div style={css.modal} onClick={(e) => e.stopPropagation()}>
            <button type="button" style={css.closeBtn} onClick={() => setSelectedShow(null)}>
              ✕
            </button>
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '0.5rem' }}>{selectedShow.image}</div>
            <h2 style={{ textAlign: 'center', margin: '0 0 0.25rem' }}>{selectedShow.title}</h2>
            <p style={{ textAlign: 'center', color: '#94a3b8', margin: '0 0 1rem', fontSize: '0.9rem' }}>
              {studioLogo(selectedShow.studioId)} {studioName(selectedShow.studioId)} · {selectedShow.year} ·{' '}
              {selectedShow.seasons} season{selectedShow.seasons !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={css.statusBadge(selectedShow.status)}>{selectedShow.status}</span>
              <span style={css.rating}>⭐ {selectedShow.rating}/10</span>
            </div>
            <p style={{ lineHeight: 1.7, color: '#cbd5e1', fontSize: '0.95rem' }}>{selectedShow.description}</p>
            <div style={{ ...css.tags, marginTop: '1rem', justifyContent: 'center' }}>
              {selectedShow.tags.map((t) => (
                <span key={t} style={{ ...css.tag, fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                  {t}
                </span>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
              <button
                type="button"
                onClick={() => toggleFavorite(selectedShow.id)}
                style={{
                  padding: '0.6rem 1.6rem',
                  borderRadius: 8,
                  border: 'none',
                  background: selectedShow.favorite ? '#ef4444' : '#4f46e5',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                {selectedShow.favorite ? '💔 Remove Favorite' : '❤️ Add to Favorites'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
