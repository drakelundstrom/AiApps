export const GRAVITY = 0.015
export const JUMP_FORCE = 0.5
export const MOVE_SPEED = 0.3
export const MAX_ENERGY = 100
export const MAX_HEALTH = 100
export const ENERGY_DECAY_RATE = 0.05

export const TERRAIN_SIZE = 100
export const TERRAIN_HEIGHT_MAP = new Array(100 * 100).fill(0).map((_, i) => {
  const x = i % 100
  const z = Math.floor(i / 100)
  const dist = Math.sqrt((x - 50) ** 2 + (z - 50) ** 2)
  return Math.sin(dist * 0.1) * 3 + Math.cos(z * 0.05) * 2
})

export const OBSTACLES = [
  { x: 20, y: 0, z: 20, size: 5 },
  { x: 60, y: 0, z: 30, size: 4 },
  { x: 40, y: 0, z: 60, size: 6 },
  { x: 80, y: 0, z: 50, size: 5 },
  { x: 15, y: 0, z: 70, size: 4 },
  { x: 75, y: 0, z: 15, size: 5 },
]

export const COLLECTIBLES = [
  { x: 30, z: 40 },
  { x: 70, z: 60 },
  { x: 50, z: 20 },
  { x: 25, z: 75 },
  { x: 80, z: 75 },
  { x: 10, z: 50 },
  { x: 85, z: 30 },
  { x: 45, z: 85 },
]

export const GAME_CONFIG = {
  fov: 75,
  near: 0.1,
  far: 1000,
  maxSpeed: 0.5,
  friction: 0.95,
  headbuttCooldown: 500,
  headbuttForce: 1.5,
  headbuttRange: 15,
}

export const GOAT_COLORS = {
  body: 0xfaf3e0,
  horns: 0x3a3a3a,
  eyes: 0x000000,
  hooves: 0x453628,
  beard: 0xd4a574,
}
