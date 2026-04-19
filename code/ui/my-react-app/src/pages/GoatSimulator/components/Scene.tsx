import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { OBSTACLES, TERRAIN_SIZE } from '../constants/gameSettings'
import { GameObject } from '../interfaces'

interface SceneProps {
  collectibles: GameObject[]
  goatPos: { x: number; z: number }
}

export function Scene({ collectibles, goatPos }: SceneProps) {
  const groupRef = useRef<Group>(null)

  useFrame(({ camera }) => {
    // Camera follows goat
    camera.position.x = goatPos.x + 10
    camera.position.y = 8
    camera.position.z = goatPos.z + 10
    camera.lookAt(goatPos.x, 0, goatPos.z)
  })

  return (
    <group ref={groupRef}>
      {/* Ground */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE]} />
        <meshStandardMaterial color={0x2d5016} />
      </mesh>

      {/* Grass base */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <boxGeometry args={[TERRAIN_SIZE, 0.5, TERRAIN_SIZE]} />
        <meshStandardMaterial color={0x1a3a0a} />
      </mesh>

      {/* Obstacles */}
      {OBSTACLES.map((obs, idx) => (
        <mesh
          key={`obstacle-${idx}`}
          position={[obs.x - 50, obs.size / 2, obs.z - 50]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[obs.size, obs.size, obs.size]} />
          <meshStandardMaterial color={0x8b6914} />
        </mesh>
      ))}

      {/* Collectibles */}
      {collectibles.map((item) => (
        !item.collected && (
          <mesh
            key={`collectible-${item.id}`}
            position={[item.position.x, item.position.y + 0.5, item.position.z]}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial
              color={0xffd700}
              emissive={0xffaa00}
              emissiveIntensity={0.5}
            />
          </mesh>
        )
      ))}

      {/* Boundary walls */}
      {/* North wall */}
      <mesh position={[0, 2, -50]} castShadow receiveShadow>
        <boxGeometry args={[TERRAIN_SIZE, 4, 2]} />
        <meshStandardMaterial color={0x654321} />
      </mesh>

      {/* South wall */}
      <mesh position={[0, 2, 50]} castShadow receiveShadow>
        <boxGeometry args={[TERRAIN_SIZE, 4, 2]} />
        <meshStandardMaterial color={0x654321} />
      </mesh>

      {/* East wall */}
      <mesh position={[50, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 4, TERRAIN_SIZE]} />
        <meshStandardMaterial color={0x654321} />
      </mesh>

      {/* West wall */}
      <mesh position={[-50, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 4, TERRAIN_SIZE]} />
        <meshStandardMaterial color={0x654321} />
      </mesh>

      {/* Decorative trees */}
      {[
        [20, 20],
        [-30, 35],
        [40, -30],
        [-40, -25],
        [15, -40],
        [-25, 10],
      ].map((pos, idx) => (
        <group key={`tree-${idx}`} position={[pos[0] - 50, 0, pos[1] - 50]}>
          {/* Tree trunk */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
            <meshStandardMaterial color={0x8b4513} />
          </mesh>
          {/* Tree foliage */}
          <mesh position={[0, 3, 0]} castShadow receiveShadow>
            <sphereGeometry args={[2, 8, 8]} />
            <meshStandardMaterial color={0x228b22} />
          </mesh>
        </group>
      ))}

      {/* Sky */}
      <mesh position={[0, 40, 0]}>
        <sphereGeometry args={[200, 32, 32]} />
        <meshStandardMaterial color={0x87ceeb} side={1} />
      </mesh>
    </group>
  )
}
