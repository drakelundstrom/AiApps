import { useEffect, useRef, useState } from 'react'

export function useAnimatedHue(enabled: boolean): number {
  const [hueShift, setHueShift] = useState(0)
  const frameRef = useRef<number | null>(null)
  const lastTickRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    let running = true
    lastTickRef.current = 0
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false
    const minFrameMs = prefersReducedMotion ? 220 : coarsePointer ? 90 : 45

    const tick = (now: number) => {
      if (!running) return
      if (now - lastTickRef.current >= minFrameMs) {
        lastTickRef.current = now
        setHueShift((now * 0.03) % 360)
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      running = false
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [enabled])

  return enabled ? hueShift : 0
}
