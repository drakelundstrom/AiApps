import { useState, useCallback, useMemo, useEffect, useRef } from 'react'

/* ───────── constants ───────── */

const SIZE = 9
const BOX = 3

/* ───────── THEME / MODE DEFINITIONS ───────── */

const THEMES = {
  classic: {
    label: '🎨 Classic',
    desc: 'Bold primary colors',
    colors: ['#DC2626','#EA580C','#D97706','#16A34A','#0891B2','#2563EB','#7C3AED','#DB2777','#0D9488'],
    names: ['Red','Orange','Amber','Green','Cyan','Blue','Violet','Pink','Teal'],
    cell: (val) => val !== 0 ? THEMES.classic.colors[val - 1] : null,
    content: () => null,
  },
  neon: {
    label: '💡 Neon',
    desc: 'Glowing neon on dark',
    colors: ['#FF073A','#FF6F00','#FFE600','#39FF14','#00FFFF','#4D4DFF','#BF00FF','#FF69B4','#FFFFFF'],
    names: ['Neon Red','Neon Orange','Neon Yellow','Neon Green','Neon Cyan','Neon Blue','Neon Purple','Neon Pink','Neon White'],
    cell: (val) => val !== 0 ? THEMES.neon.colors[val - 1] : null,
    content: () => null,
    glow: true,
  },
  pastel: {
    label: '🌸 Pastel',
    desc: 'Soft pastel palette',
    colors: ['#FCA5A5','#FDBA74','#FDE68A','#86EFAC','#67E8F9','#93C5FD','#C4B5FD','#F9A8D4','#A7F3D0'],
    names: ['Rose','Peach','Butter','Mint','Sky','Periwinkle','Lavender','Blush','Seafoam'],
    cell: (val) => val !== 0 ? THEMES.pastel.colors[val - 1] : null,
    content: () => null,
    darkText: true,
  },
  emoji: {
    label: '😄 Emoji',
    desc: 'Fun emoji symbols',
    colors: ['#2a2a3a','#2a2a3a','#2a2a3a','#2a2a3a','#2a2a3a','#2a2a3a','#2a2a3a','#2a2a3a','#2a2a3a'],
    names: ['Star','Heart','Fire','Leaf','Water','Moon','Bolt','Flower','Diamond'],
    symbols: ['⭐','❤️','🔥','🍀','💧','🌙','⚡','🌸','💎'],
    cell: () => 'rgba(40,40,55,0.8)',
    content: (val) => val !== 0 ? THEMES.emoji.symbols[val - 1] : null,
  },
  shapes: {
    label: '🔷 Shapes',
    desc: 'Geometric symbols',
    colors: ['#DC2626','#EA580C','#D97706','#16A34A','#0891B2','#2563EB','#7C3AED','#DB2777','#0D9488'],
    names: ['Circle','Square','Triangle','Diamond','Star','Cross','Heart','Arrow','Hex'],
    symbols: ['●','■','▲','◆','★','✚','♥','➤','⬡'],
    cell: () => 'rgba(30,30,45,0.8)',
    content: (val) => val !== 0 ? THEMES.shapes.symbols[val - 1] : null,
    contentColor: (val) => val !== 0 ? THEMES.shapes.colors[val - 1] : null,
  },
  numbers: {
    label: '🔢 Numbers',
    desc: 'Classic number sudoku',
    colors: ['#DC2626','#EA580C','#D97706','#16A34A','#0891B2','#2563EB','#7C3AED','#DB2777','#0D9488'],
    names: ['1','2','3','4','5','6','7','8','9'],
    cell: () => 'rgba(30,30,45,0.8)',
    content: (val) => val !== 0 ? String(val) : null,
    contentColor: (val) => val !== 0 ? THEMES.numbers.colors[val - 1] : null,
  },
  earth: {
    label: '🌍 Earth',
    desc: 'Nature-inspired tones',
    colors: ['#92400E','#B45309','#A16207','#166534','#155E75','#1E3A5F','#581C87','#9D174D','#064E3B'],
    names: ['Clay','Rust','Ochre','Forest','Deep Sea','Navy','Royal','Berry','Emerald'],
    cell: (val) => val !== 0 ? THEMES.earth.colors[val - 1] : null,
    content: () => null,
  },
  rainbow: {
    label: '🌈 Rainbow',
    desc: 'Animated shifting hues',
    colors: ['#EF4444','#F97316','#EAB308','#22C55E','#06B6D4','#3B82F6','#8B5CF6','#EC4899','#F43F5E'],
    names: ['Red','Orange','Yellow','Green','Cyan','Blue','Violet','Pink','Rose'],
    cell: () => null, // handled specially
    content: () => null,
    animated: true,
  },
}

