import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { CardDefinition, CardFilter, CardType, CustomCardInput, GameLogEntry, PlayerState } from './interfaces'
import { CARD_TYPES, PRESET_CARDS, PLAYER_COLORS, TYPE_EMOJI, initialPlayer, playerVP } from './constants/gameData'
import { styles } from './constants/styles'

export default function DCDeckBuilder() {
  const [players, setPlayers] = useState<PlayerState[]>([initialPlayer(1, 0), initialPlayer(2, 1)])
  const [activePlayerId, setActivePlayerId] = useState(1)
  const [nextId, setNextId] = useState(3)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<CardFilter>('All')
  const [showCustom, setShowCustom] = useState(false)
  const [customCard, setCustomCard] = useState<CustomCardInput>({ name: '', type: 'Hero', vp: '1' })
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([])
  const [showLog, setShowLog] = useState(false)
  const [showScoreboard, setShowScoreboard] = useState(false)
  const logEndRef = useRef<HTMLDivElement | null>(null)

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

  const removePlayer = useCallback((id: number) => {
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

  const renamePlayer = useCallback((id: number, name: string) => {
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, name } : p))
  }, [])

  /* card management */
  const addCardToPlayer = useCallback((card: CardDefinition) => {
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

  const removeCardFromPlayer = useCallback((cardName: string) => {
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

  const setBonusVP = useCallback((id: number, val: string) => {
    const n = parseInt(val, 10)
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, bonusVP: isNaN(n) ? 0 : n } : p))
  }, [])

  const addCustomCard = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!customCard.name.trim()) return
    addCardToPlayer({ name: customCard.name.trim(), type: customCard.type, vp: parseInt(customCard.vp, 10) || 0 })
    setCustomCard({ name: '', type: 'Hero', vp: '1' })
    setShowCustom(false)
  }, [customCard, addCardToPlayer])

  const resetGame = useCallback(() => {
    setPlayers([initialPlayer(1, 0), initialPlayer(2, 1)])
    setActivePlayerId(1)
    setNextId(3)
    setGameLog([])
  }, [])

  /* filtered card catalog */
  const filterOptions: CardFilter[] = ['All', ...CARD_TYPES]
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => renamePlayer(activePlayer.id, e.target.value)}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBonusVP(activePlayer.id, e.target.value)}
              style={styles.bonusInput}
            />
          </div>

          {/* Player&apos;s cards */}
          <h3 style={styles.sectionTitle}>
            {activePlayer.name}&apos;s Deck ({activePlayer.cards.reduce((s, c) => s + c.qty, 0)} cards)
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.filterRow}>
            {filterOptions.map((t) => (
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomCard((prev) => ({ ...prev, name: e.target.value }))}
              style={styles.customInput}
              maxLength={40}
            />
            <select
              value={customCard.type}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCustomCard((prev) => ({ ...prev, type: e.target.value as CardType }))}
              style={styles.customSelect}
            >
              {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="number"
              placeholder="VP"
              value={customCard.vp}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomCard((prev) => ({ ...prev, vp: e.target.value }))}
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
