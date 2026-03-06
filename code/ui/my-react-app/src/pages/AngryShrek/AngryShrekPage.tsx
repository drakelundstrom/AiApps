import React, { useState, useCallback, useRef, useEffect, type CSSProperties } from 'react'
import type { FloatingText } from './interfaces'
import { ANGER_STAGES, CLICK_SPLASHES, SWAMP_PARTICLES } from './constants/shrekData'

/* ── Shrek face SVG builder ────────────────────────────────────── */

function shrekFace(angerLevel: number, size: number): string {
  const pct = Math.min(angerLevel / 10, 1)

  // colors shift from calm green to angry dark red-green
  const skinR = Math.round(80 + pct * 100)
  const skinG = Math.round(160 - pct * 80)
  const skinB = Math.round(60 - pct * 50)
  const skin = `rgb(${skinR},${skinG},${skinB})`

  const mouthOpen = Math.round(5 + pct * 35)
  const browAngle = Math.round(pct * 35)
  const eyeShrink = Math.max(1 - pct * 0.4, 0.6)
  const pupilSize = Math.max(6 - pct * 2, 3)
  const earFlare = pct * 8
  const veinOpacity = pct

  // cheek puff
  const cheekPuff = pct * 10

  const s = size

  return `<svg viewBox="0 0 200 220" width="${s}" height="${Math.round(s * 1.1)}" xmlns="http://www.w3.org/2000/svg">
    <!-- head -->
    <ellipse cx="100" cy="105" rx="${78 + cheekPuff}" ry="90" fill="${skin}" stroke="#3a5a20" stroke-width="2.5"/>

    <!-- ears -->
    <ellipse cx="${18 - earFlare}" cy="85" rx="22" ry="14"
      fill="${skin}" stroke="#3a5a20" stroke-width="2"
      transform="rotate(-20 ${18 - earFlare} 85)"/>
    <ellipse cx="${182 + earFlare}" cy="85" rx="22" ry="14"
      fill="${skin}" stroke="#3a5a20" stroke-width="2"
      transform="rotate(20 ${182 + earFlare} 85)"/>
    <ellipse cx="${18 - earFlare}" cy="85" rx="14" ry="8"
      fill="#5a8030" transform="rotate(-20 ${18 - earFlare} 85)"/>
    <ellipse cx="${182 + earFlare}" cy="85" rx="14" ry="8"
      fill="#5a8030" transform="rotate(20 ${182 + earFlare} 85)"/>

    <!-- brow ridges (angrier = more angled) -->
    <line x1="52" y1="${72 + browAngle * 0.3}" x2="82" y2="${72 - browAngle * 0.4}"
      stroke="#3a5a20" stroke-width="${3 + pct * 2}" stroke-linecap="round"/>
    <line x1="148" y1="${72 + browAngle * 0.3}" x2="118" y2="${72 - browAngle * 0.4}"
      stroke="#3a5a20" stroke-width="${3 + pct * 2}" stroke-linecap="round"/>

    <!-- eyes (shrink when angry) -->
    <ellipse cx="70" cy="82" rx="${14 * eyeShrink}" ry="${18 * eyeShrink}" fill="#f5f0d0"/>
    <ellipse cx="130" cy="82" rx="${14 * eyeShrink}" ry="${18 * eyeShrink}" fill="#f5f0d0"/>
    <circle cx="${70 + pct * 2}" cy="${82 + pct * 2}" r="${pupilSize}" fill="#5a3010"/>
    <circle cx="${130 - pct * 2}" cy="${82 + pct * 2}" r="${pupilSize}" fill="#5a3010"/>
    <circle cx="${72 + pct * 2}" cy="${79 + pct}" r="1.5" fill="#fff"/>
    <circle cx="${132 - pct * 2}" cy="${79 + pct}" r="1.5" fill="#fff"/>

    <!-- nose -->
    <ellipse cx="100" cy="110" rx="${12 + pct * 3}" ry="${9 + pct * 2}" fill="#5a8030"/>
    <ellipse cx="93" cy="112" rx="3.5" ry="4" fill="#3a5a20"/>
    <ellipse cx="107" cy="112" rx="3.5" ry="4" fill="#3a5a20"/>

    <!-- mouth -->
    <ellipse cx="100" cy="${140 + pct * 5}" rx="${25 + pct * 18}" ry="${mouthOpen}"
      fill="#2a0a0a" stroke="#3a3a10" stroke-width="2"/>
    ${pct > 0.3 ? `
      <!-- teeth when angry enough -->
      <rect x="82" y="${138 + pct * 5}" width="8" height="${6 + pct * 6}" rx="2" fill="#f0e8c0"/>
      <rect x="110" y="${138 + pct * 5}" width="8" height="${6 + pct * 6}" rx="2" fill="#f0e8c0"/>
      ${pct > 0.6 ? `
        <rect x="93" y="${138 + pct * 5}" width="6" height="${4 + pct * 5}" rx="2" fill="#f0e8c0"/>
        <rect x="103" y="${138 + pct * 5}" width="6" height="${4 + pct * 5}" rx="2" fill="#f0e8c0"/>
      ` : ''}
    ` : ''}

    <!-- anger veins -->
    ${veinOpacity > 0.2 ? `
      <path d="M 45 55 L 50 48 L 55 55 L 50 52 Z"
        fill="none" stroke="rgba(200,30,30,${veinOpacity})" stroke-width="1.5"/>
      <path d="M 150 50 L 155 43 L 160 50 L 155 47 Z"
        fill="none" stroke="rgba(200,30,30,${veinOpacity})" stroke-width="1.5"/>
    ` : ''}
    ${veinOpacity > 0.5 ? `
      <path d="M 38 70 L 43 63 L 48 70 L 43 67 Z"
        fill="none" stroke="rgba(200,30,30,${veinOpacity * 0.8})" stroke-width="1.2"/>
      <path d="M 155 65 L 160 58 L 165 65 L 160 62 Z"
        fill="none" stroke="rgba(200,30,30,${veinOpacity * 0.8})" stroke-width="1.2"/>
    ` : ''}

    <!-- sweat when very angry -->
    ${pct > 0.6 ? `
      <ellipse cx="50" cy="65" rx="3" ry="5" fill="rgba(100,200,255,${pct * 0.5})"/>
      <ellipse cx="155" cy="60" rx="2.5" ry="4" fill="rgba(100,200,255,${pct * 0.4})"/>
    ` : ''}

    <!-- steam from ears when enraged -->
    ${pct > 0.8 ? `
      <text x="${8 - earFlare}" y="60" font-size="16" text-anchor="middle" opacity="${pct - 0.7}">💨</text>
      <text x="${192 + earFlare}" y="60" font-size="16" text-anchor="middle" opacity="${pct - 0.7}">💨</text>
    ` : ''}
  </svg>`
}

