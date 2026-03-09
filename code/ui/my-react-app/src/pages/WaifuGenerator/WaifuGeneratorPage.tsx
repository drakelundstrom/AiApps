import { useState, useMemo, useCallback } from 'react'
import type {
  WaifuFilters,
  WaifuCharacter,
  HairColor,
  EyeColor,
  WaifuGender,
  Personality,
  SourceMedia,
} from './interfaces'
import {
  WAIFU_ROSTER,
  HAIR_COLOR_OPTIONS,
  EYE_COLOR_OPTIONS,
  GENDER_OPTIONS,
  PERSONALITY_OPTIONS,
  SOURCE_MEDIA_OPTIONS,
} from './constants/waifuData'
import { styles } from './constants/styles'

/* ── filter helpers ───────────────────────────────────────────────── */

function matchesFilters(c: WaifuCharacter, f: WaifuFilters): boolean {
  if (f.gender !== 'any' && c.gender !== f.gender) return false
  if (f.hairColor !== 'any' && c.hairColor !== f.hairColor) return false
  if (f.eyeColor !== 'any' && c.eyeColor !== f.eyeColor) return false
  if (f.personality !== 'any' && c.personality !== f.personality) return false
  if (f.sourceMedia !== 'any' && c.sourceMedia !== f.sourceMedia) return false
  return true
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/* ── tiny keyframe injection (once) ─────────────────────────────── */
const KEYFRAME_ID = 'waifu-fade-keyframe'
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAME_ID)) {
  const style = document.createElement('style')
  style.id = KEYFRAME_ID
  style.textContent = `@keyframes waifuFadeIn{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}`
  document.head.appendChild(style)
}

/* ── component ────────────────────────────────────────────────────── */

interface FilterSelectProps<T extends string> {
  label: string
  options: ReadonlyArray<{ readonly value: T; readonly label: string }>
  value: T
  onChange: (v: T) => void
}

function FilterSelect<T extends string>({ label, options, value, onChange }: FilterSelectProps<T>) {
  return (
    <div style={styles.filterGroup}>
      <span style={styles.filterLabel}>{label}</span>
      <select
        style={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function WaifuGeneratorPage() {
  const [filters, setFilters] = useState<WaifuFilters>({
    gender: 'any',
    hairColor: 'any',
    eyeColor: 'any',
    personality: 'any',
    sourceMedia: 'any',
  })

  const [result, setResult] = useState<WaifuCharacter | null>(null)
  const [animKey, setAnimKey] = useState(0)

  /** Candidates that match current filters */
  const candidates = useMemo(
    () => WAIFU_ROSTER.filter((c) => matchesFilters(c, filters)),
    [filters],
  )

  const generate = useCallback(() => {
    if (candidates.length === 0) return
    setResult(pickRandom(candidates))
    setAnimKey((k) => k + 1)
  }, [candidates])

  /** Patch one field at a time */
  const patch = useCallback(
    <K extends keyof WaifuFilters>(key: K, value: WaifuFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  return (
    <div className="page-container" style={styles.container}>
      <h1 style={styles.title}>💖 Waifu Generator</h1>
      <p style={styles.subtitle}>Pick your traits and discover your match!</p>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <div style={styles.filtersCard}>
        <FilterSelect<WaifuGender>
          label="Waifu / Husbando"
          options={GENDER_OPTIONS}
          value={filters.gender}
          onChange={(v) => patch('gender', v)}
        />
        <FilterSelect<HairColor>
          label="Hair Color"
          options={HAIR_COLOR_OPTIONS}
          value={filters.hairColor}
          onChange={(v) => patch('hairColor', v)}
        />
        <FilterSelect<EyeColor>
          label="Eye Color"
          options={EYE_COLOR_OPTIONS}
          value={filters.eyeColor}
          onChange={(v) => patch('eyeColor', v)}
        />
        <FilterSelect<Personality>
          label="Personality"
          options={PERSONALITY_OPTIONS}
          value={filters.personality}
          onChange={(v) => patch('personality', v)}
        />
        <FilterSelect<SourceMedia>
          label="Source Media"
          options={SOURCE_MEDIA_OPTIONS}
          value={filters.sourceMedia}
          onChange={(v) => patch('sourceMedia', v)}
        />
      </div>

      {/* ── Match count + Button ─────────────────────────────────── */}
      <p style={styles.matchCount}>
        {candidates.length} character{candidates.length !== 1 ? 's' : ''} match your filters
      </p>

      <button
        type="button"
        style={{
          ...styles.generateBtn,
          opacity: candidates.length === 0 ? 0.4 : 1,
          cursor: candidates.length === 0 ? 'not-allowed' : 'pointer',
        }}
        disabled={candidates.length === 0}
        onClick={generate}
        onMouseEnter={(e) => {
          if (candidates.length > 0) {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(192,132,252,0.55)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(192,132,252,0.4)'
        }}
      >
        ✨ Generate!
      </button>

      {/* ── Result ───────────────────────────────────────────────── */}
      {result ? (
        <div key={animKey} style={styles.resultCard}>
          <div style={styles.resultEmoji}>{result.emoji}</div>
          <div style={styles.resultName}>{result.name}</div>
          <div style={styles.resultSeries}>{result.series}</div>
          <p style={styles.resultQuote}>&ldquo;{result.quote}&rdquo;</p>

          <div>
            {result.traits.map((t) => (
              <span key={t} style={styles.traitBadge}>
                {t}
              </span>
            ))}
          </div>

          <div style={styles.statsRow}>
            <span style={styles.statPill}>
              {result.gender === 'girl' ? '♀ Waifu' : '♂ Husbando'}
            </span>
            <span style={styles.statPill}>Hair: {result.hairColor}</span>
            <span style={styles.statPill}>Eyes: {result.eyeColor}</span>
            <span style={styles.statPill}>{result.personality}</span>
            <span style={styles.statPill}>{result.sourceMedia}</span>
          </div>
        </div>
      ) : (
        <p style={styles.empty}>Press &ldquo;Generate!&rdquo; to find your waifu 💫</p>
      )}
    </div>
  )
}
