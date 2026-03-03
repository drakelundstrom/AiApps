import { useCallback, useMemo, useState } from 'react'
import type { CellPosition, SudokuBoard, SudokuCell, SudokuPuzzleState, ThemeKey } from './interfaces'
import { styles } from './constants/styles'
import { THEMES, THEME_KEYS } from './constants/themeConfig'
import { useAnimatedHue } from './hooks/useAnimatedHue'
import { getConflicts, isSolved, makePuzzle } from './utils/sudokuLogic'

export default function ColorSudokuPage() {
  const [difficulty, setDifficulty] = useState(40)
  const [themeKey, setThemeKey] = useState<ThemeKey>('classic')
  const [{ puzzle, solution }, setGame] = useState<SudokuPuzzleState>(() => makePuzzle(40))
  const [board, setBoard] = useState<SudokuBoard>(() => puzzle.map((row) => [...row]))
  const [selected, setSelected] = useState<CellPosition | null>(null)
  const [selectedColor, setSelectedColor] = useState<number | null>(null)
  const [won, setWon] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  const theme = THEMES[themeKey]
  const hueShift = useAnimatedHue(Boolean(theme.animated))

  const given = useMemo(
    () => puzzle.map((row) => row.map((value) => value !== 0)),
    [puzzle],
  )

  const newGame = useCallback((newDifficulty?: number) => {
    const resolvedDifficulty = newDifficulty ?? difficulty
    setDifficulty(resolvedDifficulty)
    const nextGame = makePuzzle(resolvedDifficulty)
    setGame(nextGame)
    setBoard(nextGame.puzzle.map((row) => [...row]))
    setSelected(null)
    setSelectedColor(null)
    setWon(false)
  }, [difficulty])

  const placeColor = useCallback((row: number, col: number, colorValue: number) => {
    if (given[row][col] || won) return
    setBoard((prevBoard) => {
      const nextBoard = prevBoard.map((r) => [...r])
      nextBoard[row][col] = nextBoard[row][col] === colorValue ? 0 : colorValue
      if (isSolved(nextBoard, solution)) setWon(true)
      return nextBoard
    })
  }, [given, solution, won])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (given[row][col]) return
    setSelected([row, col])
    if (selectedColor !== null) {
      placeColor(row, col, selectedColor)
    }
  }, [given, placeColor, selectedColor])

  const handlePaletteClick = useCallback((colorValue: number) => {
    setSelectedColor((prevColor) => (prevColor === colorValue ? null : colorValue))
    if (selected && !given[selected[0]][selected[1]]) {
      placeColor(selected[0], selected[1], colorValue)
    }
  }, [given, placeColor, selected])

  const clearCell = useCallback(() => {
    if (!selected || given[selected[0]][selected[1]] || won) return
    setBoard((prevBoard) => {
      const nextBoard = prevBoard.map((row) => [...row])
      nextBoard[selected[0]][selected[1]] = 0
      return nextBoard
    })
  }, [given, selected, won])

  const getCellBackground = (value: SudokuCell): string => {
    if (value === 0) return 'rgba(30,30,45,0.7)'
    if (theme.animated) {
      const hue = ((value - 1) * 40 + hueShift) % 360
      return `hsl(${hue}, 80%, 50%)`
    }
    return theme.cell(value) ?? theme.colors[value - 1]
  }

  const getCellContent = (value: SudokuCell, isGivenCell: boolean): string | null => {
    if (value === 0) return null
    const content = theme.content(value)
    if (content) return content
    return isGivenCell ? '•' : null
  }

  const getCellTextColor = (value: SudokuCell): string => {
    if (theme.contentColor && value !== 0) return theme.contentColor(value) ?? '#fff'
    if (theme.darkText) return '#1a1a2e'
    return '#fff'
  }

  return (
    <div className="page-container page-container--center" style={styles.container}>
      <h1 style={styles.title}>Color Sudoku</h1>
      <p style={styles.subtitle}>Fill each row, column, and 3x3 box with all 9 values.</p>

      {won && <div style={styles.winBanner}>🎉 Congratulations, you solved it!</div>}

      <div style={styles.themeRow}>
        <button onClick={() => setShowThemeMenu((isOpen) => !isOpen)} style={styles.themeToggle}>
          {theme.label} Mode ▾
        </button>
        {showThemeMenu && (
          <div style={styles.themeMenu}>
            {THEME_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => {
                  setThemeKey(key)
                  setShowThemeMenu(false)
                }}
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

      <div style={styles.diffRow}>
        {[
          ['Easy', 30],
          ['Medium', 40],
          ['Hard', 52],
        ].map(([label, value]) => (
          <button
            key={label}
            onClick={() => newGame(value as number)}
            style={{
              ...styles.diffBtn,
              background: difficulty === value ? '#6366f1' : 'rgba(255,255,255,0.08)',
              borderColor: difficulty === value ? '#818cf8' : 'rgba(255,255,255,0.15)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={styles.board}>
        {board.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const isGiven = given[rowIndex][colIndex]
            const isSelected = selected?.[0] === rowIndex && selected[1] === colIndex
            const hasConflict = value !== 0 && getConflicts(board, rowIndex, colIndex, value)
            const borderRight = (colIndex + 1) % 3 === 0 && colIndex < 8
              ? '2.5px solid rgba(255,255,255,0.7)'
              : '1px solid rgba(255,255,255,0.12)'
            const borderBottom = (rowIndex + 1) % 3 === 0 && rowIndex < 8
              ? '2.5px solid rgba(255,255,255,0.7)'
              : '1px solid rgba(255,255,255,0.12)'
            const cellContent = getCellContent(value, isGiven)
            const glowColor = theme.glow && value !== 0 ? theme.colors[value - 1] : null

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onTouchStart={(event) => {
                  event.preventDefault()
                  handleCellClick(rowIndex, colIndex)
                }}
                style={{
                  ...styles.cell,
                  borderRight,
                  borderBottom,
                  background: getCellBackground(value),
                  outline: isSelected ? '3px solid #fff' : 'none',
                  outlineOffset: '-2px',
                  cursor: isGiven ? 'default' : 'pointer',
                  boxShadow: hasConflict
                    ? 'inset 0 0 0 3px rgba(255,50,50,0.9), inset 0 0 12px rgba(255,0,0,0.3)'
                    : glowColor
                      ? `inset 0 0 12px ${glowColor}66, 0 0 8px ${glowColor}44`
                      : 'none',
                  opacity: isGiven ? 1 : value !== 0 ? 0.92 : 0.45,
                  color: getCellTextColor(value),
                  fontSize: cellContent && /^\d$/.test(cellContent)
                    ? 'clamp(0.9rem, 3vw, 1.4rem)'
                    : theme.symbols
                      ? 'clamp(1.1rem, 3.5vw, 1.7rem)'
                      : '0.8rem',
                  fontWeight: 700,
                }}
                title={value !== 0 ? theme.names[value - 1] : ''}
              >
                {cellContent}
              </div>
            )
          }),
        )}
      </div>

      <div style={styles.palette}>
        {theme.colors.map((color, index) => {
          const value = index + 1
          const isActive = selectedColor === value
          const symbol = theme.symbols ? theme.symbols[index] : theme.content(value)
          let buttonBackground = color
          if (theme.animated) {
            const hue = (index * 40 + hueShift) % 360
            buttonBackground = `hsl(${hue}, 80%, 50%)`
          }
          if (theme.symbols || theme.content(value)) {
            buttonBackground = 'rgba(40,40,55,0.9)'
          }

          return (
            <button
              key={value}
              onClick={() => handlePaletteClick(value)}
              onTouchStart={(event) => {
                event.preventDefault()
                handlePaletteClick(value)
              }}
              title={theme.names[index]}
              style={{
                ...styles.paletteBtn,
                background: buttonBackground,
                outline: isActive ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                transform: isActive ? 'scale(1.25)' : 'scale(1)',
                boxShadow: isActive
                  ? `0 0 16px ${buttonBackground}88`
                  : theme.glow
                    ? `0 0 8px ${color}66`
                    : 'none',
                color: theme.contentColor ? theme.contentColor(value) ?? '#fff' : '#fff',
                fontSize: symbol ? '1.2rem' : '0.75rem',
              }}
            >
              {symbol ?? ''}
            </button>
          )
        })}
        <button
          onClick={clearCell}
          onTouchStart={(event) => {
            event.preventDefault()
            clearCell()
          }}
          style={styles.eraseBtn}
          title="Clear cell"
        >
          ✕
        </button>
      </div>

      <div style={styles.legend}>
        {theme.colors.map((color, index) => {
          let swatchBackground = color
          if (theme.animated) {
            const hue = (index * 40 + hueShift) % 360
            swatchBackground = `hsl(${hue}, 80%, 50%)`
          }
          return (
            <span key={index} style={styles.legendItem}>
              <span style={{ ...styles.legendSwatch, background: swatchBackground }} />
              <span>{theme.symbols ? theme.symbols[index] : theme.names[index]}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
