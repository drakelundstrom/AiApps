import type { CellPosition, SudokuBoard, SudokuCell, SudokuPuzzleState } from '../interfaces'
import { BOX, DIGITS, SIZE } from '../constants/themeConfig'

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function createEmptyBoard(): SudokuBoard {
  return Array.from({ length: SIZE }, () => Array<SudokuCell>(SIZE).fill(0))
}

export function isValidPlacement(board: SudokuBoard, row: number, col: number, num: number): boolean {
  for (let c = 0; c < SIZE; c += 1) {
    if (board[row][c] === num) return false
  }
  for (let r = 0; r < SIZE; r += 1) {
    if (board[r][col] === num) return false
  }
  const boxRow = Math.floor(row / BOX) * BOX
  const boxCol = Math.floor(col / BOX) * BOX
  for (let r = boxRow; r < boxRow + BOX; r += 1) {
    for (let c = boxCol; c < boxCol + BOX; c += 1) {
      if (board[r][c] === num) return false
    }
  }
  return true
}

export function solveBoard(board: SudokuBoard): boolean {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (board[r][c] !== 0) continue
      const nums = shuffle(DIGITS)
      for (const num of nums) {
        if (!isValidPlacement(board, r, c, num)) continue
        board[r][c] = num
        if (solveBoard(board)) return true
        board[r][c] = 0
      }
      return false
    }
  }
  return true
}

export function generateCompleteBoard(): SudokuBoard {
  const board = createEmptyBoard()
  solveBoard(board)
  return board
}

export function makePuzzle(difficulty = 40): SudokuPuzzleState {
  const solution = generateCompleteBoard()
  const puzzle = solution.map((row) => [...row])
  const cells = shuffle(Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE] as CellPosition))
  for (let i = 0; i < Math.min(difficulty, cells.length); i += 1) {
    const [r, c] = cells[i]
    puzzle[r][c] = 0
  }
  return { puzzle, solution }
}

export function getConflicts(board: SudokuBoard, row: number, col: number, value: SudokuCell): boolean {
  if (value === 0) return false
  for (let c = 0; c < SIZE; c += 1) {
    if (c !== col && board[row][c] === value) return true
  }
  for (let r = 0; r < SIZE; r += 1) {
    if (r !== row && board[r][col] === value) return true
  }
  const boxRow = Math.floor(row / BOX) * BOX
  const boxCol = Math.floor(col / BOX) * BOX
  for (let r = boxRow; r < boxRow + BOX; r += 1) {
    for (let c = boxCol; c < boxCol + BOX; c += 1) {
      if ((r !== row || c !== col) && board[r][c] === value) return true
    }
  }
  return false
}

export function isSolved(board: SudokuBoard, solution: SudokuBoard): boolean {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (board[r][c] !== solution[r][c]) return false
    }
  }
  return true
}
