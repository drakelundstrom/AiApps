import { useState, useCallback, useRef } from 'react'

/* ── tier definitions ──────────────────────────────────────────── */

const TIERS = [
  { id: 'S', label: 'S', color: '#ff7f7f', description: 'God Tier – the absolute best' },
  { id: 'A', label: 'A', color: '#ffbf7f', description: 'Excellent – top picks' },
  { id: 'B', label: 'B', color: '#ffdf7f', description: 'Great – very solid games' },
  { id: 'C', label: 'C', color: '#ffff7f', description: 'Good – enjoyable but flawed' },
  { id: 'D', label: 'D', color: '#bfff7f', description: 'Decent – situational fun' },
  { id: 'F', label: 'F', color: '#7fffff', description: 'Skip – not recommended' },
]

/* ── deck builder games database ───────────────────────────────── */

const ALL_GAMES = [
  // S Tier
  { id: 1, name: 'Dominion', year: 2008, players: '2-4', defaultTier: 'S', img: '👑', desc: 'The OG that started it all. Endless replayability with 14+ expansions.' },
  { id: 2, name: 'Marvel Champions', year: 2019, players: '1-4', defaultTier: 'S', img: '🕷️', desc: 'Living Card Game meets deck building. Incredible hero customization.' },
  { id: 3, name: 'Aeon\'s End', year: 2016, players: '1-4', defaultTier: 'S', img: '🔮', desc: 'Cooperative breach mage combat. No shuffling mechanic is genius.' },
  // A Tier
  { id: 4, name: 'DC Deck-Building Game', year: 2012, players: '2-5', defaultTier: 'A', img: '🦇', desc: 'Fast, fun, and thematic. The Cerberus engine at its finest.' },
  { id: 5, name: 'Star Realms', year: 2014, players: '2', defaultTier: 'A', img: '🚀', desc: 'Compact, aggressive, and highly portable. Great 1v1 experience.' },
  { id: 6, name: 'Clank!', year: 2016, players: '2-4', defaultTier: 'A', img: '🐉', desc: 'Deck building + dungeon crawling. Push-your-luck dragon encounters.' },
  { id: 7, name: 'Legendary: A Marvel', year: 2012, players: '1-5', defaultTier: 'A', img: '🦸', desc: 'Semi-cooperative Marvel mayhem. Tons of expansions available.' },
  { id: 8, name: 'Dune: Imperium', year: 2020, players: '1-4', defaultTier: 'A', img: '🏜️', desc: 'Worker placement + deck building masterclass. Spice must flow.' },
  // B Tier
  { id: 9, name: 'Ascension', year: 2010, players: '1-4', defaultTier: 'B', img: '⚔️', desc: 'Digital-first design with great app. Fast center row gameplay.' },
  { id: 10, name: 'Thunderstone Quest', year: 2018, players: '2-4', defaultTier: 'B', img: '⚡', desc: 'Dungeon + village dual lanes. Deep RPG-style progression.' },
  { id: 11, name: 'Hogwarts Battle', year: 2016, players: '2-4', defaultTier: 'B', img: '🧙', desc: 'Perfect gateway co-op. Grows with you across 7 campaigns.' },
  { id: 12, name: 'Undaunted: Normandy', year: 2019, players: '2', defaultTier: 'B', img: '🎖️', desc: 'WWII deck building + tactical grid. Tense 2-player head-to-head.' },
  { id: 13, name: 'Mystic Vale', year: 2016, players: '2-4', defaultTier: 'B', img: '🌿', desc: 'Card crafting innovation — slide upgrades into clear sleeves.' },
  // C Tier
  { id: 14, name: 'Hero Realms', year: 2016, players: '2-4', defaultTier: 'C', img: '🗡️', desc: 'Fantasy-themed Star Realms. Boss/Campaign modes add depth.' },
  { id: 15, name: 'Trains', year: 2012, players: '2-4', defaultTier: 'C', img: '🚂', desc: 'Dominion on rails with a shared board. Unique waste mechanic.' },
  { id: 16, name: 'Paperback', year: 2014, players: '2-5', defaultTier: 'C', img: '📖', desc: 'Deck building meets word game. Scrabble fans rejoice.' },
  { id: 17, name: 'The Quest for El Dorado', year: 2017, players: '2-4', defaultTier: 'C', img: '🗺️', desc: 'Racing + deck building by Reiner Knizia. Streamlined excellence.' },
  // D Tier
  { id: 18, name: 'Tanto Cuore', year: 2009, players: '2-4', defaultTier: 'D', img: '🎀', desc: 'Anime maid theme Dominion clone. Niche audience but functional.' },
  { id: 19, name: 'Valley of the Kings', year: 2014, players: '2-4', defaultTier: 'D', img: '🏺', desc: 'Entombing mechanic is clever. Small box, big decisions.' },
  { id: 20, name: 'Vikings Gone Wild', year: 2016, players: '2-4', defaultTier: 'D', img: '🪓', desc: 'Base-building deck builder. Better as a mobile game.' },
  // F Tier
  { id: 21, name: 'Legendary: Encounters Alien', year: 2014, players: '1-5', defaultTier: 'F', img: '👽', desc: 'Great theme, rules are a nightmare. Fiddly and confusing.' },
  { id: 22, name: 'Xenoshyft', year: 2015, players: '1-4', defaultTier: 'F', img: '🐛', desc: 'Brutally hard co-op. More punishing than fun for most groups.' },
]

