import { useState, useCallback, useRef, useEffect } from 'react'

/* ── card database ─────────────────────────────────────────────── */

const CARD_TYPES = ['Hero', 'Villain', 'Super Power', 'Equipment', 'Location', 'Starter']
const TYPE_EMOJI = {
  Hero: '🦸', Villain: '🦹', 'Super Power': '⚡',
  Equipment: '🛡️', Location: '🏙️', Starter: '🃏',
}

const PRESET_CARDS = [
  // Heroes
  { name: 'Superman', type: 'Hero', vp: 7 },
  { name: 'Batman', type: 'Hero', vp: 5 },
  { name: 'Wonder Woman', type: 'Hero', vp: 6 },
  { name: 'Aquaman', type: 'Hero', vp: 4 },
  { name: 'The Flash', type: 'Hero', vp: 4 },
  { name: 'Green Lantern', type: 'Hero', vp: 5 },
  { name: 'Cyborg', type: 'Hero', vp: 3 },
  { name: 'Martian Manhunter', type: 'Hero', vp: 5 },
  { name: 'Hawkgirl', type: 'Hero', vp: 3 },
  { name: 'Zatanna', type: 'Hero', vp: 4 },
  { name: 'Green Arrow', type: 'Hero', vp: 3 },
  { name: 'Batgirl', type: 'Hero', vp: 3 },
  { name: 'Shazam!', type: 'Hero', vp: 6 },
  { name: 'Swamp Thing', type: 'Hero', vp: 5 },
  { name: 'Starfire', type: 'Hero', vp: 3 },
  // Villains
  { name: 'Lex Luthor', type: 'Villain', vp: 6 },
  { name: 'The Joker', type: 'Villain', vp: 5 },
  { name: 'Darkseid', type: 'Villain', vp: 8 },
  { name: 'Deathstroke', type: 'Villain', vp: 4 },
  { name: 'Sinestro', type: 'Villain', vp: 5 },
  { name: 'Brainiac', type: 'Villain', vp: 6 },
  { name: 'Black Manta', type: 'Villain', vp: 4 },
  { name: 'Harley Quinn', type: 'Villain', vp: 3 },
  { name: 'Poison Ivy', type: 'Villain', vp: 3 },
  { name: 'Bane', type: 'Villain', vp: 4 },
  { name: 'Circe', type: 'Villain', vp: 5 },
  { name: 'Scarecrow', type: 'Villain', vp: 3 },
  // Super Powers
  { name: 'Heat Vision', type: 'Super Power', vp: 3 },
  { name: 'Super Strength', type: 'Super Power', vp: 3 },
  { name: 'Super Speed', type: 'Super Power', vp: 2 },
  { name: 'X-Ray Vision', type: 'Super Power', vp: 2 },
  { name: 'Telepathy', type: 'Super Power', vp: 2 },
  { name: 'Power Ring', type: 'Super Power', vp: 3 },
  { name: 'Lasso of Truth', type: 'Super Power', vp: 3 },
  { name: 'Trident Strike', type: 'Super Power', vp: 2 },
  { name: 'Freeze Breath', type: 'Super Power', vp: 2 },
  // Equipment
  { name: 'Batmobile', type: 'Equipment', vp: 3 },
  { name: 'Utility Belt', type: 'Equipment', vp: 2 },
  { name: 'Bat-Signal', type: 'Equipment', vp: 2 },
  { name: 'Power Suit', type: 'Equipment', vp: 3 },
  { name: 'Kryptonite Shard', type: 'Equipment', vp: 2 },
  { name: 'Nth Metal', type: 'Equipment', vp: 3 },
  { name: 'Mother Box', type: 'Equipment', vp: 4 },
  // Locations
  { name: 'Batcave', type: 'Location', vp: 3 },
  { name: 'Fortress of Solitude', type: 'Location', vp: 4 },
  { name: 'Themyscira', type: 'Location', vp: 3 },
  { name: 'Atlantis', type: 'Location', vp: 3 },
  { name: 'Arkham Asylum', type: 'Location', vp: 2 },
  { name: 'Watchtower', type: 'Location', vp: 4 },
  { name: 'Hall of Justice', type: 'Location', vp: 3 },
  // Starters (worth 0 usually)
  { name: 'Punch', type: 'Starter', vp: 0 },
  { name: 'Vulnerability', type: 'Starter', vp: 0 },
  { name: 'Kick', type: 'Starter', vp: 1 },
]

