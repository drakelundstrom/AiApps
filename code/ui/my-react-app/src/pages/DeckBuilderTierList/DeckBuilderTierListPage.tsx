import { useState, useCallback, useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import type { DeckBuilderGame, TierId, TierPlacements } from './interfaces'
import { TIERS, ALL_GAMES } from './constants/tierData'
import { styles } from './constants/styles'

export default function DeckBuilderTierList() {
  const [placements, setPlacements] = useState<TierPlacements>(() => {
    const map = {} as TierPlacements
    ALL_GAMES.forEach(g => { map[g.id] = g.defaultTier })
    return map
  })
  const [dragId, setDragId] = useState<number | null>(null)
  const [hoveredTier, setHoveredTier] = useState<TierId | null>(null)
  const [selectedGame, setSelectedGame] = useState<DeckBuilderGame | null>(null)
  const [filterText, setFilterText] = useState('')
  const [resetConfirm, setResetConfirm] = useState(false)
  const dragRef = useRef<number | null>(null)

  /* drag-and-drop handlers */
  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, gameId: number) => {
    setDragId(gameId)
    dragRef.current = gameId
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(gameId))
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>, tierId: TierId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setHoveredTier(tierId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setHoveredTier(null)
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, tierId: TierId) => {
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
  const moveGame = useCallback((gameId: number, tierId: TierId) => {
    setPlacements(prev => ({ ...prev, [gameId]: tierId }))
    setSelectedGame(null)
  }, [])

  /* reset to defaults */
  const resetAll = useCallback(() => {
    const map = {} as TierPlacements
    ALL_GAMES.forEach(g => { map[g.id] = g.defaultTier })
    setPlacements(map)
    setResetConfirm(false)
  }, [])

  /* games for a tier */
  const gamesInTier = (tierId: TierId): DeckBuilderGame[] =>
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
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)}
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
