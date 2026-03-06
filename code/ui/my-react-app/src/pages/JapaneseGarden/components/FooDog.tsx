import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  DRAGON_CIRCLE_COUNT,
  DRAGON_CIRCLE_PHASE_SECONDS,
  DRAGON_ENTER_DURATION_SECONDS,
  DRAGON_EXIT_DURATION_SECONDS,
  DRAGON_LIFETIME_SECONDS,
} from '../constants/dragonConfig'
import type { DragonInstance, ParticleTrail } from '../interfaces'

function getFooDogPositionAtAge(age: number, fooDog: DragonInstance): THREE.Vector3 {
  const time = Math.max(0, Math.min(age, DRAGON_LIFETIME_SECONDS))
  const circleStartX = fooDog.pathCenterX + fooDog.circleRadius
  const circleStartZ = fooDog.pathCenterZ
  let x = circleStartX
  let z = circleStartZ

  if (time < DRAGON_ENTER_DURATION_SECONDS) {
    const enterT = time / DRAGON_ENTER_DURATION_SECONDS
    x = THREE.MathUtils.lerp(fooDog.entryX, circleStartX, enterT)
    z = THREE.MathUtils.lerp(fooDog.entryZ, circleStartZ, enterT)
  } else if (time < DRAGON_ENTER_DURATION_SECONDS + DRAGON_CIRCLE_PHASE_SECONDS) {
    const circleTime = time - DRAGON_ENTER_DURATION_SECONDS
    const loopProgress = circleTime / DRAGON_CIRCLE_PHASE_SECONDS
    const angle = loopProgress * Math.PI * 2 * DRAGON_CIRCLE_COUNT * fooDog.circleDirection
    x = fooDog.pathCenterX + Math.cos(angle) * fooDog.circleRadius
    z = fooDog.pathCenterZ + Math.sin(angle) * fooDog.circleRadius * 0.75
  } else {
    const exitStartTime = DRAGON_ENTER_DURATION_SECONDS + DRAGON_CIRCLE_PHASE_SECONDS
    const exitT = Math.min(1, (time - exitStartTime) / DRAGON_EXIT_DURATION_SECONDS)
    x = THREE.MathUtils.lerp(circleStartX, fooDog.exitX, exitT)
    z = THREE.MathUtils.lerp(circleStartZ, fooDog.exitZ, exitT)
  }

  let y = fooDog.altitude + Math.sin(time * 2.5 + fooDog.wavePhase) * 0.6
  if (time > DRAGON_ENTER_DURATION_SECONDS + DRAGON_CIRCLE_PHASE_SECONDS) {
    const exitStartTime = DRAGON_ENTER_DURATION_SECONDS + DRAGON_CIRCLE_PHASE_SECONDS
    const exitT = Math.min(1, (time - exitStartTime) / DRAGON_EXIT_DURATION_SECONDS)
    y += exitT * 3.2
  }

  return new THREE.Vector3(x, y, z)
}

