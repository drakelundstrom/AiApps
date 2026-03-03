import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  DRAGON_ACTIVE_FLIGHT_SECONDS,
  DRAGON_LIFETIME_SECONDS,
} from '../constants/dragonConfig'
import type { EasternDragonProps } from '../interfaces'

export function EasternDragon({ dragon }: EasternDragonProps) {
  const groupRef = useRef<THREE.Group | null>(null)
  const bodyRefs = useRef<Array<THREE.Mesh | null>>([])
  const segmentIndices = useMemo(() => Array.from({ length: 15 }, (_, i) => i), [])

  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return

    const age = clock.elapsedTime - dragon.spawnTime
    if (age < 0) return

    const orbitAngle = dragon.angleOffset + age * dragon.orbitSpeed * dragon.direction
    const radius = dragon.orbitRadius + Math.sin(age * 0.65 + dragon.wavePhase) * 1.3
    let x = Math.cos(orbitAngle) * radius
    let z = Math.sin(orbitAngle) * radius * 0.8
    let y = dragon.altitude + Math.sin(age * 1.8 + dragon.wavePhase) * 0.9

    let scale = dragon.scale
    if (age > DRAGON_ACTIVE_FLIGHT_SECONDS) {
      const awayT = Math.min(
        1,
        (age - DRAGON_ACTIVE_FLIGHT_SECONDS)
        / (DRAGON_LIFETIME_SECONDS - DRAGON_ACTIVE_FLIGHT_SECONDS),
      )
      x += Math.cos(dragon.flyAwayHeading) * awayT * 20
      z += Math.sin(dragon.flyAwayHeading) * awayT * 20
      y += awayT * 10
      scale = dragon.scale * (1 - awayT * 0.25)
    }

    group.position.set(x, y, z)
    group.rotation.y = -orbitAngle + Math.PI / 2
    group.rotation.z = Math.sin(age * 2.2 + dragon.wavePhase) * 0.12
    group.scale.setScalar(scale)

    bodyRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      mesh.position.y = Math.sin(age * 7 - i * 0.6 + dragon.wavePhase) * 0.07
      mesh.position.z = Math.cos(age * 4.5 - i * 0.35 + dragon.wavePhase) * 0.04
    })
  })

  return (
    <group ref={groupRef}>
      {segmentIndices.map((i) => {
        const radius = Math.max(0.08, 0.34 - i * 0.014)
        const x = -i * 0.34
        return (
          <group key={`segment-${dragon.id}-${i}`}>
            <mesh
              ref={(mesh) => {
                bodyRefs.current[i] = mesh
              }}
              position={[x, 0, 0]}
            >
              <sphereGeometry args={[radius, 14, 12]} />
              <meshStandardMaterial
                color={dragon.color}
                roughness={0.35}
                metalness={0.1}
                emissive={dragon.accentColor}
                emissiveIntensity={0.08}
              />
            </mesh>

            {i > 1 && i < 12 && i % 2 === 0 && (
              <mesh position={[x, radius * 1.25, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[radius * 0.33, radius * 0.9, 4]} />
                <meshStandardMaterial color={dragon.accentColor} roughness={0.45} />
              </mesh>
            )}
          </group>
        )
      })}

      <group position={[0.28, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.34, 16, 14]} />
          <meshStandardMaterial color={dragon.color} roughness={0.35} metalness={0.1} />
        </mesh>

        <mesh position={[0.38, -0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.15, 0.5, 10]} />
          <meshStandardMaterial color={dragon.color} roughness={0.35} metalness={0.1} />
        </mesh>

        <mesh position={[0.1, 0.2, 0.16]} rotation={[0.2, 0.2, 0.25]}>
          <coneGeometry args={[0.06, 0.24, 6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        <mesh position={[0.1, 0.2, -0.16]} rotation={[-0.2, 0.2, 0.25]}>
          <coneGeometry args={[0.06, 0.24, 6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>

        <mesh position={[0.22, 0.06, 0.13]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color="#111827" emissive="#f8fafc" emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[0.22, 0.06, -0.13]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color="#111827" emissive="#f8fafc" emissiveIntensity={0.15} />
        </mesh>

        <mesh position={[0.48, -0.04, 0.1]} rotation={[0.02, 0, -0.9]}>
          <cylinderGeometry args={[0.012, 0.014, 0.48, 6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.45} />
        </mesh>
        <mesh position={[0.48, -0.04, -0.1]} rotation={[-0.02, 0, -0.9]}>
          <cylinderGeometry args={[0.012, 0.014, 0.48, 6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.45} />
        </mesh>
      </group>
    </group>
  )
}
