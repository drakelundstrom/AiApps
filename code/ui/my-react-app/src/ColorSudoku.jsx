import { useState, useCallback, useMemo } from 'react'

/* ───────── constants ───────── */

const SIZE = 9
const BOX = 3
const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#a855f7', // purple
]

const COLOR_NAMES = [
  'Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Violet', 'Pink', 'Purple',
]

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

/* ───────── component ───────── */

export default function ColorSudoku() {
  const [difficulty, setDifficulty] = useState(40)
  const [{ puzzle, solution }, setGame] = useState(() => makePuzzle(40))
  const [board, setBoard] = useState(() => puzzle.map((r) => [...r]))
  const [selected, setSelected] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [won, setWon] = useState(false)

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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Color Sudoku</h1>
      <p style={styles.subtitle}>Fill the grid so each row, column, and 3×3 box has all 9 colors</p>

      {won && (
        <div style={styles.winBanner}>
          🎉 Congratulations, you solved it!
        </div>
      )}

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
              background: difficulty === d ? '#3b82f6' : '#333',
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
            const borderRight = (c + 1) % 3 === 0 && c < 8 ? '2.5px solid #fff' : '1px solid rgba(255,255,255,0.15)'
            const borderBottom = (r + 1) % 3 === 0 && r < 8 ? '2.5px solid #fff' : '1px solid rgba(255,255,255,0.15)'

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                style={{
                  ...styles.cell,
                  borderRight,
                  borderBottom,
                  background: val !== 0 ? COLORS[val - 1] : 'rgba(30,30,40,0.7)',
                  outline: isSelected ? '3px solid #fff' : 'none',
                  outlineOffset: '-2px',
                  cursor: isGiven ? 'default' : 'pointer',
                  boxShadow: hasConflict ? 'inset 0 0 0 3px rgba(255,0,0,0.8)' : 'none',
                  opacity: isGiven ? 1 : val !== 0 ? 0.85 : 0.5,
                }}
                title={val !== 0 ? COLOR_NAMES[val - 1] : ''}
              >
                {isGiven && (
                  <div style={styles.givenDot} />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* palette */}
      <div style={styles.palette}>
        {COLORS.map((color, i) => (
          <button
            key={i}
            onClick={() => handlePaletteClick(i + 1)}
            title={COLOR_NAMES[i]}
            style={{
              ...styles.paletteBtn,
              background: color,
              outline: selectedColor === i + 1 ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
              transform: selectedColor === i + 1 ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
        <button onClick={clearCell} style={styles.eraseBtn} title="Clear cell">
          ✕
        </button>
      </div>

      {/* legend */}
      <div style={styles.legend}>
        {COLORS.map((color, i) => (
          <span key={i} style={styles.legendItem}>
            <span style={{ ...styles.legendSwatch, background: color }} />
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ───────── styles ───────── */

const styles = {
  container: {
    width: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#fff',
    padding: '80px 16px 40px',
    boxSizing: 'border-box',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(1.4rem, 4vw, 2rem)',
    fontWeight: 800,
    letterSpacing: 1,
  },
  subtitle: {
    margin: '4px 0 12px',
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
  diffRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  diffBtn: {
    padding: '6px 16px',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 13,
  },
  board: {
    display: 'grid',
    gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
    width: 'min(90vw, 440px)',
    aspectRatio: '1',
    borderRadius: 8,
    overflow: 'hidden',
    border: '2.5px solid #fff',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s, transform 0.1s',
    position: 'relative',
  },
  givenDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.7)',
  },
  palette: {
    display: 'flex',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  paletteBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.15s, outline 0.15s',
  },
  eraseBtn: {
    width: 36,
    height: 36,
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
  },
  legend: {
    display: 'flex',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    opacity: 0.6,
    fontSize: 12,
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
  },
}
