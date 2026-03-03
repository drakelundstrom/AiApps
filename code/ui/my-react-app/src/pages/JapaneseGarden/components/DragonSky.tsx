import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  DRAGON_COLOR_PALETTES,
  DRAGON_LIFETIME_SECONDS,
  DRAGON_SPAWN_CHANCE_PER_SECOND,
  MAX_DRAGONS_ON_SCREEN,
} from '../constants/dragonConfig'
import type { DragonInstance } from '../interfaces'
import { EasternDragon } from './EasternDragon'

function createDragon(now: number, id: number, existing: DragonInstance[]): DragonInstance {
  const used = new Set(existing.map((dragon) => dragon.color))
  const availablePalettes = DRAGON_COLOR_PALETTES.filter((palette) => !used.has(palette.color))
  const selectedPalette = availablePalettes.length > 0
    ? availablePalettes[Math.floor(Math.random() * availablePalettes.length)]
    : DRAGON_COLOR_PALETTES[Math.floor(Math.random() * DRAGON_COLOR_PALETTES.length)]

  return {
    id,
    spawnTime: now,
    color: selectedPalette.color,
    accentColor: selectedPalette.accentColor,
    orbitRadius: 9 + Math.random() * 9,
    orbitSpeed: 0.15 + Math.random() * 0.25,
    altitude: 6 + Math.random() * 5,
    angleOffset: Math.random() * Math.PI * 2,
    direction: Math.random() > 0.5 ? 1 : -1,
    flyAwayHeading: Math.random() * Math.PI * 2,
    wavePhase: Math.random() * Math.PI * 2,
    scale: 0.8 + Math.random() * 0.45,
  }
}

export function DragonSky() {
  const [dragons, setDragons] = useState<DragonInstance[]>([])
  const nextSpawnCheckRef = useRef(1)
  const nextIdRef = useRef(1)

  useFrame(({ clock }) => {
    const now = clock.elapsedTime
    if (now < nextSpawnCheckRef.current) return

    nextSpawnCheckRef.current += 1
    setDragons((current) => {
      const active = current.filter((dragon) => now - dragon.spawnTime < DRAGON_LIFETIME_SECONDS)
      if (active.length < MAX_DRAGONS_ON_SCREEN && Math.random() < DRAGON_SPAWN_CHANCE_PER_SECOND) {
        active.push(createDragon(now, nextIdRef.current, active))
        nextIdRef.current += 1
      }
      return active
    })
  })

  return (
    <group>
      {dragons.map((dragon) => (
        <EasternDragon key={dragon.id} dragon={dragon} />
      ))}
    </group>
  )
}
