import type { SudokuCell, SudokuTheme, ThemeKey } from '../interfaces'

export const SIZE = 9
export const BOX = 3
export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function buildColorTheme(
  label: string,
  desc: string,
  colors: string[],
  names: string[],
  options?: Pick<SudokuTheme, 'glow' | 'darkText' | 'animated'>,
): SudokuTheme {
  return {
    label,
    desc,
    colors,
    names,
    cell: (value: SudokuCell) => (value !== 0 ? colors[value - 1] : null),
    content: () => null,
    ...options,
  }
}

const classicColors = ['#DB2777', '#DC2626', '#EA580C', '#D97706', '#16A34A', '#0891B2', '#2563EB', '#BF55EC', '#7C3AED']
const classicNames = ['Pink', 'Red', 'Orange', 'Amber', 'Green', 'Cyan', 'Blue', 'Light Purple', 'Violet']
const grayscaleColors = ['#FFFFFF', '#E5E5E5', '#CCCCCC', '#B3B3B3', '#999999', '#7F7F7F', '#666666', '#4D4D4D', '#000000']
const grayscaleNames = ['White', 'Cloud', 'Silver', 'Gray', 'Slate', 'Charcoal', 'Graphite', 'Onyx', 'Black']
const emojiSymbols = ['⭐', '❤️', '🔥', '🍀', '💧', '🌙', '⚡', '🌸', '💎']
const shapeSymbols = ['●', '■', '▲', '◆', '★', '✚', '♥', '➤', '⬡']

export const THEMES: Record<ThemeKey, SudokuTheme> = {
  classic: buildColorTheme('🎨 Classic', 'Bold primary colors', classicColors, classicNames),
  neon: buildColorTheme(
    '💡 Neon',
    'Glowing neon on dark',
    ['#FF073A', '#FF6F00', '#FFE600', '#39FF14', '#00FFFF', '#4D4DFF', '#BF00FF', '#FF69B4', '#FFFFFF'],
    ['Neon Red', 'Neon Orange', 'Neon Yellow', 'Neon Green', 'Neon Cyan', 'Neon Blue', 'Neon Purple', 'Neon Pink', 'Neon White'],
    { glow: true },
  ),
  pastel: buildColorTheme(
    '🌸 Pastel',
    'Soft pastel palette',
    ['#FCA5A5', '#FDBA74', '#FDE68A', '#86EFAC', '#67E8F9', '#93C5FD', '#C4B5FD', '#F9A8D4', '#A7F3D0'],
    ['Rose', 'Peach', 'Butter', 'Mint', 'Sky', 'Periwinkle', 'Lavender', 'Blush', 'Seafoam'],
    { darkText: true },
  ),
  emoji: {
    label: '😄 Emoji',
    desc: 'Fun emoji symbols',
    colors: Array.from({ length: 9 }, () => '#2a2a3a'),
    names: ['Star', 'Heart', 'Fire', 'Leaf', 'Water', 'Moon', 'Bolt', 'Flower', 'Diamond'],
    symbols: emojiSymbols,
    cell: () => 'rgba(40,40,55,0.9)',
    content: (value: SudokuCell) => (value !== 0 ? emojiSymbols[value - 1] : null),
  },
  shapes: {
    label: '🔷 Shapes',
    desc: 'Geometric symbols',
    colors: classicColors,
    names: ['Circle', 'Square', 'Triangle', 'Diamond', 'Star', 'Cross', 'Heart', 'Arrow', 'Hex'],
    symbols: shapeSymbols,
    cell: () => 'rgba(30,30,45,0.85)',
    content: (value: SudokuCell) => (value !== 0 ? shapeSymbols[value - 1] : null),
    contentColor: (value: SudokuCell) => (value !== 0 ? classicColors[value - 1] : null),
  },
  numbers: {
    label: '🔢 Numbers',
    desc: 'Classic number sudoku',
    colors: classicColors,
    names: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    cell: () => 'rgba(30,30,45,0.85)',
    content: (value: SudokuCell) => (value !== 0 ? String(value) : null),
    contentColor: (value: SudokuCell) => (value !== 0 ? classicColors[value - 1] : null),
  },
  grayscale: {
    label: '⚪ Grayscale',
    desc: 'White to black gradient',
    colors: grayscaleColors,
    names: grayscaleNames,
    cell: (value: SudokuCell) => (value !== 0 ? grayscaleColors[value - 1] : null),
    content: () => null,
    contentColor: (value: SudokuCell) => {
      if (value === 0) return null
      return value <= 5 ? '#111827' : '#F9FAFB'
    },
  },
  rainbow: {
    label: '🌈 Chaos',
    desc: 'Animated shifting hues',
    colors: ['#DB2777', '#DC2626', '#EA580C', '#D97706', '#16A34A', '#0891B2', '#2563EB', '#BF55EC', '#7C3AED'],
    names: classicNames,
    cell: () => null,
    content: () => null,
    animated: true,
  },
}

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[]

