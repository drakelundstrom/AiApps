import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { Goat } from './Goat'
import { Scene } from './Scene'
import {
  JUMP_FORCE,
  MOVE_SPEED,
  MAX_ENERGY,
  MAX_HEALTH,
  ENERGY_DECAY_RATE,
  COLLECTIBLES,
  GAME_CONFIG,
} from '../constants/gameSettings'
import { GoatState, GameObject, GameStats } from '../interfaces'
import { applyPhysics, checkCollisions, getHeadbuttDirection } from '../utils/physics'

interface GameEngineProps {
  isPaused: boolean
  onStatsUpdate: (stats: GameStats) => void
}

const INITIAL_STATE: GoatState = {
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  isJumping: false,
  isHeadbutting: false,
  rotation: 0,
  health: MAX_HEALTH,
  energy: MAX_ENERGY,
  score: 0,
}

export function GameEngine({ isPaused, onStatsUpdate }: GameEngineProps) {
  const [goatState, setGoatState] = useState<GoatState>(INITIAL_STATE)
  const [collectibles, setCollectibles] = useState<GameObject[]>(() =>
    COLLECTIBLES.map((c, i) => ({
      id: `collectible-${i}`,
      position: { x: c.x - 50, y: 1, z: c.z - 50 },
      size: { x: 0.5, y: 0.5, z: 0.5 },
      type: 'collectible' as const,
      collected: false,
    }))
  )
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    health: MAX_HEALTH,
    energy: MAX_ENERGY,
    timeElapsed: 0,
    objectsInteracted: 0,
  })
  const [startTime] = useState(Date.now())
  const keysPressed = useRef<Record<string, boolean>>({})
  const lastHeadbuttTime = useRef(0)
  const groupRef = useRef<Group>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current[e.key.toUpperCase()] = true
  }, [])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current[e.key.toUpperCase()] = false
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const handleHeadbutt = useCallback(() => {
    const now = Date.now()
    if (now - lastHeadbuttTime.current < GAME_CONFIG.headbuttCooldown) {
      return
    }

    lastHeadbuttTime.current = now

    setGoatState((prev) => {
      const direction = getHeadbuttDirection(prev.rotation)

      const newState = {
        ...prev,
        velocity: {
          x: prev.velocity.x + direction.x,
          y: prev.velocity.y + direction.y,
          z: prev.velocity.z + direction.z,
        },
        isHeadbutting: true,
        energy: Math.max(0, prev.energy - 15),
      }

      setTimeout(() => {
        setGoatState((s) => ({ ...s, isHeadbutting: false }))
      }, 100)

      return newState
    })
  }, [])

  useEffect(() => {
    const handleMouseDown = () => {
      if (!isPaused) {
        handleHeadbutt()
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [handleHeadbutt, isPaused])

  useFrame(() => {
    if (isPaused) return

    setGoatState((prev) => {
      let newState = { ...prev }

      // Handle input
      const moveDir = { x: 0, z: 0 }
      if (keysPressed.current['W'] || keysPressed.current['ARROWUP']) {
        moveDir.z += MOVE_SPEED
      }
      if (keysPressed.current['S'] || keysPressed.current['ARROWDOWN']) {
        moveDir.z -= MOVE_SPEED
      }
      if (keysPressed.current['A'] || keysPressed.current['ARROWLEFT']) {
        moveDir.x -= MOVE_SPEED
      }
      if (keysPressed.current['D'] || keysPressed.current['ARROWRIGHT']) {
        moveDir.x += MOVE_SPEED
      }

      // Update rotation based on movement
      if (moveDir.x !== 0 || moveDir.z !== 0) {
        newState.rotation = Math.atan2(moveDir.x, moveDir.z)
        newState.velocity.x += Math.sin(newState.rotation) * MOVE_SPEED
        newState.velocity.z += Math.cos(newState.rotation) * MOVE_SPEED
        newState.energy = Math.max(0, newState.energy - ENERGY_DECAY_RATE)
      }

      // Handle jump
      if ((keysPressed.current[' '] || keysPressed.current['W']) && !newState.isJumping && newState.position.y < 0.1) {
        newState.velocity.y = JUMP_FORCE
        newState.isJumping = true
        newState.energy = Math.max(0, newState.energy - 5)
      }

      // Apply physics
      newState = applyPhysics(newState, 0.016)

      // Check collisions
      const { collected } = checkCollisions(
        newState.position,
        collectibles,
        newState.isHeadbutting
      )

      if (collected.length > 0) {
        setCollectibles((prev) =>
          prev.map((c) =>
            collected.some((col) => col.id === c.id) ? { ...c, collected: true } : c
          )
        )
        newState.score += collected.length * 50
        newState.energy = Math.min(MAX_ENERGY, newState.energy + 20)
      }

      // Natural energy regeneration when moving slowly
      if (
        Math.sqrt(newState.velocity.x ** 2 + newState.velocity.z ** 2) < 0.1 &&
        newState.energy < MAX_ENERGY
      ) {
        newState.energy = Math.min(MAX_ENERGY, newState.energy + 0.5)
      }

      return newState
    })

    // Update game stats
    const elapsed = Date.now() - startTime
    setGameStats((prev) => ({
      ...prev,
      score: goatState.score,
      health: goatState.health,
      energy: goatState.energy,
      timeElapsed: elapsed,
      objectsInteracted: collectibles.filter((c) => c.collected).length,
    }))
  })

  useEffect(() => {
    onStatsUpdate(gameStats)
  }, [gameStats, onStatsUpdate])

  return (
    <>
      <group ref={groupRef}>
        <Goat state={goatState} isHeadbutting={goatState.isHeadbutting} />
        <Scene
          collectibles={collectibles}
          goatPos={{ x: goatState.position.x, z: goatState.position.z }}
        />
      </group>
    </>
  )
}