/* ── component ─────────────────────────────────────────────────── */

export default function DeckBuilderTierList() {
  const [placements, setPlacements] = useState(() => {
    const map = {}
    ALL_GAMES.forEach(g => { map[g.id] = g.defaultTier })
    return map
  })
  const [dragId, setDragId] = useState(null)
  const [hoveredTier, setHoveredTier] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [filterText, setFilterText] = useState('')
  const [resetConfirm, setResetConfirm] = useState(false)
  const dragRef = useRef(null)

  /* drag-and-drop handlers */
  const handleDragStart = useCallback((e, gameId) => {
    setDragId(gameId)
    dragRef.current = gameId
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(gameId))
  }, [])

  const handleDragOver = useCallback((e, tierId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setHoveredTier(tierId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setHoveredTier(null)
  }, [])

  const handleDrop = useCallback((e, tierId) => {
    e.preventDefault()
    const gameId = parseInt(e.dataTransfer.getData('text/plain'), 10) || dragRef.current
    if (gameId) {
      setPlacements(prev => ({ ...prev, [gameId]: tierId }))
    }
    setDragId(null)
    setHoveredTier(null)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragId(null)
    setHoveredTier(null)
  }, [])

  /* move game via buttons (mobile-friendly) */
  const moveGame = useCallback((gameId, tierId) => {
    setPlacements(prev => ({ ...prev, [gameId]: tierId }))
    setSelectedGame(null)
  }, [])

  /* reset to defaults */
  const resetAll = useCallback(() => {
    const map = {}
    ALL_GAMES.forEach(g => { map[g.id] = g.defaultTier })
    setPlacements(map)
    setResetConfirm(false)
  }, [])

  /* games for a tier */
  const gamesInTier = (tierId) =>
    ALL_GAMES.filter(g => placements[g.id] === tierId)
      .filter(g => !filterText || g.name.toLowerCase().includes(filterText.toLowerCase()))

  /* counts */
  const totalGames = ALL_GAMES.length
  const movedGames = ALL_GAMES.filter(g => placements[g.id] !== g.defaultTier).length

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🃏 Deck Builder Tier List</h1>
        <p style={styles.subtitle}>
          Ranking the best (and worst) deck-building board games. Drag & drop to rearrange!
        </p>
      </header>

      {/* toolbar */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="🔍 Filter games..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.stats}>
          {totalGames} games{movedGames > 0 ? ` · ${movedGames} moved` : ''}
        </span>
        {movedGames > 0 && (
          resetConfirm ? (
            <span style={styles.confirmGroup}>
              <span style={styles.confirmText}>Reset all?</span>
              <button onClick={resetAll} style={{ ...styles.btn, ...styles.btnDanger }}>Yes</button>
              <button onClick={() => setResetConfirm(false)} style={styles.btn}>No</button>
            </span>
          ) : (
            <button onClick={() => setResetConfirm(true)} style={styles.btn}>
              ↺ Reset
            </button>
          )
        )}
      </div>

      {/* tier rows */}
      <div style={styles.tierList}>
        {TIERS.map(tier => {
          const games = gamesInTier(tier.id)
          const isOver = hoveredTier === tier.id
          return (
            <div
              key={tier.id}
              style={{
                ...styles.tierRow,
                ...(isOver ? styles.tierRowHover : {}),
              }}
              onDragOver={e => handleDragOver(e, tier.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, tier.id)}
            >
              <div style={{ ...styles.tierLabel, backgroundColor: tier.color }}>
                <span style={styles.tierLetter}>{tier.label}</span>
                <span style={styles.tierDesc}>{tier.description}</span>
              </div>
              <div style={styles.tierGames}>
                {games.length === 0 && (
                  <span style={styles.emptySlot}>Drop games here</span>
                )}
                {games.map(game => (
                  <div
                    key={game.id}
                    draggable
                    onDragStart={e => handleDragStart(e, game.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedGame(selectedGame?.id === game.id ? null : game)}
                    style={{
                      ...styles.gameCard,
                      ...(dragId === game.id ? styles.gameCardDragging : {}),
                      ...(placements[game.id] !== game.defaultTier ? styles.gameCardMoved : {}),
                    }}
                    title={`${game.name} (${game.year}) — ${game.players} players`}
                  >
                    <span style={styles.gameEmoji}>{game.img}</span>
                    <span style={styles.gameName}>{game.name}</span>
                    {placements[game.id] !== game.defaultTier && (
                      <span style={styles.movedBadge} title={`Originally ${game.defaultTier} tier`}>
                        ↕
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* selected game detail panel */}
      {selectedGame && (
        <div style={styles.detailOverlay} onClick={() => setSelectedGame(null)}>
          <div style={styles.detailPanel} onClick={e => e.stopPropagation()}>
            <button style={styles.detailClose} onClick={() => setSelectedGame(null)}>✕</button>
            <div style={styles.detailEmoji}>{selectedGame.img}</div>
            <h2 style={styles.detailTitle}>{selectedGame.name}</h2>
            <div style={styles.detailMeta}>
              <span style={styles.metaTag}>📅 {selectedGame.year}</span>
              <span style={styles.metaTag}>👥 {selectedGame.players}</span>
              <span style={{
                ...styles.metaTag,
                backgroundColor: TIERS.find(t => t.id === placements[selectedGame.id])?.color || '#888',
                color: '#1a1a2e',
                fontWeight: 700,
              }}>
                Tier {placements[selectedGame.id]}
              </span>
              {placements[selectedGame.id] !== selectedGame.defaultTier && (
                <span style={styles.metaTag}>was {selectedGame.defaultTier}</span>
              )}
            </div>
            <p style={styles.detailDesc}>{selectedGame.desc}</p>
            <div style={styles.moveBtns}>
              <span style={styles.moveLabel}>Move to:</span>
              {TIERS.map(t => (
                <button
                  key={t.id}
                  onClick={() => moveGame(selectedGame.id, t.id)}
                  disabled={placements[selectedGame.id] === t.id}
                  style={{
                    ...styles.moveBtn,
                    backgroundColor: placements[selectedGame.id] === t.id ? '#555' : t.color,
                    color: '#1a1a2e',
                    opacity: placements[selectedGame.id] === t.id ? 0.4 : 1,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* legend */}
      <div style={styles.legend}>
        <p style={styles.legendTitle}>How to use</p>
        <ul style={styles.legendList}>
          <li><strong>Drag & drop</strong> game cards between tiers to re-rank them</li>
          <li><strong>Click</strong> a game card to see details and move via buttons (mobile-friendly)</li>
          <li>Games you&apos;ve moved show a <span style={{ color: '#a78bfa' }}>↕</span> indicator</li>
          <li>Use <strong>Reset</strong> to restore the default rankings</li>
        </ul>
      </div>
    </div>
  )
}

/* ── styles ─────────────────────────────────────────────────────── */

const styles = {
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '2rem 1rem',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#e2e8f0',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
    margin: 0,
    background: 'linear-gradient(135deg, #f59e0b, #ef4444, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#94a3b8',
    marginTop: '0.4rem',
    fontSize: '0.95rem',
  },

  /* toolbar */
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
    padding: '0.6rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
  },
  searchInput: {
    flex: '1 1 180px',
    padding: '0.45rem 0.75rem',
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    outline: 'none',
  },
  stats: {
    color: '#64748b',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },
  confirmGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  confirmText: {
    color: '#fbbf24',
    fontSize: '0.85rem',
  },
  btn: {
    padding: '0.35rem 0.75rem',
    borderRadius: 6,
    border: '1px solid #475569',
    background: '#334155',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },
  btnDanger: {
    background: '#dc2626',
    borderColor: '#dc2626',
    color: '#fff',
  },

  /* tier list */
  tierList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #334155',
  },
  tierRow: {
    display: 'flex',
    minHeight: 72,
    transition: 'background 0.15s',
    background: 'rgba(30,41,59,0.6)',
  },
  tierRowHover: {
    background: 'rgba(100,116,139,0.25)',
    boxShadow: 'inset 0 0 0 2px #64748b',
  },
  tierLabel: {
    width: 100,
    minWidth: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 0.25rem',
    color: '#1a1a2e',
    userSelect: 'none',
  },
  tierLetter: {
    fontSize: '1.8rem',
    fontWeight: 900,
    lineHeight: 1,
  },
  tierDesc: {
    fontSize: '0.55rem',
    textAlign: 'center',
    fontWeight: 600,
    opacity: 0.8,
    marginTop: 2,
    lineHeight: 1.2,
    padding: '0 4px',
  },
  tierGames: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    padding: '8px 10px',
    minHeight: 56,
  },
  emptySlot: {
    color: '#475569',
    fontSize: '0.8rem',
    fontStyle: 'italic',
  },

  /* game cards */
  gameCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 10px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    cursor: 'grab',
    userSelect: 'none',
    transition: 'transform 0.12s, box-shadow 0.12s',
    fontSize: '0.82rem',
    position: 'relative',
  },
  gameCardDragging: {
    opacity: 0.4,
    transform: 'scale(0.95)',
  },
  gameCardMoved: {
    borderColor: '#7c3aed',
    boxShadow: '0 0 6px rgba(124,58,237,0.3)',
  },
  gameEmoji: {
    fontSize: '1.1rem',
  },
  gameName: {
    fontWeight: 600,
    color: '#e2e8f0',
    whiteSpace: 'nowrap',
  },
  movedBadge: {
    color: '#a78bfa',
    fontWeight: 700,
    fontSize: '0.75rem',
    marginLeft: 2,
  },

  /* detail panel */
  detailOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  detailPanel: {
    background: '#1e293b',
    borderRadius: 16,
    padding: '2rem',
    maxWidth: 420,
    width: '100%',
    position: 'relative',
    border: '1px solid #334155',
    boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
  },
  detailClose: {
    position: 'absolute',
    top: 12,
    right: 14,
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  detailEmoji: {
    fontSize: '3rem',
    textAlign: 'center',
  },
  detailTitle: {
    textAlign: 'center',
    margin: '0.5rem 0 0.75rem',
    fontSize: '1.4rem',
    color: '#f8fafc',
  },
  detailMeta: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  metaTag: {
    padding: '3px 10px',
    borderRadius: 20,
    background: 'rgba(255,255,255,0.08)',
    fontSize: '0.8rem',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
  },
  detailDesc: {
    color: '#cbd5e1',
    fontSize: '0.95rem',
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: '1.25rem',
  },
  moveBtns: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  moveLabel: {
    color: '#64748b',
    fontSize: '0.8rem',
    marginRight: 4,
  },
  moveBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: 'none',
    fontWeight: 800,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'transform 0.1s',
  },

  /* legend */
  legend: {
    marginTop: '1.5rem',
    padding: '1rem 1.25rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    border: '1px solid #1e293b',
  },
  legendTitle: {
    margin: '0 0 0.5rem',
    fontWeight: 700,
    color: '#94a3b8',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  legendList: {
    margin: 0,
    paddingLeft: '1.2rem',
    color: '#64748b',
    fontSize: '0.85rem',
    lineHeight: 1.7,
  },
}