const THEME_KEYS = Object.keys(THEMES)

/* ───────── sudoku generator ───────── */

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateCompleteBoard() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))

  function isValid(board, row, col, num) {
    for (let c = 0; c < SIZE; c++) if (board[row][c] === num) return false
    for (let r = 0; r < SIZE; r++) if (board[r][col] === num) return false
    const br = Math.floor(row / BOX) * BOX
    const bc = Math.floor(col / BOX) * BOX
    for (let r = br; r < br + BOX; r++)
      for (let c = bc; c < bc + BOX; c++)
        if (board[r][c] === num) return false
    return true
  }

  function solve(board) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === 0) {
          const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
          for (const num of nums) {
            if (isValid(board, r, c, num)) {
              board[r][c] = num
              if (solve(board)) return true
              board[r][c] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  solve(board)
  return board
}

function makePuzzle(difficulty = 40) {
  const solution = generateCompleteBoard()
  const puzzle = solution.map((row) => [...row])
  let removed = 0
  const cells = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  )
  for (const [r, c] of cells) {
    if (removed >= difficulty) break
    puzzle[r][c] = 0
    removed++
  }
  return { puzzle, solution }
}

/* ───────── helpers ───────── */

function getConflicts(board, row, col, value) {
  if (value === 0) return false
  for (let c = 0; c < SIZE; c++)
    if (c !== col && board[row][c] === value) return true
  for (let r = 0; r < SIZE; r++)
    if (r !== row && board[r][col] === value) return true
  const br = Math.floor(row / BOX) * BOX
  const bc = Math.floor(col / BOX) * BOX
  for (let r = br; r < br + BOX; r++)
    for (let c = bc; c < bc + BOX; c++)
      if ((r !== row || c !== col) && board[r][c] === value) return true
  return false
}

function isSolved(board, solution) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c] !== solution[r][c]) return false
  return true
}

/* ───────── animated hue helper ───────── */

