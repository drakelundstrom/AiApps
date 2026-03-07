export interface LatLng {
  lat: number
  lng: number
}

export interface Location {
  id: number
  name: string
  coordinates: LatLng
  clue: string
  emoji: string
  region: string
}

export interface RoundResult {
  location: Location
  guess: LatLng
  distanceKm: number
  score: number
}

export type GamePhase = 'menu' | 'guessing' | 'result' | 'summary'
