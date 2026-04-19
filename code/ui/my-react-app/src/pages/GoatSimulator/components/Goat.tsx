import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { GOAT_COLORS } from '../constants/gameSettings'
import { GoatState } from '../interfaces'

interface GoatProps {
  state: GoatState
  isHeadbutting: boolean
}

export function Goat({ state, isHeadbutting }: GoatProps) {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(state.position.x, state.position.y, state.position.z)
      groupRef.current.rotation.y = state.rotation
    }
  })

  return (
    <group ref={groupRef} position={[state.position.x, state.position.y, state.position.z]}>
      {/* Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 1, 1.5]} />
        <meshStandardMaterial color={GOAT_COLORS.body} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.5, 0.9]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={GOAT_COLORS.body} />
      </mesh>

      {/* Left Horn */}
      <mesh position={[-0.25, 1, 0.9]} castShadow receiveShadow rotation={[0.2, 0, -0.3]}>
        <coneGeometry args={[0.1, 0.6, 8]} />
        <meshStandardMaterial color={GOAT_COLORS.horns} />
      </mesh>

      {/* Right Horn */}
      <mesh position={[0.25, 1, 0.9]} castShadow receiveShadow rotation={[0.2, 0, 0.3]}>
        <coneGeometry args={[0.1, 0.6, 8]} />
        <meshStandardMaterial color={GOAT_COLORS.horns} />
      </mesh>

      {/* Left Eye */}
      <mesh position={[-0.2, 0.7, 1.25]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={GOAT_COLORS.eyes} />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.2, 0.7, 1.25]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={GOAT_COLORS.eyes} />
      </mesh>

      {/* Beard */}
      <mesh position={[0, 0.3, 1.1]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.35, 0.3]} />
        <meshStandardMaterial color={GOAT_COLORS.beard} />
      </mesh>

      {/* Front Left Leg */}
      <mesh position={[-0.3, -0.4, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={GOAT_COLORS.body} />
      </mesh>

      {/* Front Right Leg */}
      <mesh position={[0.3, -0.4, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={GOAT_COLORS.body} />
      </mesh>

      {/* Back Left Leg */}
      <mesh position={[-0.3, -0.4, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={GOAT_COLORS.body} />
      </mesh>

      {/* Back Right Leg */}
      <mesh position={[0.3, -0.4, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={GOAT_COLORS.body} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.2, -0.8]} castShadow receiveShadow rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.2]} />
        <meshStandardMaterial color={GOAT_COLORS.body} />
      </mesh>

      {/* Front Left Hoof */}
      <mesh position={[-0.3, -1.3, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.2, 0.3]} />
        <meshStandardMaterial color={GOAT_COLORS.hooves} />
      </mesh>

      {/* Front Right Hoof */}
      <mesh position={[0.3, -1.3, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.2, 0.3]} />
        <meshStandardMaterial color={GOAT_COLORS.hooves} />
      </mesh>

      {/* Back Left Hoof */}
      <mesh position={[-0.3, -1.3, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.2, 0.3]} />
        <meshStandardMaterial color={GOAT_COLORS.hooves} />
      </mesh>

      {/* Back Right Hoof */}
      <mesh position={[0.3, -1.3, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.2, 0.3]} />
        <meshStandardMaterial color={GOAT_COLORS.hooves} />
      </mesh>

      {/* Headbutt indicator when active */}
      {isHeadbutting && (
        <mesh position={[0, 0.5, 1.2]} castShadow>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial
            color={0xff6b6b}
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  )
}
