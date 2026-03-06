import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  DRAGON_COLOR_PALETTES,
  DRAGON_LIFETIME_SECONDS,
  DRAGON_SPAWN_CHANCE_PER_SECOND,
  MAX_DRAGONS_ON_SCREEN,
  FOO_DOG_COLOR_PALETTES,
} from '../constants/dragonConfig'
import type { DragonInstance } from '../interfaces'
import { EasternDragon } from './EasternDragon'
import { FooDog } from './FooDog'

function createDragon(now: number, id: number, existing: DragonInstance[]): DragonInstance {
  // 1/10 chance for a foo dog
  const isFooDog = Math.random() < 0.1
  
  const palettes = isFooDog ? FOO_DOG_COLOR_PALETTES : DRAGON_COLOR_PALETTES
  const used = new Set(existing.filter((d) => d.isFooDog === isFooDog).map((dragon) => dragon.color))
  const availablePalettes = palettes.filter((palette) => !used.has(palette.color))
  const selectedPalette = availablePalettes.length > 0
    ? availablePalettes[Math.floor(Math.random() * availablePalettes.length)]
    : palettes[Math.floor(Math.random() * palettes.length)]

  return {
    id,
    spawnTime: now,
    color: selectedPalette.color,
    accentColor: selectedPalette.accentColor,
    pathCenterX: -3 + Math.random() * 6,
    pathCenterZ: -5 + Math.random() * 10,
    circleRadius: 6 + Math.random() * 5,
    circleDirection: Math.random() > 0.5 ? 1 : -1,
    entryX: -26,
    entryZ: -7 + Math.random() * 14,
    exitX: 26,
    exitZ: -7 + Math.random() * 14,
    altitude: 6 + Math.random() * 5,
    wavePhase: Math.random() * Math.PI * 2,
    scale: 0.8 + Math.random() * 0.45,
    isFooDog,
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
      {dragons.map((dragon) => 
        dragon.isFooDog ? (
          <FooDog key={dragon.id} dragon={dragon} />
        ) : (
          <EasternDragon key={dragon.id} dragon={dragon} />
        )
      )}
    </group>
  )
}