/* ── styles ────────────────────────────────────────────────────── */

const css = {
  page: (bg: string): CSSProperties => ({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
    transition: 'background 0.4s ease',
    padding: '2rem 1rem',
    overflow: 'hidden',
    position: 'relative',
    userSelect: 'none',
  }),
  title: (color: string): CSSProperties => ({
    fontSize: '2rem',
    fontWeight: 800,
    color,
    textAlign: 'center',
    margin: '0 0 0.25rem',
    transition: 'color 0.3s',
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
  }),
  subtitle: {
    color: '#b0c0a0',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    textAlign: 'center',
  } satisfies CSSProperties,
  angerLabel: (color: string): CSSProperties => ({
    fontSize: '1.1rem',
    fontWeight: 700,
    color,
    marginBottom: '0.5rem',
    transition: 'color 0.3s',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }),
  faceWrap: (shake: number): CSSProperties => ({
    cursor: 'pointer',
    transition: 'transform 0.1s',
    animation: shake > 0 ? `shrekShake ${Math.max(0.05, 0.3 - shake * 0.01)}s infinite` : 'none',
    filter: `drop-shadow(0 4px ${8 + shake}px rgba(0,0,0,0.5))`,
    position: 'relative',
  }),
  quote: (color: string, pct: number): CSSProperties => ({
    maxWidth: 500,
    textAlign: 'center',
    fontSize: `${1 + pct * 0.5}rem`,
    fontWeight: pct > 0.5 ? 900 : 600,
    color,
    margin: '1rem 0 0.5rem',
    padding: '0.8rem 1.2rem',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    border: `2px solid ${color}44`,
    lineHeight: 1.5,
    transition: 'all 0.3s',
    textShadow: pct > 0.6 ? `0 0 ${pct * 20}px ${color}` : 'none',
  }),
  angerMeter: {
    width: 280,
    height: 16,
    background: '#1a2e10',
    borderRadius: 8,
    overflow: 'hidden',
    margin: '0.75rem 0',
    border: '2px solid #3a5a20',
  } satisfies CSSProperties,
  angerFill: (pct: number): CSSProperties => ({
    height: '100%',
    width: `${pct * 100}%`,
    background: `linear-gradient(90deg, #4CAF50, #FFC107 50%, #f44336)`,
    transition: 'width 0.3s ease',
    borderRadius: 6,
  }),
  clickCount: {
    color: '#8a9a70',
    fontSize: '0.8rem',
    margin: '0.25rem 0',
  } satisfies CSSProperties,
  resetBtn: {
    marginTop: '1rem',
    padding: '0.6rem 1.6rem',
    borderRadius: 8,
    border: '2px solid #4a6a30',
    background: '#2a4a18',
    color: '#a8e6a3',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  } satisfies CSSProperties,
  floating: (x: number, y: number): CSSProperties => ({
    position: 'absolute',
    left: x,
    top: y,
    pointerEvents: 'none',
    fontWeight: 900,
    fontSize: '1.4rem',
    color: '#ffe040',
    textShadow: '0 2px 6px rgba(0,0,0,0.8)',
    animation: 'floatUp 1s ease-out forwards',
    zIndex: 100,
  }),
  particle: (x: number, delay: number): CSSProperties => ({
    position: 'absolute',
    bottom: -30,
    left: `${x}%`,
    fontSize: '1.5rem',
    animation: `particleRise ${3 + delay}s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    opacity: 0.6,
    pointerEvents: 'none',
  }),
}

/* ── keyframe injection ────────────────────────────────────────── */

const KEYFRAMES = `
@keyframes shrekShake {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  10% { transform: translate(-2px, 1px) rotate(-1deg); }
  20% { transform: translate(2px, -1px) rotate(1deg); }
  30% { transform: translate(-3px, 2px) rotate(-2deg); }
  40% { transform: translate(3px, -2px) rotate(2deg); }
  50% { transform: translate(-1px, 1px) rotate(-1deg); }
  60% { transform: translate(2px, -1px) rotate(1deg); }
  70% { transform: translate(-2px, 2px) rotate(-2deg); }
  80% { transform: translate(1px, -1px) rotate(1deg); }
  90% { transform: translate(-1px, 1px) rotate(0deg); }
}

@keyframes floatUp {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-80px) scale(1.5); }
}

@keyframes particleRise {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
}

@keyframes pulseGlow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(255,60,30,0.3)); }
  50% { filter: drop-shadow(0 0 24px rgba(255,60,30,0.8)); }
}
`

/* ── component ─────────────────────────────────────────────────── */

export default function AngryShrekPage(): React.JSX.Element {
  const [clicks, setClicks] = useState(0)
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const nextFloatId = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // inject keyframes once
  useEffect(() => {
    const id = 'shrek-keyframes'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = KEYFRAMES
      document.head.appendChild(style)
    }
    return () => {
      const el = document.getElementById(id)
      if (el) el.remove()
    }
  }, [])

  const angerLevel = Math.min(Math.floor(clicks / 3), 10)
  const stage = ANGER_STAGES[angerLevel]
  const pct = Math.min(angerLevel / 10, 1)

  const playGrunt = useCallback((level: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // deeper, rougher grunt as anger increases
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(80 + level * 15, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(50 + level * 10, ctx.currentTime + 0.15)

      gain.gain.setValueAtTime(0.15 + level * 0.03, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2 + level * 0.03)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.3 + level * 0.03)
    } catch {
      // audio may not be available
    }
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setClicks((c) => c + 1)

      // floating text splash
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const splash = CLICK_SPLASHES[Math.floor(Math.random() * CLICK_SPLASHES.length)]
      const id = nextFloatId.current++
      setFloatingTexts((prev) => [...prev, { id, text: splash, x, y }])
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((f) => f.id !== id))
      }, 1000)

      playGrunt(angerLevel)
    },
    [angerLevel, playGrunt]
  )

  const handleReset = useCallback(() => {
    setClicks(0)
    setFloatingTexts([])
  }, [])

  const svgHtml = shrekFace(angerLevel, stage.faceSize)

  return (
    <div style={css.page(stage.bgColor)}>
      {/* swamp particles */}
      {SWAMP_PARTICLES.map((p, i) => (
        <span key={i} style={css.particle((i * 13 + 5) % 100, i * 0.7)}>
          {p}
        </span>
      ))}

      <h1 style={css.title(stage.textColor)}>Angry Shrek</h1>
      <p style={css.subtitle}>Click his face. See what happens.</p>

      <span style={css.angerLabel(stage.textColor)}>{stage.label}</span>

      {/* anger meter */}
      <div style={css.angerMeter}>
        <div style={css.angerFill(pct)} />
      </div>
      <p style={css.clickCount}>{clicks} click{clicks !== 1 ? 's' : ''}</p>

      {/* Shrek face — click target */}
      <div
        style={{
          ...css.faceWrap(stage.shakeIntensity),
          ...(pct > 0.8 ? { animation: `shrekShake 0.05s infinite, pulseGlow 0.5s infinite` } : {}),
        }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`Shrek's face — anger level ${angerLevel}. Click to make him angrier!`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e as unknown as React.MouseEvent<HTMLDivElement>)
          }
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: svgHtml }} />

        {/* floating click texts */}
        {floatingTexts.map((ft) => (
          <span key={ft.id} style={css.floating(ft.x, ft.y)}>
            {ft.text}
          </span>
        ))}
      </div>

      {/* speech bubble */}
      <div style={css.quote(stage.textColor, pct)}>
        &ldquo;{stage.quote}&rdquo;
      </div>

      {/* reset */}
      {clicks > 0 && (
        <button type="button" style={css.resetBtn} onClick={handleReset}>
          🧅 Calm Down, Shrek
        </button>
      )}
    </div>
  )
}
