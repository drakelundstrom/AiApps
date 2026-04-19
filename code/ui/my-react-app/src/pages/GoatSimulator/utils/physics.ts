import { Vector3, GoatState, GameObject } from '../interfaces'
import { GRAVITY, GAME_CONFIG } from '../constants/gameSettings'

export function applyPhysics(state: GoatState, deltaTime: number): GoatState {
  const newState = { ...state }

  // Apply gravity
  newState.velocity.y -= GRAVITY * deltaTime

  // Apply velocity to position
  newState.position.x += newState.velocity.x * deltaTime
  newState.position.y += newState.velocity.y * deltaTime
  newState.position.z += newState.velocity.z * deltaTime

  // Ground collision
  if (newState.position.y <= 0) {
    newState.position.y = 0
    newState.velocity.y = 0
    newState.isJumping = false
  }

  // Boundary collision
  if (newState.position.x < -45) {
    newState.position.x = -45
    newState.velocity.x *= -0.5
  } else if (newState.position.x > 45) {
    newState.position.x = 45
    newState.velocity.x *= -0.5
  }

  if (newState.position.z < -45) {
    newState.position.z = -45
    newState.velocity.z *= -0.5
  } else if (newState.position.z > 45) {
    newState.position.z = 45
    newState.velocity.z *= -0.5
  }

  // Apply friction
  newState.velocity.x *= GAME_CONFIG.friction
  newState.velocity.z *= GAME_CONFIG.friction

  // Clamp velocity
  const speed = Math.sqrt(
    newState.velocity.x ** 2 + newState.velocity.z ** 2
  )
  if (speed > GAME_CONFIG.maxSpeed) {
    const scale = GAME_CONFIG.maxSpeed / speed
    newState.velocity.x *= scale
    newState.velocity.z *= scale
  }

  return newState
}

export function checkCollisions(
  goatPos: Vector3,
  objects: GameObject[],
  headbutting: boolean
): { collected: GameObject[]; damaged: GameObject[] } {
  const collected: GameObject[] = []
  const damaged: GameObject[] = []

  for (const obj of objects) {
    const dx = goatPos.x - obj.position.x
    const dz = goatPos.z - obj.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (obj.type === 'collectible' && dist < 3 && !obj.collected) {
      collected.push(obj)
    } else if (obj.type === 'obstacle') {
      if (dist < 5) {
        if (headbutting && dist < GAME_CONFIG.headbuttRange) {
          damaged.push(obj)
        }
      }
    }
  }

  return { collected, damaged }
}

export function getTerrainHeight(x: number, z: number): number {
  const gridX = Math.floor(x + 50)
  const gridZ = Math.floor(z + 50)

  if (gridX < 0 || gridX >= 100 || gridZ < 0 || gridZ >= 100) {
    return 0
  }

  const idx = gridZ * 100 + gridX
  return 0 // Return flat terrain for simplicity; could be enhanced with actual heightmap
}

export function calculateScore(
  baseScore: number,
  objectsInteracted: number,
  timeBonus: number
): number {
  return Math.floor(baseScore + objectsInteracted * 10 + timeBonus)
}

export function getHeadbuttDirection(rotation: number): Vector3 {
  return {
    x: Math.sin(rotation) * GAME_CONFIG.headbuttForce,
    y: 0.3,
    z: Math.cos(rotation) * GAME_CONFIG.headbuttForce,
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function dist3D(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}