export function FooDog({ dragon }: { dragon: DragonInstance }) {
  const groupRef = useRef<THREE.Group | null>(null)
  const particleTrails = useRef<ParticleTrail[]>([])
  const trailMeshRef = useRef<THREE.InstancedMesh | null>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const cloudRefs = useRef<Array<THREE.Mesh | null>>([])

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (!group) return

    const age = clock.elapsedTime - dragon.spawnTime
    if (age < 0) return

    const currentPos = getFooDogPositionAtAge(age, dragon)
    const nextPos = getFooDogPositionAtAge(age + 0.08, dragon)
    const dx = nextPos.x - currentPos.x
    const dz = nextPos.z - currentPos.z

    group.position.copy(currentPos)
    if (Math.abs(dx) + Math.abs(dz) > 0.0001) {
      group.rotation.y = Math.atan2(-dz, dx)
    }
    group.rotation.z = Math.sin(age * 1.8 + dragon.wavePhase) * 0.08
    group.rotation.x = Math.sin(age * 1.5 + dragon.wavePhase) * 0.05

    const exitStartTime = DRAGON_ENTER_DURATION_SECONDS + DRAGON_CIRCLE_PHASE_SECONDS
    const exitT = age > exitStartTime
      ? Math.min(1, (age - exitStartTime) / DRAGON_EXIT_DURATION_SECONDS)
      : 0
    group.scale.setScalar(dragon.scale * (1 - exitT * 0.2))

    // Animate cloud puffs
    cloudRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      mesh.rotation.z = age * (0.5 + i * 0.2)
      mesh.scale.setScalar(1 + Math.sin(age * 3 + i) * 0.15)
    })

    // Update particle trails - flame/energy effects
    const tailWorldPos = new THREE.Vector3(-0.8, -0.2, 0)
    tailWorldPos.applyMatrix4(group.matrixWorld)

    if (Math.random() < 0.8) {
      particleTrails.current.push({
        position: tailWorldPos.clone(),
        age: 0,
        maxAge: 0.8 + Math.random() * 0.6,
        size: 0.2 + Math.random() * 0.15,
      })
    }

    particleTrails.current = particleTrails.current.filter((p) => {
      p.age += delta
      return p.age < p.maxAge
    })

    const trailMesh = trailMeshRef.current
    if (trailMesh) {
      particleTrails.current.forEach((p, i) => {
        const life = p.age / p.maxAge
        const scale = p.size * (1 - life) * dragon.scale
        dummy.position.copy(p.position)
        dummy.position.y += life * 0.5
        dummy.scale.setScalar(scale)
        dummy.updateMatrix()
        trailMesh.setMatrixAt(i, dummy.matrix)
      })
      for (let i = particleTrails.current.length; i < 100; i++) {
        dummy.position.set(0, -1000, 0)
        dummy.scale.setScalar(0.001)
        dummy.updateMatrix()
        trailMesh.setMatrixAt(i, dummy.matrix)
      }
      trailMesh.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      {/* Fire/energy trail particles */}
      <instancedMesh ref={trailMeshRef} args={[undefined, undefined, 100]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={1.2}
          transparent
          opacity={0.7}
        />
      </instancedMesh>

      {/* Aura glow */}
      <pointLight
        color={dragon.accentColor}
        intensity={1.2}
        distance={5}
        decay={2}
      />

      {/* Body - compact lion-like */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.45, 16, 14]} />
        <meshStandardMaterial
          color={dragon.color}
          roughness={0.4}
          metalness={0.2}
          emissive={dragon.accentColor}
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Curly fur balls on body */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 0.4
        return (
          <mesh
            key={`fur-${i}`}
            position={[
              Math.cos(angle) * radius * 0.6 - 0.1,
              Math.sin(angle) * radius * 0.8,
              Math.cos(angle + 1) * radius * 0.5,
            ]}
          >
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial
              color={dragon.color}
              roughness={0.6}
              emissive={dragon.accentColor}
              emissiveIntensity={0.08}
            />
          </mesh>
        )
      })}

      {/* Head */}
      <mesh position={[0.5, 0.15, 0]}>
        <sphereGeometry args={[0.35, 16, 14]} />
        <meshStandardMaterial
          color={dragon.color}
          roughness={0.3}
          metalness={0.2}
          emissive={dragon.accentColor}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Snout */}
      <mesh position={[0.75, 0, 0]}>
        <boxGeometry args={[0.25, 0.2, 0.25]} />
        <meshStandardMaterial
          color={dragon.color}
          roughness={0.4}
        />
      </mesh>

      {/* Fierce eyes */}
      <mesh position={[0.62, 0.25, 0.15]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fbbf24"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0.62, 0.25, -0.15]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fbbf24"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Eye glow */}
      <pointLight
        position={[0.7, 0.25, 0.15]}
        color="#fbbf24"
        intensity={0.4}
        distance={1}
      />
      <pointLight
        position={[0.7, 0.25, -0.15]}
        color="#fbbf24"
        intensity={0.4}
        distance={1}
      />

      {/* Pupils */}
      <mesh position={[0.68, 0.25, 0.15]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.68, 0.25, -0.15]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
      </mesh>

      {/* Ears */}
      <mesh position={[0.4, 0.5, 0.25]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.12, 0.25, 8]} />
        <meshStandardMaterial color={dragon.color} roughness={0.4} />
      </mesh>
      <mesh position={[0.4, 0.5, -0.25]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.12, 0.25, 8]} />
        <meshStandardMaterial color={dragon.color} roughness={0.4} />
      </mesh>

      {/* Curly mane - multiple spheres */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 1.6 - 0.5
        const radius = 0.42
        return (
          <mesh
            key={`mane-${i}`}
            ref={(mesh) => {
              cloudRefs.current[i] = mesh
            }}
            position={[
              0.3 + Math.cos(angle) * radius * 0.4,
              0.3 + Math.sin(angle) * radius,
              (i % 2 === 0 ? 1 : -1) * 0.15,
            ]}
          >
            <sphereGeometry args={[0.15 + (i % 3) * 0.03, 8, 8]} />
            <meshStandardMaterial
              color={dragon.accentColor}
              roughness={0.5}
              emissive={dragon.accentColor}
              emissiveIntensity={0.3}
            />
          </mesh>
        )
      })}

      {/* Tail curled up */}
      <mesh position={[-0.6, 0.2, 0]} rotation={[0, 0, 0.5]}>
        <torusGeometry args={[0.25, 0.08, 8, 12, Math.PI * 1.5]} />
        <meshStandardMaterial
          color={dragon.color}
          roughness={0.4}
          emissive={dragon.accentColor}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Tail puff */}
      <mesh position={[-0.55, 0.55, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial
          color={dragon.accentColor}
          roughness={0.6}
          emissive={dragon.accentColor}
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Magical cloud puffs under feet */}
      {[
        [0.3, -0.4, 0.2],
        [0.3, -0.4, -0.2],
        [-0.1, -0.45, 0.2],
        [-0.1, -0.45, -0.2],
      ].map(([x, y, z], i) => (
        <mesh
          key={`cloud-${i}`}
          position={[x, y, z]}
          ref={(mesh) => {
            cloudRefs.current[12 + i] = mesh
          }}
        >
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial
            color="#f8fafc"
            emissive="#e0e7ff"
            emissiveIntensity={0.4}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}
