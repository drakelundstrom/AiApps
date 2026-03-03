export const DRAGON_SPAWN_CHANCE_PER_SECOND = 0.05
export const DRAGON_CIRCLE_DURATION_SECONDS = 5
export const DRAGON_CIRCLE_COUNT = 3
export const DRAGON_ENTER_DURATION_SECONDS = 2
export const DRAGON_EXIT_DURATION_SECONDS = 3
export const DRAGON_CIRCLE_PHASE_SECONDS = DRAGON_CIRCLE_DURATION_SECONDS * DRAGON_CIRCLE_COUNT
export const DRAGON_LIFETIME_SECONDS =
  DRAGON_ENTER_DURATION_SECONDS + DRAGON_CIRCLE_PHASE_SECONDS + DRAGON_EXIT_DURATION_SECONDS
export const MAX_DRAGONS_ON_SCREEN = 3

export const DRAGON_COLOR_PALETTES = [
  { color: '#d9465f', accentColor: '#fca5a5' },
  { color: '#22c55e', accentColor: '#86efac' },
  { color: '#2563eb', accentColor: '#93c5fd' },
  { color: '#eab308', accentColor: '#fde68a' },
  { color: '#7c3aed', accentColor: '#c4b5fd' },
  { color: '#ea580c', accentColor: '#fdba74' },
  { color: '#0ea5e9', accentColor: '#67e8f9' },
  { color: '#db2777', accentColor: '#f9a8d4' },
]
