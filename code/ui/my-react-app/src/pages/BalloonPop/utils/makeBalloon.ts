import { BALLOON_COLORS, BALLOON_EMOJIS } from '../constants/balloonConstants'
import type { Balloon } from '../interfaces'

let nextId = 0

export function makeBalloon(areaW: number, areaH: number): Balloon {
  const size = 50 + Math.random() * 50
  const balloon: Balloon = {
    id: nextId,
    x: Math.random() * Math.max(1, areaW - size),
    y: areaH + size,
    size,
    speed: 0.6 + Math.random() * 1.4,
    wobbleAmp: 15 + Math.random() * 25,
    wobbleSpeed: 0.5 + Math.random() * 1.5,
    wobbleOffset: Math.random() * Math.PI * 2,
    color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
    emoji: BALLOON_EMOJIS[Math.floor(Math.random() * BALLOON_EMOJIS.length)],
    popping: false,
    popTime: 0,
  }

  nextId += 1
  return balloon
}
