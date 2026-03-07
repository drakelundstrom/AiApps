import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GamePhase, LatLng, Location, RoundResult } from './interfaces'
import { LOCATIONS, MAX_DISTANCE_KM, MAX_SCORE_PER_ROUND, ROUNDS_PER_GAME } from './constants/locations'
import {
  buttonStyle,
  clueCardStyle,
  containerStyle,
  headerStyle,
  mapContainerStyle,
  scoreBarStyle,
  secondaryButtonStyle,
  summaryCardStyle,
} from './constants/styles'
import { calculateScore, formatDistance, getReaction, haversineDistance, shuffle } from './utils/geoMath'

// Fix Leaflet default marker icons (CDN URLs for Vite compatibility)
const ICON_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const ICON_RETINA_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const SHADOW_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconUrl: ICON_URL,
  iconRetinaUrl: ICON_RETINA_URL,
  shadowUrl: SHADOW_URL,
})

const answerIcon = new L.Icon({
  iconUrl: ICON_URL,
  iconRetinaUrl: ICON_RETINA_URL,
  shadowUrl: SHADOW_URL,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'answer-marker',
})

/* ─── Click handler component ─── */
interface ClickHandlerProps {
  onMapClick: (latlng: LatLng) => void
  disabled: boolean
}

function ClickHandler({ onMapClick, disabled }: ClickHandlerProps) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
      }
    },
  })
  return null
}

