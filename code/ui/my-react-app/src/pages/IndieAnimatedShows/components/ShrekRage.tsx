import React, { useState, useCallback, useRef, useEffect, type CSSProperties } from 'react'
import type { ShrekStage } from './shrekInterfaces'

/* ── Shrek anger stages ────────────────────────────────────────── */

const STAGES: ShrekStage[] = [
  {
    face: '🟢\n 😐 ',
    bg: '#2d5a1e',
    text: "…What are ye doin' in my swamp?",
    shake: 0,
    fontSize: '1rem',
    textColor: '#a8d98a',
    border: '#3a7a28',
  },
  {
    face: '🟢\n 😑 ',
    bg: '#2d5a1e',
    text: "I said… what are ye doin' here?",
    shake: 1,
    fontSize: '1.05rem',
    textColor: '#b8e89a',
    border: '#4a8a38',
  },
  {
    face: '🟢\n 😠 ',
    bg: '#3a6622',
    text: "Do I LOOK like I want company?!",
    shake: 2,
    fontSize: '1.15rem',
    textColor: '#ffe066',
    border: '#5a9a48',
  },
  {
    face: '🟢\n 😤 ',
    bg: '#446622',
    text: "This is MY swamp! MINE!!",
    shake: 3,
    fontSize: '1.3rem',
    textColor: '#ffaa33',
    border: '#7aaa58',
  },
  {
    face: '🟢\n 🤬 ',
    bg: '#554400',
    text: "DONKEY!! I told ye to keep people OUT!!",
    shake: 5,
    fontSize: '1.5rem',
    textColor: '#ff6622',
    border: '#aa6633',
  },
  {
    face: '🟢\n 👹 ',
    bg: '#552200',
    text: "THAT'S IT!! OGRES HAVE LAYERS!! AND THIS LAYER IS PURE RAGE!!!",
    shake: 8,
    fontSize: '1.7rem',
    textColor: '#ff4411',
    border: '#cc4422',
  },
  {
    face: '🟢\n 💀 ',
    bg: '#330000',
    text: "GET OOOOUT OF MY SWAAAAMP!!!",
    shake: 12,
    fontSize: '2.2rem',
    textColor: '#ff0000',
    border: '#ff2200',
  },
  {
    face: '🟢\n 🌋 ',
    bg: '#110000',
    text: "🔥🔥🔥 I WILL END YOU, LADDIE!!! NOBODY POKES THE OGRE!!! 🔥🔥🔥",
    shake: 18,
    fontSize: '2.4rem',
    textColor: '#ff0044',
    border: '#ff0000',
  },
]

/* ── styles ────────────────────────────────────────────────────── */

const baseCss = {
  wrapper: {
    marginTop: '2.5rem',
    marginBottom: '2rem',
    padding: '1.5rem',
    borderRadius: 16,
    textAlign: 'center',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  } satisfies CSSProperties,
  label: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginBottom: '0.5rem',
  } satisfies CSSProperties,
  faceBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '5rem',
    lineHeight: 1.1,
    padding: '0.5rem 1rem',
    borderRadius: 16,
    transition: 'transform 0.1s',
    userSelect: 'none',
    whiteSpace: 'pre-line',
    display: 'inline-block',
  } satisfies CSSProperties,
  speech: {
    marginTop: '1rem',
    fontWeight: 800,
    fontStyle: 'italic',
    lineHeight: 1.4,
    fontFamily: "'Georgia', serif",
    transition: 'all 0.2s',
  } satisfies CSSProperties,
  counter: {
    marginTop: '0.75rem',
    fontSize: '0.78rem',
    color: '#64748b',
  } satisfies CSSProperties,
  resetBtn: {
    marginTop: '0.6rem',
    padding: '0.35rem 1rem',
    borderRadius: 6,
    border: '1px solid #475569',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.78rem',
  } satisfies CSSProperties,
  swampBubbles: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  } satisfies CSSProperties,
}

/* ── component ─────────────────────────────────────────────────── */

export default function ShrekRage(): React.JSX.Element {
  const [clicks, setClicks] = useState(0)
  const [shaking, setShaking] = useState(false)
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stageIndex = Math.min(clicks, STAGES.length - 1)
  const stage = STAGES[stageIndex]

  const handleClick = useCallback(() => {
    setClicks((c) => c + 1)
    setShaking(true)
    if (shakeTimer.current) clearTimeout(shakeTimer.current)
    shakeTimer.current = setTimeout(() => setShaking(false), 400 + stage.shake * 40)
  }, [stage.shake])

  useEffect(() => {
    return () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current)
    }
  }, [])

  /* re-trigger shake animation via interval while shaking */
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 })
  useEffect(() => {
    if (!shaking || stage.shake === 0) {
      setShakeOffset({ x: 0, y: 0 })
      return
    }
    const id = setInterval(() => {
      setShakeOffset({
        x: (Math.random() - 0.5) * stage.shake * 2,
        y: (Math.random() - 0.5) * stage.shake * 1.4,
      })
    }, 50)
    return () => clearInterval(id)
  }, [shaking, stage.shake])

  const wrapperStyle: CSSProperties = {
    ...baseCss.wrapper,
    background: stage.bg,
    border: `2px solid ${stage.border}`,
    transform: shaking
      ? `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`
      : undefined,
  }

  const isMaxRage = clicks >= STAGES.length - 1

  return (
    <div style={wrapperStyle}>
      {/* swamp bubble decorations */}
      {clicks > 2 && (
        <div style={baseCss.swampBubbles}>
          {Array.from({ length: Math.min(clicks, 20) }).map((_, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${10 + (i * 37) % 80}%`,
                bottom: `${-10 + (i * 13) % 30}%`,
                fontSize: `${0.5 + Math.random() * 1.5}rem`,
                opacity: 0.15 + Math.random() * 0.2,
                animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              🫧
            </span>
          ))}
        </div>
      )}

      <p style={baseCss.label}>👇 Tap Shrek&apos;s face… if you dare</p>

      <button
        type="button"
        onClick={handleClick}
        style={{
          ...baseCss.faceBtn,
          fontSize: `${5 + stageIndex * 0.5}rem`,
          transform: shaking ? `rotate(${(Math.random() - 0.5) * stage.shake * 2}deg)` : undefined,
        }}
        aria-label={`Poke Shrek (anger level ${stageIndex + 1} of ${STAGES.length})`}
      >
        {stage.face}
      </button>

      <p
        style={{
          ...baseCss.speech,
          fontSize: stage.fontSize,
          color: stage.textColor,
          textShadow: stageIndex > 4 ? `0 0 ${stageIndex * 4}px ${stage.textColor}` : undefined,
        }}
      >
        &ldquo;{stage.text}&rdquo;
      </p>

      <p style={baseCss.counter}>
        Pokes: {clicks} {isMaxRage && '💥 MAX RAGE 💥'}
      </p>

      {clicks > 0 && (
        <button
          type="button"
          style={baseCss.resetBtn}
          onClick={() => setClicks(0)}
        >
          🕊️ Apologize & Reset
        </button>
      )}

      {/* inline keyframes for bubble float */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-40px) scale(1.2); }
        }
      `}</style>
    </div>
  )
}
