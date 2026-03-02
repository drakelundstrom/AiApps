import { useState, useRef } from 'react'

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic']
const RARITY_COLORS = {
  Common: '#8c8c8c',
  Uncommon: '#31a031',
  Rare: '#3f8fff',
  Epic: '#b94fff',
  Legendary: '#e88a36',
  Mythic: '#ffd700',
}

const SAMPLE_SKINS = [
  { id: 1, name: 'Skull Trooper', rarity: 'Epic', image: null, owner: 'Player1', description: 'OG Halloween classic. One of the most iconic skins ever released.', tradeWilling: true },
  { id: 2, name: 'Renegade Raider', rarity: 'Legendary', image: null, owner: 'Player2', description: 'Season 1 exclusive. The rarest skin flex in the game.', tradeWilling: false },
  { id: 3, name: 'Peely', rarity: 'Epic', image: null, owner: 'Player3', description: 'Everyone\'s favorite banana. Goes great with any back bling.', tradeWilling: true },
  { id: 4, name: 'Fishstick', rarity: 'Rare', image: null, owner: 'Player1', description: 'Derpy fish vibes. Multiple style variants available.', tradeWilling: true },
  { id: 5, name: 'Drift', rarity: 'Legendary', image: null, owner: 'Player4', description: 'Season 5 Battle Pass tier 1. Upgradable with XP stages.', tradeWilling: false },
  { id: 6, name: 'Midas', rarity: 'Legendary', image: null, owner: 'Player2', description: 'The golden touch. Turns weapons gold on contact.', tradeWilling: true },
  { id: 7, name: 'Cuddle Team Leader', rarity: 'Epic', image: null, owner: 'Player5', description: 'Pink bear energy. A fan-favorite since Chapter 1.', tradeWilling: true },
  { id: 8, name: 'Black Knight', rarity: 'Legendary', image: null, owner: 'Player3', description: 'Season 2 Battle Pass tier 70. The OG grind reward.', tradeWilling: false },
  { id: 9, name: 'Jonesy the First', rarity: 'Common', image: null, owner: 'Player1', description: 'Default legend. The face that started it all.', tradeWilling: true },
  { id: 10, name: 'Lynx', rarity: 'Epic', image: null, owner: 'Player4', description: 'Season 7 catsuit. Unlockable black variant is chef\'s kiss.', tradeWilling: true },
  { id: 11, name: 'The Reaper', rarity: 'Legendary', image: null, owner: 'Player5', description: 'John Wick before John Wick. Season 3 tier 100 grind.', tradeWilling: false },
  { id: 12, name: 'Meowscles', rarity: 'Epic', image: null, owner: 'Player2', description: 'Buff cat with a heart of gold and biceps of steel.', tradeWilling: true },
]

function skinEmoji(name) {
  const map = {
    'Skull Trooper': '💀', 'Renegade Raider': '🤠', 'Peely': '🍌',
    'Fishstick': '🐟', 'Drift': '⚡', 'Midas': '👑',
    'Cuddle Team Leader': '🧸', 'Black Knight': '🛡️', 'Jonesy the First': '🧑',
    'Lynx': '🐱', 'The Reaper': '🔫', 'Meowscles': '💪',
  }
  return map[name] || '🎮'
}

