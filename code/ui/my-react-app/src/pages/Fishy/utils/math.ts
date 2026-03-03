export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function lerpHex(h1: string, h2: string, t: number): string {
  const r1 = parseInt(h1.slice(1, 3), 16)
  const g1 = parseInt(h1.slice(3, 5), 16)
  const b1 = parseInt(h1.slice(5, 7), 16)
  const r2 = parseInt(h2.slice(1, 3), 16)
  const g2 = parseInt(h2.slice(3, 5), 16)
  const b2 = parseInt(h2.slice(5, 7), 16)
  const r = Math.round(lerp(r1, r2, t))
  const g = Math.round(lerp(g1, g2, t))
  const b = Math.round(lerp(b1, b2, t))
  return `rgb(${r},${g},${b})`
}

export function getLevel(score: number): number {
  if (score >= 800) return 8
  if (score >= 600) return 7
  if (score >= 450) return 6
  if (score >= 320) return 5
  if (score >= 200) return 4
  if (score >= 120) return 3
  if (score >= 50) return 2
  return 1
}

export function getSpawnInterval(level: number): number {
  const base = 0.8 - level * 0.04
  const bigFishSlowdown = Math.max(0, level - 4) * 0.12
  return clamp(base + bigFishSlowdown, 0.38, 1.25)
}

export function getDread(eaten: number): number {
  return Math.min(1, eaten / 120)
}

export function getWhisperTier(dread: number): number {
  if (dread >= 0.9) return 4
  if (dread >= 0.7) return 3
  if (dread >= 0.5) return 2
  if (dread >= 0.3) return 1
  if (dread >= 0.15) return 0
  return -1
}