function useAnimatedHue() {
  const [hueShift, setHueShift] = useState(0)
  const frameRef = useRef(null)
  useEffect(() => {
    let running = true
    function tick() {
      if (!running) return
      setHueShift(Date.now() * 0.03 % 360)
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => { running = false; cancelAnimationFrame(frameRef.current) }
  }, [])
  return hueShift
}

/* ───────── component ───────── */

export default function ColorSudoku() {
  const [difficulty, setDifficulty] = useState(40)
  const [themeKey, setThemeKey] = useState('classic')
  const [{ puzzle, solution }, setGame] = useState(() => makePuzzle(40))
  const [board, setBoard] = useState(() => puzzle.map((r) => [...r]))
  const [selected, setSelected] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [won, setWon] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const hueShift = useAnimatedHue()

  const theme = THEMES[themeKey]

  const given = useMemo(
    () => puzzle.map((row) => row.map((v) => v !== 0)),
    [puzzle]
  )

  const newGame = useCallback(
    (diff) => {
      const d = diff ?? difficulty
      setDifficulty(d)
      const g = makePuzzle(d)
      setGame(g)
      setBoard(g.puzzle.map((r) => [...r]))
      setSelected(null)
      setSelectedColor(null)
      setWon(false)
    },
    [difficulty]
  )

  const placeColor = useCallback(
    (row, col, colorIdx) => {
      if (given[row][col] || won) return
      setBoard((prev) => {
        const next = prev.map((r) => [...r])
        next[row][col] = next[row][col] === colorIdx ? 0 : colorIdx
        if (isSolved(next, solution)) setWon(true)
        return next
      })
    },
    [given, solution, won]
  )

  const handleCellClick = useCallback(
    (row, col) => {
      if (given[row][col]) return
      setSelected([row, col])
      if (selectedColor !== null) {
        placeColor(row, col, selectedColor)
      }
    },
    [given, selectedColor, placeColor]
  )

  const handlePaletteClick = useCallback(
    (colorIdx) => {
      setSelectedColor((prev) => (prev === colorIdx ? null : colorIdx))
      if (selected && !given[selected[0]][selected[1]]) {
        placeColor(selected[0], selected[1], colorIdx)
      }
    },
    [selected, given, placeColor]
  )

  const clearCell = useCallback(() => {
    if (!selected || given[selected[0]][selected[1]] || won) return
    setBoard((prev) => {
      const next = prev.map((r) => [...r])
      next[selected[0]][selected[1]] = 0
      return next
    })
  }, [selected, given, won])

  /** Compute cell background for current theme */
  const getCellBg = (val, r, c) => {
    if (val === 0) return 'rgba(30,30,45,0.7)'
    if (theme.animated) {
      const baseHue = (val - 1) * 40 + hueShift
      return `hsl(${baseHue % 360}, 80%, 50%)`
    }
    const bg = theme.cell(val)
    return bg || theme.colors[val - 1]
  }

  /** Compute cell text content */
  const getCellContent = (val, isGivenCell) => {
    if (val === 0) return null
    const content = theme.content ? theme.content(val) : null
    if (content) return content
    // For pure-color modes, show a dot on given cells
    if (isGivenCell) return '•'
    return null
  }

  const getCellTextColor = (val) => {
    if (theme.contentColor && val !== 0) return theme.contentColor(val)
    if (theme.darkText) return '#1a1a2e'
    return '#fff'
  }

  return (
    <div className="page-container page-container--center" style={styles.container}>
      <h1 style={styles.title}>Color Sudoku</h1>
      <p style={styles.subtitle}>Fill the grid so each row, column, and 3×3 box has all 9 values</p>

      {won && (
        <div style={styles.winBanner}>
          🎉 Congratulations, you solved it!
        </div>
      )}

      {/* Theme switcher */}
      <div style={styles.themeRow}>
        <button
          onClick={() => setShowThemeMenu((v) => !v)}
          style={styles.themeToggle}
        >
          {theme.label} Mode ▾
        </button>
        {showThemeMenu && (
          <div style={styles.themeMenu}>
            {THEME_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => { setThemeKey(key); setShowThemeMenu(false) }}
                style={{
                  ...styles.themeOption,
                  background: themeKey === key ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)',
                  borderColor: themeKey === key ? '#818cf8' : 'rgba(255,255,255,0.1)',
                }}
              >
                <span style={styles.themeOptionLabel}>{THEMES[key].label}</span>
                <span style={styles.themeOptionDesc}>{THEMES[key].desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* difficulty buttons */}
      <div style={styles.diffRow}>
        {[
          ['Easy', 30],
          ['Medium', 40],
          ['Hard', 52],
        ].map(([label, d]) => (
          <button
            key={label}
            onClick={() => newGame(d)}
            style={{
              ...styles.diffBtn,
              background: difficulty === d ? '#6366f1' : 'rgba(255,255,255,0.08)',
              borderColor: difficulty === d ? '#818cf8' : 'rgba(255,255,255,0.15)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* board */}
      <div style={styles.board}>
        {board.map((row, r) =>
          row.map((val, c) => {
            const isGiven = given[r][c]
            const isSelected = selected && selected[0] === r && selected[1] === c
            const hasConflict = val !== 0 && getConflicts(board, r, c, val)
            const borderRight = (c + 1) % 3 === 0 && c < 8 ? '2.5px solid rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.12)'
            const borderBottom = (r + 1) % 3 === 0 && r < 8 ? '2.5px solid rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.12)'
            const bg = getCellBg(val, r, c)
            const cellContent = getCellContent(val, isGiven)
            const textColor = getCellTextColor(val)
            const glowColor = theme.glow && val !== 0 ? theme.colors[val - 1] : null

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                style={{
                  ...styles.cell,
                  borderRight,
                  borderBottom,
                  background: bg,
                  outline: isSelected ? '3px solid #fff' : 'none',
                  outlineOffset: '-2px',
                  cursor: isGiven ? 'default' : 'pointer',
                  boxShadow: hasConflict
                    ? 'inset 0 0 0 3px rgba(255,50,50,0.9), inset 0 0 12px rgba(255,0,0,0.3)'
                    : glowColor
                      ? `inset 0 0 12px ${glowColor}66, 0 0 8px ${glowColor}44`
                      : 'none',
                  opacity: isGiven ? 1 : val !== 0 ? 0.92 : 0.45,
                  color: textColor,
                  fontSize: cellContent && cellContent.length === 1 && /\d/.test(cellContent)
                    ? 'clamp(0.9rem, 3vw, 1.4rem)'
                    : theme.symbols
                      ? 'clamp(1.1rem, 3.5vw, 1.7rem)'
                      : '0.8rem',
                  fontWeight: 700,
                }}
                title={val !== 0 ? theme.names[val - 1] : ''}
              >
                {cellContent}
              </div>
            )
          })
        )}
      </div>

      {/* palette */}
      <div style={styles.palette}>
        {theme.colors.map((color, i) => {
          const isActive = selectedColor === i + 1
          const symbol = theme.symbols ? theme.symbols[i] : theme.content ? theme.content(i + 1) : null
          let btnBg = color
          if (theme.animated) {
            const h = (i * 40 + hueShift) % 360
            btnBg = `hsl(${h}, 80%, 50%)`
          }
          if (theme.symbols || (theme.content && theme.content(i + 1))) {
            btnBg = 'rgba(40,40,55,0.9)'
          }

          return (
            <button
              key={i}
              onClick={() => handlePaletteClick(i + 1)}
              title={theme.names[i]}
              style={{
                ...styles.paletteBtn,
                background: btnBg,
                outline: isActive ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                transform: isActive ? 'scale(1.25)' : 'scale(1)',
                boxShadow: isActive
                  ? `0 0 16px ${typeof btnBg === 'string' ? btnBg : color}88`
                  : theme.glow
                    ? `0 0 8px ${color}66`
                    : 'none',
                color: theme.contentColor ? theme.contentColor(i + 1) : '#fff',
                fontSize: symbol ? '1.2rem' : '0.75rem',
              }}
            >
              {symbol || ''}
            </button>
          )
        })}
        <button onClick={clearCell} style={styles.eraseBtn} title="Clear cell">
          ✕
        </button>
      </div>

      {/* legend */}
      <div style={styles.legend}>
        {theme.colors.map((color, i) => {
          let swatchBg = color
          if (theme.animated) {
            const h = (i * 40 + hueShift) % 360
            swatchBg = `hsl(${h}, 80%, 50%)`
          }
          return (
            <span key={i} style={styles.legendItem}>
              <span style={{ ...styles.legendSwatch, background: swatchBg }} />
              <span>{theme.symbols ? theme.symbols[i] : theme.names[i]}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ───────── styles ───────── */

const styles = {
  container: {
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(1.4rem, 4vw, 2rem)',
    fontWeight: 800,
    letterSpacing: 1,
  },
  subtitle: {
    margin: '4px 0 10px',
    fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
    opacity: 0.7,
  },
  winBanner: {
    padding: '10px 24px',
    background: 'rgba(34,197,94,0.25)',
    border: '1px solid #22c55e',
    borderRadius: 12,
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: 10,
  },
  themeRow: {
    position: 'relative',
    marginBottom: 8,
    zIndex: 20,
  },
  themeToggle: {
    padding: '8px 20px',
    background: 'rgba(99,102,241,0.25)',
    border: '1px solid rgba(129,140,248,0.4)',
    borderRadius: 10,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  themeMenu: {
    position: 'absolute',
    top: '110%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(20,18,50,0.97)',
    border: '1px solid rgba(129,140,248,0.3)',
    borderRadius: 14,
    padding: 8,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 6,
    minWidth: 320,
    maxWidth: '92vw',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
  },
  themeOption: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid',
    color: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  themeOptionLabel: {
    fontWeight: 700,
    fontSize: '0.9rem',
  },
  themeOptionDesc: {
    fontSize: '0.72rem',
    opacity: 0.6,
  },
  diffRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  diffBtn: {
    padding: '6px 18px',
    border: '1px solid',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 13,
    transition: 'background 0.15s',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
    width: 'min(90vw, 440px)',
    aspectRatio: '1',
    borderRadius: 10,
    overflow: 'hidden',
    border: '2.5px solid rgba(255,255,255,0.6)',
    boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.18s, opacity 0.15s, transform 0.1s',
    position: 'relative',
    lineHeight: 1,
  },
  palette: {
    display: 'flex',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  paletteBtn: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.15s, outline 0.15s, box-shadow 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  eraseBtn: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    background: 'rgba(60,60,60,0.8)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s',
  },
  legend: {
    display: 'flex',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    opacity: 0.65,
    fontSize: '0.75rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    display: 'inline-block',
    transition: 'background 0.3s',
  },
}
