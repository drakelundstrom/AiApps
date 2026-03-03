import { useEffect, useRef } from 'react'
import { startFishyGame } from './FishyGame'
import './Fishy.css'

export default function Fishy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const levelRef = useRef<HTMLDivElement | null>(null)
  const hudRef = useRef<HTMLDivElement | null>(null)
  const scoreRef = useRef<HTMLSpanElement | null>(null)
  const sizeRef = useRef<HTMLSpanElement | null>(null)
  const statusRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const cleanup = startFishyGame({
      canvas: canvasRef.current,
      scoreEl: scoreRef.current,
      sizeEl: sizeRef.current,
      statusEl: statusRef.current,
      levelEl: levelRef.current,
      hudEl: hudRef.current,
    })

    return () => {
      cleanup()
    }
  }, [])

  return (
    <section className="fishy-page" aria-label="Fishy game">
      <canvas ref={canvasRef} id="fishy-canvas" aria-label="Fishy Game" />
      <div ref={levelRef} id="level-bar">Level 1</div>
      <div ref={hudRef} className="hud">
        <span ref={scoreRef} id="score">Trophy 0</span>
        <span ref={sizeRef} id="size">Fish 20</span>
        <span ref={statusRef} id="status">Move with mouse or touch</span>
      </div>
    </section>
  )
}