export default function FortniteSkins() {
  const [skins, setSkins] = useState(SAMPLE_SKINS)
  const [filterRarity, setFilterRarity] = useState('All')
  const [filterTrade, setFilterTrade] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkin, setSelectedSkin] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [sortBy, setSortBy] = useState('name')
  const formRef = useRef(null)

  const [newSkin, setNewSkin] = useState({
    name: '', rarity: 'Common', owner: '', description: '', tradeWilling: false,
  })

  const filtered = skins
    .filter((s) => filterRarity === 'All' || s.rarity === filterRarity)
    .filter((s) => filterTrade === 'All' || (filterTrade === 'Trade' ? s.tradeWilling : !s.tradeWilling))
    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'rarity') return RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity)
      if (sortBy === 'owner') return a.owner.localeCompare(b.owner)
      return 0
    })

  function addSkin(e) {
    e.preventDefault()
    if (!newSkin.name.trim() || !newSkin.owner.trim()) return
    setSkins((prev) => [...prev, { ...newSkin, id: Date.now(), image: null }])
    setNewSkin({ name: '', rarity: 'Common', owner: '', description: '', tradeWilling: false })
    setShowAddForm(false)
  }

  function shareSkin(skin) {
    const text = `Check out my Fortnite skin: ${skin.name} (${skin.rarity}) — ${skin.description}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(skin.id)
        setShareMessage(`"${skin.name}" copied to clipboard!`)
        setTimeout(() => { setShareMessage(''); setCopiedId(null) }, 2500)
      })
    }
  }

  function removeSkin(id) {
    setSkins((prev) => prev.filter((s) => s.id !== id))
    if (selectedSkin?.id === id) setSelectedSkin(null)
  }

  const totalTradeable = skins.filter((s) => s.tradeWilling).length
  const rarityBreakdown = RARITIES.map((r) => ({
    rarity: r,
    count: skins.filter((s) => s.rarity === r).length,
  })).filter((r) => r.count > 0)

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎮 Fortnite Skin Showcase</h1>
        <p style={styles.subtitle}>Share, browse & flex your locker</p>
      </header>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <span style={styles.statNumber}>{skins.length}</span>
          <span style={styles.statLabel}>Total Skins</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statNumber}>{totalTradeable}</span>
          <span style={styles.statLabel}>Up for Trade</span>
        </div>
        {rarityBreakdown.map((r) => (
          <div key={r.rarity} style={styles.statItem}>
            <span style={{ ...styles.statNumber, color: RARITY_COLORS[r.rarity] }}>{r.count}</span>
            <span style={styles.statLabel}>{r.rarity}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search skins or owners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} style={styles.select}>
          <option value="All">All Rarities</option>
          {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterTrade} onChange={(e) => setFilterTrade(e.target.value)} style={styles.select}>
          <option value="All">All Status</option>
          <option value="Trade">Up for Trade</option>
          <option value="Keep">Not Trading</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
          <option value="name">Sort: Name</option>
          <option value="rarity">Sort: Rarity</option>
          <option value="owner">Sort: Owner</option>
        </select>
        <button onClick={() => setShowAddForm(!showAddForm)} style={styles.addButton}>
          {showAddForm ? '✕ Cancel' : '+ Add Skin'}
        </button>
      </div>

      {/* Share toast */}
      {shareMessage && <div style={styles.toast}>{shareMessage}</div>}

      {/* Add Form */}
      {showAddForm && (
        <form ref={formRef} onSubmit={addSkin} style={styles.form}>
          <h3 style={styles.formTitle}>Add a Skin to the Showcase</h3>
          <div style={styles.formGrid}>
            <input
              type="text"
              placeholder="Skin name *"
              value={newSkin.name}
              onChange={(e) => setNewSkin({ ...newSkin, name: e.target.value })}
              style={styles.formInput}
              required
            />
            <input
              type="text"
              placeholder="Owner / username *"
              value={newSkin.owner}
              onChange={(e) => setNewSkin({ ...newSkin, owner: e.target.value })}
              style={styles.formInput}
              required
            />
            <select
              value={newSkin.rarity}
              onChange={(e) => setNewSkin({ ...newSkin, rarity: e.target.value })}
              style={styles.formInput}
            >
              {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newSkin.tradeWilling}
                onChange={(e) => setNewSkin({ ...newSkin, tradeWilling: e.target.checked })}
              />
              Willing to trade
            </label>
          </div>
          <textarea
            placeholder="Description (optional)"
            value={newSkin.description}
            onChange={(e) => setNewSkin({ ...newSkin, description: e.target.value })}
            style={styles.formTextarea}
            rows={2}
          />
          <button type="submit" style={styles.submitButton}>Add to Showcase</button>
        </form>
      )}

      {/* Skin Grid */}
      <div style={styles.grid}>
        {filtered.map((skin) => (
          <div
            key={skin.id}
            style={{
              ...styles.card,
              borderColor: RARITY_COLORS[skin.rarity],
              boxShadow: selectedSkin?.id === skin.id
                ? `0 0 20px ${RARITY_COLORS[skin.rarity]}88`
                : `0 4px 16px #00000044`,
            }}
            onClick={() => setSelectedSkin(selectedSkin?.id === skin.id ? null : skin)}
          >
            <div style={{ ...styles.cardRarityStripe, background: RARITY_COLORS[skin.rarity] }} />
            <div style={styles.cardImageArea}>
              <span style={styles.skinEmoji}>{skinEmoji(skin.name)}</span>
            </div>
            <div style={styles.cardBody}>
              <h3 style={styles.cardName}>{skin.name}</h3>
              <span style={{ ...styles.rarityBadge, background: RARITY_COLORS[skin.rarity] }}>
                {skin.rarity}
              </span>
              <p style={styles.cardOwner}>Owned by <strong>{skin.owner}</strong></p>
              {skin.tradeWilling && <span style={styles.tradeBadge}>🔄 Up for Trade</span>}
            </div>
            <div style={styles.cardActions}>
              <button
                onClick={(e) => { e.stopPropagation(); shareSkin(skin) }}
                style={{
                  ...styles.shareBtn,
                  background: copiedId === skin.id ? '#31a031' : '#3f8fff',
                }}
                title="Copy share text"
              >
                {copiedId === skin.id ? '✓ Copied' : '📋 Share'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeSkin(skin.id) }}
                style={styles.removeBtn}
                title="Remove skin"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={styles.noResults}>No skins found. Try adjusting your filters or add a new skin!</p>
      )}

      {/* Detail Panel */}
      {selectedSkin && (
        <div style={styles.detailPanel}>
          <button style={styles.detailClose} onClick={() => setSelectedSkin(null)}>✕</button>
          <div style={styles.detailEmoji}>{skinEmoji(selectedSkin.name)}</div>
          <h2 style={{ ...styles.detailName, color: RARITY_COLORS[selectedSkin.rarity] }}>
            {selectedSkin.name}
          </h2>
          <span style={{ ...styles.rarityBadge, background: RARITY_COLORS[selectedSkin.rarity], fontSize: '1rem', padding: '6px 16px' }}>
            {selectedSkin.rarity}
          </span>
          <p style={styles.detailDescription}>{selectedSkin.description || 'No description provided.'}</p>
          <p style={styles.detailOwner}>Owned by <strong>{selectedSkin.owner}</strong></p>
          {selectedSkin.tradeWilling
            ? <p style={styles.detailTrade}>🔄 This skin is <strong>available for trade</strong></p>
            : <p style={styles.detailNoTrade}>🔒 This skin is <strong>not available for trade</strong></p>
          }
          <button
            onClick={() => shareSkin(selectedSkin)}
            style={{ ...styles.shareBtn, marginTop: 16, padding: '10px 24px', fontSize: '1rem' }}
          >
            📋 Copy Share Text
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1040 40%, #0d1b3e 100%)',
    color: '#e8ecf5',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '24px',
    maxWidth: 1200,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: '2.4rem',
    fontWeight: 800,
    margin: 0,
    background: 'linear-gradient(90deg, #ffd700, #ff6b35, #b94fff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#8a94b8',
    marginTop: 4,
  },
  statsBar: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
    padding: '14px 20px',
    background: '#12163588',
    borderRadius: 12,
    border: '1px solid #ffffff10',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 60,
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#ffd700',
  },
  statLabel: {
    fontSize: '0.72rem',
    color: '#8a94b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  toolbar: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    minWidth: 180,
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #ffffff20',
    background: '#0d112a',
    color: '#e8ecf5',
    fontSize: '0.95rem',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #ffffff20',
    background: '#0d112a',
    color: '#e8ecf5',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  addButton: {
    padding: '10px 18px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #b94fff, #3f8fff)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  toast: {
    textAlign: 'center',
    padding: '10px 20px',
    background: '#31a03188',
    borderRadius: 8,
    marginBottom: 12,
    fontWeight: 600,
    animation: 'fadeIn 0.3s',
  },
  form: {
    background: '#12163599',
    border: '1px solid #ffffff15',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    margin: '0 0 12px',
    fontSize: '1.1rem',
    color: '#ffd700',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 10,
  },
  formInput: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #ffffff20',
    background: '#0d112a',
    color: '#e8ecf5',
    fontSize: '0.9rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#b0b8d4',
    fontSize: '0.9rem',
  },
  formTextarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #ffffff20',
    background: '#0d112a',
    color: '#e8ecf5',
    fontSize: '0.9rem',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  submitButton: {
    marginTop: 10,
    padding: '10px 24px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #ffd700, #e88a36)',
    color: '#0a0e27',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 18,
    marginTop: 8,
  },
  card: {
    background: '#121635',
    borderRadius: 14,
    border: '2px solid',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
  },
  cardRarityStripe: {
    height: 4,
  },
  cardImageArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    background: '#0a0e2788',
  },
  skinEmoji: {
    fontSize: '3.2rem',
  },
  cardBody: {
    padding: '12px 14px 8px',
    flex: 1,
  },
  cardName: {
    margin: '0 0 6px',
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  rarityBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cardOwner: {
    margin: '8px 0 4px',
    fontSize: '0.85rem',
    color: '#8a94b8',
  },
  tradeBadge: {
    display: 'inline-block',
    marginTop: 4,
    padding: '3px 8px',
    borderRadius: 6,
    background: '#31a03125',
    color: '#6fd86f',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
  cardActions: {
    display: 'flex',
    gap: 6,
    padding: '8px 14px 12px',
    borderTop: '1px solid #ffffff10',
  },
  shareBtn: {
    flex: 1,
    padding: '7px 10px',
    borderRadius: 8,
    border: 'none',
    background: '#3f8fff',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  removeBtn: {
    padding: '7px 10px',
    borderRadius: 8,
    border: 'none',
    background: '#ff4d4d22',
    color: '#ff6b6b',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  noResults: {
    textAlign: 'center',
    color: '#8a94b8',
    marginTop: 40,
    fontSize: '1.1rem',
  },
  detailPanel: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 600,
    background: '#121635ee',
    backdropFilter: 'blur(16px)',
    borderRadius: '18px 18px 0 0',
    border: '1px solid #ffffff15',
    borderBottom: 'none',
    padding: '28px 28px 32px',
    textAlign: 'center',
    zIndex: 100,
    boxShadow: '0 -8px 40px #00000088',
  },
  detailClose: {
    position: 'absolute',
    top: 12,
    right: 16,
    background: 'none',
    border: 'none',
    color: '#8a94b8',
    fontSize: '1.4rem',
    cursor: 'pointer',
  },
  detailEmoji: {
    fontSize: '4rem',
    marginBottom: 8,
  },
  detailName: {
    fontSize: '1.6rem',
    fontWeight: 800,
    margin: '0 0 8px',
  },
  detailDescription: {
    color: '#b0b8d4',
    margin: '14px 0 8px',
    lineHeight: 1.5,
  },
  detailOwner: {
    color: '#8a94b8',
    marginBottom: 4,
  },
  detailTrade: {
    color: '#6fd86f',
    marginTop: 6,
  },
  detailNoTrade: {
    color: '#ff6b6b',
    marginTop: 6,
  },
}
