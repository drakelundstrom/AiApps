import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  DRAGON_CIRCLE_COUNT,
  DRAGON_CIRCLE_PHASE_SECONDS,
  DRAGON_ENTER_DURATION_SECONDS,
  DRAGON_EXIT_DURATION_SECONDS,
  DRAGON_LIFETIME_SECONDS,
} from '../constants/dragonConfig'
import type { DragonInstance, EasternDragonProps } from '../interfaces'

function getDragonPositionAtAge(age: number, dragon: DragonInstance): THREE.Vector3 {
  const time = Math.max(0, Math.min(age, DRAGON_LIFETIME_SECONDS))
  const circleStartX = dragon.pathCenterX + dragon.circleRadius
  const circleStartZ = dragon.pathCenterZ
  let x = circleStartX
  let z = circleStartZ

  if (time < DRAGON_ENTER_DURATION_SECONDS) {
    const enterT = time / DRAGON_ENTER_DURATION_SECONDS
    x = THREE.MathUtils.lerp(dragon.entryX, circleStartX, enterT)
    z = THREE.MathUtils.lerp(dragon.entryZ, circleStartZ, enterT)
  } else if (time < DRAGON_ENTER_DURATION_SECONDS + DRAGON_CIRCLE_PHASE_SECONDS) {
    const circleTime = time - DRAGON_ENTER_DURATION_SECONDS
    const loopProgress = circleTime / DRAGON_CIRCLE_PHASE_SECONDS
    const angle = loopProgress * Math.PI * 2 * DRAGON_CIRCLE_COUNT * dragon.circleDirection
    x = dragon.pathCenterX + Math.cos(angle) * dragon.circleRadius
    z = dragon.pathCenterZ + Math.sin(angle) * dragon.circleRadius * 0.75
  } else {
    const exitStartTime = DRAGON_ENTER_DURATION_SECONDS + DRAGON_CIRCLE_PHASE_SECONDS
    const exitT = Math.min(1, (time - exitStartTime) / DRAGON_EXIT_DURATION_SECONDS)
    x = THREE.MathUtils.lerp(circleStartX, dragon.exitX, exitT)
    z = THREE.MathUtils.lerp(circleStartZ, dragon.exitZ, exitT)
  }

  let y = dragon.altitude + Math.sin(time * 1.8 + dragon.wavePhase) * 0.9
  if (time > DRAGON_ENTER_DURATION_SECONDS + DRAGON_CIRCLE_PHASE_SECONDS) {
    const exitStartTime = DRAGON_ENTER_DURATION_SECONDS + DRAGON_CIRCLE_PHASE_SECONDS
    const exitT = Math.min(1, (time - exitStartTime) / DRAGON_EXIT_DURATION_SECONDS)
    y += exitT * 3.2
  }

  return new THREE.Vector3(x, y, z)
}

export function EasternDragon({ dragon }: EasternDragonProps) {
  const groupRef = useRef<THREE.Group | null>(null)
  const bodyRefs = useRef<Array<THREE.Mesh | null>>([])
  const segmentIndices = useMemo(() => Array.from({ length: 15 }, (_, i) => i), [])
  const mustacheGeometries = useMemo(() => {
    const makeCurve = (yOffset: number, zSign: 1 | -1) => new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.45, yOffset, 0.08 * zSign),
      new THREE.Vector3(0.75, yOffset + 0.05, 0.2 * zSign),
      new THREE.Vector3(1.05, yOffset + 0.11, 0.32 * zSign),
      new THREE.Vector3(1.25, yOffset + 0.18, 0.46 * zSign),
    ])

    return [
      new THREE.TubeGeometry(makeCurve(0.02, 1), 20, 0.014, 8, false),
      new THREE.TubeGeometry(makeCurve(-0.07, 1), 20, 0.013, 8, false),
      new THREE.TubeGeometry(makeCurve(0.02, -1), 20, 0.014, 8, false),
      new THREE.TubeGeometry(makeCurve(-0.07, -1), 20, 0.013, 8, false),
    ]
  }, [])

  useEffect(() => {
    return () => {
      mustacheGeometries.forEach((geometry) => geometry.dispose())
    }
  }, [mustacheGeometries])

  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return

    const age = clock.elapsedTime - dragon.spawnTime
    if (age < 0) return

    const currentPos = getDragonPositionAtAge(age, dragon)
    const nextPos = getDragonPositionAtAge(age + 0.08, dragon)
    const dx = nextPos.x - currentPos.x
    const dz = nextPos.z - currentPos.z

    group.position.copy(currentPos)
    if (Math.abs(dx) + Math.abs(dz) > 0.0001) {
      group.rotation.y = Math.atan2(-dz, dx)
    }
    group.rotation.z = Math.sin(age * 2.2 + dragon.wavePhase) * 0.12

    const exitStartTime = DRAGON_ENTER_DURATION_SECONDS + DRAGON_CIRCLE_PHASE_SECONDS
    const exitT = age > exitStartTime
      ? Math.min(1, (age - exitStartTime) / DRAGON_EXIT_DURATION_SECONDS)
      : 0
    group.scale.setScalar(dragon.scale * (1 - exitT * 0.2))

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

        <mesh position={[0.22, 0.08, 0.15]}>
          <sphereGeometry args={[0.085, 14, 14]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0.22, 0.08, -0.15]}>
          <sphereGeometry args={[0.085, 14, 14]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.25} />
        </mesh>

        <mesh position={[0.29, 0.08, 0.15]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={dragon.accentColor} emissive={dragon.accentColor} emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0.29, 0.08, -0.15]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={dragon.accentColor} emissive={dragon.accentColor} emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0.33, 0.08, 0.15]}>
          <sphereGeometry args={[0.02, 10, 10]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        <mesh position={[0.33, 0.08, -0.15]}>
          <sphereGeometry args={[0.02, 10, 10]} />
          <meshStandardMaterial color="#020617" />
        </mesh>

        {mustacheGeometries.map((geometry, index) => (
          <mesh key={`mustache-${dragon.id}-${index}`} geometry={geometry}>
            <meshStandardMaterial
              color="#f8fafc"
              emissive={dragon.accentColor}
              emissiveIntensity={0.15}
              roughness={0.35}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