/* ── helpers ────────────────────────────────────────────────────── */

const PLAYER_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899',
]

function initialPlayer(id, idx) {
  return {
    id,
    name: `Player ${idx + 1}`,
    colorIdx: idx % PLAYER_COLORS.length,
    cards: [],
    bonusVP: 0,
  }
}

function playerVP(player) {
  return player.cards.reduce((sum, c) => sum + c.vp * c.qty, 0) + player.bonusVP
}

/* ── component ─────────────────────────────────────────────────── */

export default function DCDeckBuilder() {
  const [players, setPlayers] = useState([initialPlayer(1, 0), initialPlayer(2, 1)])
  const [activePlayerId, setActivePlayerId] = useState(1)
  const [nextId, setNextId] = useState(3)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [showCustom, setShowCustom] = useState(false)
  const [customCard, setCustomCard] = useState({ name: '', type: 'Hero', vp: 1 })
  const [gameLog, setGameLog] = useState([])
  const [showLog, setShowLog] = useState(false)
  const [showScoreboard, setShowScoreboard] = useState(false)
  const logEndRef = useRef(null)

  const activePlayer = players.find((p) => p.id === activePlayerId) || players[0]

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [gameLog])

  /* player management */
  const addPlayer = useCallback(() => {
    if (players.length >= 6) return
    setPlayers((prev) => [...prev, initialPlayer(nextId, prev.length)])
    setNextId((n) => n + 1)
  }, [players.length, nextId])

  const removePlayer = useCallback((id) => {
    setPlayers((prev) => {
      const next = prev.filter((p) => p.id !== id)
      if (next.length === 0) return prev
      return next
    })
    setActivePlayerId((curr) => {
      if (curr === id) {
        const remaining = players.filter((p) => p.id !== id)
        return remaining.length ? remaining[0].id : curr
      }
      return curr
    })
  }, [players])

  const renamePlayer = useCallback((id, name) => {
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, name } : p))
  }, [])

  /* card management */
  const addCardToPlayer = useCallback((card) => {
    setPlayers((prev) => prev.map((p) => {
      if (p.id !== activePlayerId) return p
      const existing = p.cards.find((c) => c.name === card.name && c.type === card.type)
      if (existing) {
        return { ...p, cards: p.cards.map((c) => c === existing ? { ...c, qty: c.qty + 1 } : c) }
      }
      return { ...p, cards: [...p.cards, { ...card, qty: 1 }] }
    }))
    setGameLog((prev) => [...prev, { time: new Date(), text: `${activePlayer.name} gained "${card.name}" (${card.vp} VP)` }])
  }, [activePlayerId, activePlayer.name])

  const removeCardFromPlayer = useCallback((cardName) => {
    setPlayers((prev) => prev.map((p) => {
      if (p.id !== activePlayerId) return p
      const existing = p.cards.find((c) => c.name === cardName)
      if (!existing) return p
      if (existing.qty > 1) {
        return { ...p, cards: p.cards.map((c) => c.name === cardName ? { ...c, qty: c.qty - 1 } : c) }
      }
      return { ...p, cards: p.cards.filter((c) => c.name !== cardName) }
    }))
    setGameLog((prev) => [...prev, { time: new Date(), text: `${activePlayer.name} removed a "${cardName}"` }])
  }, [activePlayerId, activePlayer.name])

  const setBonusVP = useCallback((id, val) => {
    const n = parseInt(val, 10)
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, bonusVP: isNaN(n) ? 0 : n } : p))
  }, [])

  const addCustomCard = useCallback((e) => {
    e.preventDefault()
    if (!customCard.name.trim()) return
    addCardToPlayer({ name: customCard.name.trim(), type: customCard.type, vp: parseInt(customCard.vp, 10) || 0 })
    setCustomCard({ name: '', type: 'Hero', vp: 1 })
    setShowCustom(false)
  }, [customCard, addCardToPlayer])

  const resetGame = useCallback(() => {
    setPlayers([initialPlayer(1, 0), initialPlayer(2, 1)])
    setActivePlayerId(1)
    setNextId(3)
    setGameLog([])
  }, [])

  /* filtered card catalog */
  const filteredCards = PRESET_CARDS
    .filter((c) => filterType === 'All' || c.type === filterType)
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  /* sorted leaderboard */
  const leaderboard = [...players].sort((a, b) => playerVP(b) - playerVP(a))

  return (
    <div className="page-container" style={styles.container}>
      {/* Header */}
      <div className="glass-card" style={styles.header}>
        <h1 style={styles.title}>🃏 DC Deck Builder — Victory Point Tracker</h1>
        <p style={styles.subtitle}>Track victory points for every player in your DC Deck Building Game sessions</p>
        <div style={styles.headerActions}>
          <button style={styles.btnSmall} onClick={() => setShowScoreboard((s) => !s)}>
            {showScoreboard ? 'Hide' : '🏆'} Scoreboard
          </button>
          <button style={styles.btnSmall} onClick={() => setShowLog((s) => !s)}>
            {showLog ? 'Hide' : '📜'} Game Log
          </button>
          <button style={{ ...styles.btnSmall, background: '#ef4444' }} onClick={resetGame}>
            🔄 New Game
          </button>
        </div>
      </div>

      {/* Scoreboard overlay */}
      {showScoreboard && (
        <div className="glass-card" style={styles.scoreboard}>
          <h2 style={styles.sectionTitle}>🏆 Scoreboard</h2>
          <div style={styles.leaderList}>
            {leaderboard.map((p, i) => (
              <div key={p.id} style={{ ...styles.leaderRow, borderLeft: `4px solid ${PLAYER_COLORS[p.colorIdx]}` }}>
                <span style={styles.leaderRank}>{i === 0 ? '👑' : `#${i + 1}`}</span>
                <span style={styles.leaderName}>{p.name}</span>
                <span style={styles.leaderVP}>{playerVP(p)} VP</span>
                <span style={styles.leaderCards}>{p.cards.reduce((s, c) => s + c.qty, 0)} cards</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game log overlay */}
      {showLog && (
        <div className="glass-card" style={styles.logPanel}>
          <h2 style={styles.sectionTitle}>📜 Game Log</h2>
          <div style={styles.logScroll}>
            {gameLog.length === 0 && <p style={styles.muted}>No actions yet — start adding cards!</p>}
            {gameLog.map((entry, i) => (
              <div key={i} style={styles.logEntry}>
                <span style={styles.logTime}>{entry.time.toLocaleTimeString()}</span>
                <span style={styles.logText}>{entry.text}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Player tabs */}
      <div className="glass-card" style={styles.playersCard}>
        <div style={styles.playerTabs}>
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlayerId(p.id)}
              style={{
                ...styles.playerTab,
                background: p.id === activePlayerId ? PLAYER_COLORS[p.colorIdx] : 'rgba(255,255,255,0.06)',
                color: p.id === activePlayerId ? '#fff' : '#aaa',
                fontWeight: p.id === activePlayerId ? 700 : 400,
              }}
            >
              {p.name} — {playerVP(p)} VP
            </button>
          ))}
          {players.length < 6 && (
            <button style={styles.addPlayerBtn} onClick={addPlayer}>+ Player</button>
          )}
        </div>

        {/* Active player detail */}
        <div style={styles.playerDetail}>
          <div style={styles.playerInfoRow}>
            <input
              type="text"
              value={activePlayer.name}
              onChange={(e) => renamePlayer(activePlayer.id, e.target.value)}
              style={{ ...styles.nameInput, borderColor: PLAYER_COLORS[activePlayer.colorIdx] }}
              maxLength={20}
            />
            <div style={styles.vpBadge}>
              <span style={styles.vpBigNum}>{playerVP(activePlayer)}</span>
              <span style={styles.vpLabel}>Total VP</span>
            </div>
            {players.length > 1 && (
              <button style={styles.removeBtn} onClick={() => removePlayer(activePlayer.id)}>✕ Remove</button>
            )}
          </div>

          {/* Bonus VP */}
          <div style={styles.bonusRow}>
            <label style={styles.bonusLabel}>Bonus / Penalty VP:</label>
            <input
              type="number"
              value={activePlayer.bonusVP}
              onChange={(e) => setBonusVP(activePlayer.id, e.target.value)}
              style={styles.bonusInput}
            />
          </div>

          {/* Player's cards */}
          <h3 style={styles.sectionTitle}>
            {activePlayer.name}'s Deck ({activePlayer.cards.reduce((s, c) => s + c.qty, 0)} cards)
          </h3>
          {activePlayer.cards.length === 0 ? (
            <p style={styles.muted}>No cards yet. Add cards from the catalog below!</p>
          ) : (
            <div style={styles.deckGrid}>
              {activePlayer.cards.map((card) => (
                <div key={card.name} style={styles.deckCard}>
                  <div style={styles.deckCardTop}>
                    <span style={styles.deckCardEmoji}>{TYPE_EMOJI[card.type] || '🃏'}</span>
                    <span style={styles.deckCardName}>{card.name}</span>
                    {card.qty > 1 && <span style={styles.qtyBadge}>×{card.qty}</span>}
                  </div>
                  <div style={styles.deckCardBot}>
                    <span style={styles.deckCardType}>{card.type}</span>
                    <span style={styles.deckCardVP}>{card.vp * card.qty} VP</span>
                    <button style={styles.removeMiniBtn} onClick={() => removeCardFromPlayer(card.name)}>−</button>
                    <button style={styles.addMiniBtn} onClick={() => addCardToPlayer(card)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VP breakdown */}
          {activePlayer.cards.length > 0 && (
            <div style={styles.breakdownWrap}>
              <h4 style={styles.breakdownTitle}>VP Breakdown</h4>
              <div style={styles.breakdownGrid}>
                {CARD_TYPES.map((type) => {
                  const sum = activePlayer.cards.filter((c) => c.type === type).reduce((s, c) => s + c.vp * c.qty, 0)
                  if (sum === 0) return null
                  return (
                    <div key={type} style={styles.breakdownItem}>
                      <span>{TYPE_EMOJI[type]} {type}</span>
                      <strong>{sum} VP</strong>
                    </div>
                  )
                })}
                {activePlayer.bonusVP !== 0 && (
                  <div style={styles.breakdownItem}>
                    <span>🎯 Bonus/Penalty</span>
                    <strong>{activePlayer.bonusVP > 0 ? '+' : ''}{activePlayer.bonusVP} VP</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card catalog */}
      <div className="glass-card" style={styles.catalogCard}>
        <h2 style={styles.sectionTitle}>📚 Card Catalog</h2>
        <div style={styles.catalogControls}>
          <input
            type="text"
            placeholder="Search cards…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.filterRow}>
            {['All', ...CARD_TYPES].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  ...styles.filterBtn,
                  background: filterType === t ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                  color: filterType === t ? '#fff' : '#aaa',
                }}
              >
                {t === 'All' ? '🗂️ All' : `${TYPE_EMOJI[t]} ${t}`}
              </button>
            ))}
          </div>
          <button style={styles.customToggle} onClick={() => setShowCustom((s) => !s)}>
            {showCustom ? '✕ Cancel' : '＋ Custom Card'}
          </button>
        </div>

        {/* Custom card form */}
        {showCustom && (
          <form onSubmit={addCustomCard} style={styles.customForm}>
            <input
              type="text"
              placeholder="Card name"
              value={customCard.name}
              onChange={(e) => setCustomCard((c) => ({ ...c, name: e.target.value }))}
              style={styles.customInput}
              maxLength={40}
            />
            <select
              value={customCard.type}
              onChange={(e) => setCustomCard((c) => ({ ...c, type: e.target.value }))}
              style={styles.customSelect}
            >
              {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="number"
              placeholder="VP"
              value={customCard.vp}
              onChange={(e) => setCustomCard((c) => ({ ...c, vp: e.target.value }))}
              style={styles.customVpInput}
              min={-10} max={20}
            />
            <button type="submit" style={styles.customSubmit}>Add to {activePlayer.name}</button>
          </form>
        )}

        {/* Card grid */}
        <div style={styles.catalogGrid}>
          {filteredCards.map((card) => {
            const existsInDeck = activePlayer.cards.find((c) => c.name === card.name)
            return (
              <button
                key={card.name}
                onClick={() => addCardToPlayer(card)}
                style={{
                  ...styles.catalogItem,
                  borderColor: existsInDeck ? PLAYER_COLORS[activePlayer.colorIdx] : 'rgba(255,255,255,0.1)',
                }}
              >
                <span style={styles.catEmoji}>{TYPE_EMOJI[card.type]}</span>
                <span style={styles.catName}>{card.name}</span>
                <span style={styles.catVP}>{card.vp} VP</span>
                <span style={styles.catType}>{card.type}</span>
                {existsInDeck && <span style={styles.catOwned}>×{existsInDeck.qty}</span>}
              </button>
            )
          })}
          {filteredCards.length === 0 && <p style={styles.muted}>No cards match your search.</p>}
        </div>
      </div>
    </div>
  )
}

/* ── styles ─────────────────────────────────────────────────────── */

const styles = {
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  header: {
    textAlign: 'center',
    padding: '2rem 1.5rem 1.5rem',
  },
  title: {
    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
    fontWeight: 800,
    margin: 0,
    background: 'linear-gradient(135deg, #3b82f6, #60a5fa, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#94a3b8',
    margin: '0.5rem 0 1rem',
    fontSize: '0.95rem',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnSmall: {
    padding: '0.45rem 1rem',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    background: '#3b82f6',
    color: '#fff',
    transition: 'opacity 0.15s',
  },
  /* Scoreboard */
  scoreboard: {
    padding: '1.5rem',
  },
  leaderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  leaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.04)',
  },
  leaderRank: { fontSize: '1.3rem', minWidth: 36, textAlign: 'center' },
  leaderName: { flex: 1, fontWeight: 600, color: '#e2e8f0' },
  leaderVP: { fontWeight: 700, color: '#fbbf24', fontSize: '1.1rem' },
  leaderCards: { color: '#94a3b8', fontSize: '0.85rem' },
  /* Game log */
  logPanel: { padding: '1.5rem' },
  logScroll: {
    maxHeight: 200,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginTop: '0.5rem',
  },
  logEntry: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.85rem',
    padding: '0.3rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  logTime: { color: '#64748b', fontFamily: 'monospace', minWidth: 80 },
  logText: { color: '#cbd5e1' },
  /* Player tabs */
  playersCard: { padding: '1.25rem' },
  playerTabs: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  playerTab: {
    padding: '0.5rem 1rem',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.15s',
  },
  addPlayerBtn: {
    padding: '0.5rem 1rem',
    borderRadius: 8,
    border: '1px dashed rgba(255,255,255,0.2)',
    background: 'transparent',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '0.85rem',
  },
  playerDetail: { padding: '0.5rem 0' },
  playerInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  nameInput: {
    flex: '1 1 180px',
    padding: '0.6rem 0.8rem',
    borderRadius: 8,
    border: '2px solid',
    background: 'rgba(255,255,255,0.06)',
    color: '#e2e8f0',
    fontSize: '1rem',
    fontWeight: 600,
    outline: 'none',
  },
  vpBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(251,191,36,0.12)',
    padding: '0.5rem 1.2rem',
    borderRadius: 12,
    minWidth: 80,
  },
  vpBigNum: { fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' },
  vpLabel: { fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  removeBtn: {
    padding: '0.4rem 0.8rem',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: 'rgba(239,68,68,0.15)',
    color: '#ef4444',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  bonusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  bonusLabel: { color: '#94a3b8', fontSize: '0.85rem' },
  bonusInput: {
    width: 70,
    padding: '0.4rem',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e2e8f0',
    fontSize: '0.95rem',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: '0.5rem 0',
  },
  muted: {
    color: '#64748b',
    fontSize: '0.9rem',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '1rem',
  },
  /* Player deck grid */
  deckGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  deckCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: '0.65rem 0.8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  deckCardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  deckCardEmoji: { fontSize: '1.1rem' },
  deckCardName: { flex: 1, fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' },
  qtyBadge: {
    background: '#3b82f6',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 700,
    borderRadius: 6,
    padding: '0.1rem 0.4rem',
  },
  deckCardBot: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.78rem',
  },
  deckCardType: { color: '#94a3b8', flex: 1 },
  deckCardVP: { fontWeight: 700, color: '#fbbf24' },
  removeMiniBtn: {
    width: 24, height: 24,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    background: 'rgba(239,68,68,0.2)',
    color: '#ef4444',
    fontWeight: 700,
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  addMiniBtn: {
    width: 24, height: 24,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    background: 'rgba(59,130,246,0.2)',
    color: '#60a5fa',
    fontWeight: 700,
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  /* VP Breakdown */
  breakdownWrap: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
  },
  breakdownTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#94a3b8',
    margin: '0 0 0.5rem',
  },
  breakdownGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '0.4rem',
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.35rem 0.5rem',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.04)',
    color: '#cbd5e1',
    fontSize: '0.85rem',
  },
  /* Card Catalog */
  catalogCard: { padding: '1.25rem' },
  catalogControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginBottom: '0.75rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.6rem 0.8rem',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  filterRow: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.35rem 0.8rem',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 600,
    transition: 'all 0.15s',
  },
  customToggle: {
    alignSelf: 'flex-start',
    padding: '0.4rem 0.9rem',
    borderRadius: 8,
    border: '1px dashed rgba(255,255,255,0.2)',
    background: 'transparent',
    cursor: 'pointer',
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  customForm: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
  },
  customInput: {
    flex: '1 1 140px',
    padding: '0.5rem 0.7rem',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e2e8f0',
    fontSize: '0.9rem',
  },
  customSelect: {
    padding: '0.5rem',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.08)',
    color: '#e2e8f0',
    fontSize: '0.85rem',
  },
  customVpInput: {
    width: 60,
    padding: '0.5rem',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  customSubmit: {
    padding: '0.5rem 1rem',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: '#22c55e',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '0.5rem',
  },
  catalogItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0.7rem 0.5rem',
    borderRadius: 10,
    border: '2px solid',
    background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'center',
  },
  catEmoji: { fontSize: '1.4rem' },
  catName: { fontWeight: 600, color: '#e2e8f0', fontSize: '0.82rem', lineHeight: 1.2 },
  catVP: { fontWeight: 700, color: '#fbbf24', fontSize: '0.85rem' },
  catType: { color: '#64748b', fontSize: '0.72rem' },
  catOwned: {
    background: '#3b82f6',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 700,
    borderRadius: 6,
    padding: '0.1rem 0.4rem',
  },
}
