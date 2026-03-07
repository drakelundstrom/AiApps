import type { LatLng } from '../interfaces'

const EARTH_RADIUS_KM = 6371

/** Haversine distance between two geographic points in kilometers */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** Calculate score (0–maxScore) based on distance. Closer = higher score. */
export function calculateScore(distanceKm: number, maxScore: number, maxDistance: number): number {
  if (distanceKm <= 0) return maxScore
  if (distanceKm >= maxDistance) return 0
  // Exponential decay — generous for close guesses, drops off fast
  return Math.round(maxScore * Math.exp(-distanceKm / (maxDistance / 5)))
}

/** Format distance for display */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 100) return `${km.toFixed(1)} km`
  return `${Math.round(km).toLocaleString()} km`
}

/** Shuffle array using Fisher-Yates */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Get a grade/reaction based on score percentage */
export function getReaction(scorePercent: number): { label: string; emoji: string } {
  if (scorePercent >= 90) return { label: 'Perfect!', emoji: '🎯' }
  if (scorePercent >= 70) return { label: 'Great!', emoji: '🔥' }
  if (scorePercent >= 50) return { label: 'Nice!', emoji: '👍' }
  if (scorePercent >= 30) return { label: 'Not bad', emoji: '🤔' }
  if (scorePercent >= 10) return { label: 'Hmm...', emoji: '😬' }
  return { label: 'Way off!', emoji: '💀' }
}