/* ─── Main component ─── */
export default function GeoGuesserPage() {
  const [phase, setPhase] = useState<GamePhase>('menu')
  const [roundLocations, setRoundLocations] = useState<Location[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [guess, setGuess] = useState<LatLng | null>(null)
  const [results, setResults] = useState<RoundResult[]>([])
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('geoguesser-highscore')
    return saved ? parseInt(saved, 10) : 0
  })
  const mapRef = useRef<L.Map | null>(null)

  const currentLocation = roundLocations[currentRound] as Location | undefined

  const totalScore = useMemo(() => results.reduce((sum, r) => sum + r.score, 0), [results])
  const maxPossible = ROUNDS_PER_GAME * MAX_SCORE_PER_ROUND

  /* Start a new game */
  const startGame = useCallback(() => {
    const shuffled = shuffle(LOCATIONS).slice(0, ROUNDS_PER_GAME)
    setRoundLocations(shuffled)
    setCurrentRound(0)
    setGuess(null)
    setResults([])
    setPhase('guessing')
  }, [])

  /* Handle map click → place guess */
  const handleMapClick = useCallback((latlng: LatLng) => {
    setGuess(latlng)
  }, [])

  /* Confirm guess → show result */
  const confirmGuess = useCallback(() => {
    if (!guess || !currentLocation) return
    const distanceKm = haversineDistance(guess, currentLocation.coordinates)
    const score = calculateScore(distanceKm, MAX_SCORE_PER_ROUND, MAX_DISTANCE_KM)
    const roundResult: RoundResult = { location: currentLocation, guess, distanceKm, score }
    setResults((prev) => [...prev, roundResult])
    setPhase('result')

    // Fit map to show both markers
    if (mapRef.current) {
      const bounds = L.latLngBounds(
        [guess.lat, guess.lng],
        [currentLocation.coordinates.lat, currentLocation.coordinates.lng],
      )
      mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 })
    }
  }, [guess, currentLocation])

  /* Next round or summary */
  const nextRound = useCallback(() => {
    if (currentRound + 1 >= ROUNDS_PER_GAME) {
      setPhase('summary')
    } else {
      setCurrentRound((r) => r + 1)
      setGuess(null)
      setPhase('guessing')
      if (mapRef.current) {
        mapRef.current.setView([20, 0], 2)
      }
    }
  }, [currentRound])

  /* Update high score on summary */
  useEffect(() => {
    if (phase === 'summary' && totalScore > highScore) {
      setHighScore(totalScore)
      localStorage.setItem('geoguesser-highscore', String(totalScore))
    }
  }, [phase, totalScore, highScore])

  const lastResult = results[results.length - 1] as RoundResult | undefined
  const lastReaction = lastResult ? getReaction((lastResult.score / MAX_SCORE_PER_ROUND) * 100) : null
  const finalReaction = phase === 'summary' ? getReaction((totalScore / maxPossible) * 100) : null

  /* ─── MENU SCREEN ─── */
  if (phase === 'menu') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>🌍 GeoGuesser</h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.8, maxWidth: 500, margin: '1rem auto' }}>
            You&apos;ll get a clue about a famous landmark. Click the map where you think it is.
            The closer you are, the more points you earn!
          </p>
          <p style={{ opacity: 0.6, marginBottom: '0.5rem' }}>
            {ROUNDS_PER_GAME} rounds · up to {maxPossible.toLocaleString()} points
          </p>
          {highScore > 0 && (
            <p style={{ marginBottom: '1.5rem', color: '#a5b4fc' }}>
              🏆 Best score: {highScore.toLocaleString()} / {maxPossible.toLocaleString()}
            </p>
          )}
          <button type="button" style={buttonStyle} onClick={startGame}>
            Start Game
          </button>
        </div>
      </div>
    )
  }

  /* ─── SUMMARY SCREEN ─── */
  if (phase === 'summary') {
    return (
      <div style={containerStyle}>
        <h1 style={headerStyle}>
          {finalReaction?.emoji} Game Over — {totalScore.toLocaleString()} / {maxPossible.toLocaleString()}
        </h1>
        <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
          {finalReaction?.label}
        </p>
        {results.map((r, i) => (
          <div key={r.location.id} style={summaryCardStyle}>
            <span>
              <strong>Round {i + 1}:</strong> {r.location.emoji} {r.location.name}
            </span>
            <span style={{ opacity: 0.7 }}>{formatDistance(r.distanceKm)}</span>
            <span style={{ fontWeight: 700, color: r.score > 3000 ? '#34d399' : r.score > 1000 ? '#fbbf24' : '#f87171' }}>
              {r.score.toLocaleString()} pts
            </span>
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button type="button" style={buttonStyle} onClick={startGame}>
            Play Again
          </button>
          <button type="button" style={secondaryButtonStyle} onClick={() => setPhase('menu')}>
            Menu
          </button>
        </div>
      </div>
    )
  }

  /* ─── GUESSING / RESULT SCREEN ─── */
  return (
    <div style={containerStyle}>
      <h1 style={{ ...headerStyle, fontSize: '1.6rem' }}>🌍 GeoGuesser</h1>

      {/* Score bar */}
      <div style={scoreBarStyle}>
        <span>
          Round {currentRound + 1} / {ROUNDS_PER_GAME}
        </span>
        <span>Score: {totalScore.toLocaleString()}</span>
      </div>

      {/* Clue card */}
      {currentLocation && phase === 'guessing' && (
        <div style={clueCardStyle}>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            <span style={{ fontSize: '1.5rem', marginRight: 8 }}>{currentLocation.emoji}</span>
            {currentLocation.clue}
          </p>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.5, fontSize: '0.85rem' }}>
            Region: {currentLocation.region}
          </p>
        </div>
      )}

      {/* Result feedback */}
      {phase === 'result' && lastResult && lastReaction && (
        <div style={{ ...clueCardStyle, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
            {lastReaction.emoji} {lastReaction.label}
          </p>
          <p style={{ margin: '0.5rem 0' }}>
            {lastResult.location.emoji} <strong>{lastResult.location.name}</strong>
          </p>
          <p style={{ margin: 0, opacity: 0.7 }}>
            You were <strong>{formatDistance(lastResult.distanceKm)}</strong> away —{' '}
            <span style={{ color: '#a5b4fc', fontWeight: 700 }}>
              +{lastResult.score.toLocaleString()} pts
            </span>
          </p>
        </div>
      )}

      {/* Map */}
      <div style={mapContainerStyle}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ width: '100%', height: '100%' }}
          ref={mapRef}
          worldCopyJump
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMapClick={handleMapClick} disabled={phase !== 'guessing'} />

          {/* Guess marker */}
          {guess && (
            <Marker position={[guess.lat, guess.lng]}>
              <Popup>Your guess</Popup>
            </Marker>
          )}

          {/* Answer marker (result phase) */}
          {phase === 'result' && currentLocation && (
            <>
              <Marker
                position={[currentLocation.coordinates.lat, currentLocation.coordinates.lng]}
                icon={answerIcon}
              >
                <Popup>{currentLocation.emoji} {currentLocation.name}</Popup>
              </Marker>
              {guess && (
                <Polyline
                  positions={[
                    [guess.lat, guess.lng],
                    [currentLocation.coordinates.lat, currentLocation.coordinates.lng],
                  ]}
                  pathOptions={{ color: '#f43f5e', weight: 3, dashArray: '8 6' }}
                />
              )}
            </>
          )}
        </MapContainer>
      </div>

      {/* Actions */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        {phase === 'guessing' && (
          <button
            type="button"
            style={{ ...buttonStyle, opacity: guess ? 1 : 0.4 }}
            disabled={!guess}
            onClick={confirmGuess}
          >
            Confirm Guess
          </button>
        )}
        {phase === 'result' && (
          <button type="button" style={buttonStyle} onClick={nextRound}>
            {currentRound + 1 >= ROUNDS_PER_GAME ? 'See Results' : 'Next Round →'}
          </button>
        )}
      </div>
    </div>
  )
}
