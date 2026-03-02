import { useState, useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import * as THREE from 'three'

/* ───────── sakura petal particle system ───────── */

function SakuraPetals({ count = 300 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 30,
        y: Math.random() * 15 + 2,
        z: (Math.random() - 0.5) * 30,
        speedY: 0.005 + Math.random() * 0.015,
        drift: (Math.random() - 0.5) * 0.02,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: 0.01 + Math.random() * 0.03,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
        scale: 0.06 + Math.random() * 0.08,
      })
    }
    return arr
  }, [count])

  useFrame(() => {
    if (!meshRef.current) return
    particles.forEach((p, i) => {
      p.y -= p.speedY
      p.x += p.drift + Math.sin(p.wobble) * 0.005
      p.z += Math.cos(p.wobble) * 0.003
      p.spin += p.spinSpeed
      p.wobble += p.wobbleSpeed

      if (p.y < -0.5) {
        p.y = Math.random() * 5 + 12
        p.x = (Math.random() - 0.5) * 30
        p.z = (Math.random() - 0.5) * 30
      }

      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(p.spin, p.spin * 0.5, p.spin * 0.3)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  const petalShape = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.bezierCurveTo(0.3, 0.3, 0.5, 0.8, 0, 1.2)
    shape.bezierCurveTo(-0.5, 0.8, -0.3, 0.3, 0, 0)
    return new THREE.ShapeGeometry(shape)
  }, [])

  return (
    <instancedMesh ref={meshRef} args={[petalShape, null, count]}>
      <meshStandardMaterial
        color="#ffb7c5"
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  )
}

/* ───────── sakura tree trunk + branches ───────── */

function SakuraTree({ position = [0, 0, 0], scale = 1 }) {
  const trunkColor = '#5c3a1e'
  const canopyColor = '#ff8faa'

  return (
    <group position={position} scale={scale}>
      {/* trunk */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 3, 8]} />
        <meshStandardMaterial color={trunkColor} />
      </mesh>
      {/* branch left */}
      <mesh position={[-0.6, 2.8, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.06, 0.1, 1.5, 6]} />
        <meshStandardMaterial color={trunkColor} />
      </mesh>
      {/* branch right */}
      <mesh position={[0.5, 2.9, 0.2]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.06, 0.1, 1.2, 6]} />
        <meshStandardMaterial color={trunkColor} />
      </mesh>
      {/* canopy clusters */}
      {[
        [0, 3.5, 0, 1.2],
        [-0.8, 3.2, 0.3, 0.8],
        [0.7, 3.4, -0.2, 0.7],
        [0, 3.9, 0.3, 0.6],
        [-0.3, 3.0, -0.5, 0.65],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color={canopyColor} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  )
}

/* ───────── stone lantern ───────── */

function StoneLantern({ position = [0, 0, 0] }) {
  const stone = '#8a8a7a'
  return (
    <group position={position}>
      {/* base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.3, 6]} />
        <meshStandardMaterial color={stone} />
      </mesh>
      {/* pillar */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.8, 6]} />
        <meshStandardMaterial color={stone} />
      </mesh>
      {/* lamp body */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.4]} />
        <meshStandardMaterial color={stone} />
      </mesh>
      {/* lamp glow */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.28, 0.2, 0.28]} />
        <meshStandardMaterial color="#ffdd88" emissive="#ffaa33" emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
      {/* roof */}
      <mesh position={[0, 1.55, 0]}>
        <coneGeometry args={[0.35, 0.3, 4]} />
        <meshStandardMaterial color={stone} />
      </mesh>
    </group>
  )
}

/* ───────── torii gate ───────── */

function ToriiGate({ position = [0, 0, 0] }) {
  const red = '#c41e1e'
  return (
    <group position={position}>
      {/* left pillar */}
      <mesh position={[-1, 1.5, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 3, 8]} />
        <meshStandardMaterial color={red} />
      </mesh>
      {/* right pillar */}
      <mesh position={[1, 1.5, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 3, 8]} />
        <meshStandardMaterial color={red} />
      </mesh>
      {/* top beam */}
      <mesh position={[0, 3.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 2.6, 8]} />
        <meshStandardMaterial color={red} />
      </mesh>
      {/* kasagi (top roof beam) */}
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[2.8, 0.15, 0.25]} />
        <meshStandardMaterial color={red} />
      </mesh>
    </group>
  )
}

/* ───────── stepping stones ───────── */

function SteppingStones() {
  const positions = [
    [0, 0.02, 1],
    [0.3, 0.02, 2],
    [-0.2, 0.02, 3],
    [0.1, 0.02, 4],
    [0.4, 0.02, 5],
  ]
  return (
    <group>
      {positions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, Math.random()]}>
          <circleGeometry args={[0.25 + Math.random() * 0.1, 8]} />
          <meshStandardMaterial color="#7a7a6e" />
        </mesh>
      ))}
    </group>
  )
}

/* ───────── koi pond ───────── */

function KoiPond({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* water surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial color="#3a7a8a" transparent opacity={0.6} />
      </mesh>
      {/* rim stones */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 2.1, 0.1, Math.sin(angle) * 2.1]}>
            <sphereGeometry args={[0.2, 6, 5]} />
            <meshStandardMaterial color="#6a6a5e" />
          </mesh>
        )
      })}
    </group>
  )
}

/* ───────── ground ───────── */

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#4a7a3a" />
    </mesh>
  )
}

/* ───────── zen gravel garden ───────── */

function ZenGravel({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#c2b99e" />
      </mesh>
      {/* decorative rocks */}
      <mesh position={[0.5, 0.2, -0.3]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color="#5a5a50" />
      </mesh>
      <mesh position={[-0.8, 0.15, 0.5]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color="#6a6a5e" />
      </mesh>
    </group>
  )
}

/* ───────── small bamboo clusters ───────── */

function BambooCluster({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {[0, 0.3, -0.3, 0.15, -0.15].map((offset, i) => (
        <group key={i}>
          <mesh position={[offset, 1.2 + Math.random() * 0.8, offset * 0.5]}>
            <cylinderGeometry args={[0.04, 0.05, 2.4 + Math.random(), 6]} />
            <meshStandardMaterial color="#3a6e2e" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ───────── scene composition ───────── */

function GardenScene({ showPetals }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[-4, 3, -3]} intensity={0.3} color="#ffccaa" />

      <Sky sunPosition={[100, 20, 100]} turbidity={1.5} rayleigh={0.5} />

      <Ground />

      {/* sakura trees */}
      <SakuraTree position={[-3, 0, -4]} scale={1.2} />
      <SakuraTree position={[4, 0, -3]} scale={1} />
      <SakuraTree position={[-5, 0, 2]} scale={0.9} />
      <SakuraTree position={[6, 0, -6]} scale={0.8} />

      {/* torii gate */}
      <ToriiGate position={[0, 0, -5]} />

      {/* koi pond */}
      <KoiPond position={[3, 0, 3]} />

      {/* stone lanterns */}
      <StoneLantern position={[-2, 0, 1]} />
      <StoneLantern position={[1.5, 0, -2]} />

      {/* stepping stones */}
      <SteppingStones />

      {/* zen gravel */}
      <ZenGravel position={[-5, 0, -6]} />

      {/* bamboo */}
      <BambooCluster position={[7, 0, 0]} />
      <BambooCluster position={[-7, 0, -2]} />

      {showPetals && <SakuraPetals count={400} />}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI / 2.05}
        minDistance={3}
        maxDistance={25}
        target={[0, 1.5, 0]}
      />
    </>
  )
}

/* ───────── exported component ───────── */

export default function JapaneseGarden() {
  const [showPetals, setShowPetals] = useState(true)

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#1a1a2e' }}>
      <Canvas
        camera={{ position: [8, 5, 10], fov: 55 }}
        style={{ width: '100%', height: '100%' }}
      >
        <GardenScene showPetals={showPetals} />
      </Canvas>

      <button
        onClick={() => setShowPetals((v) => !v)}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          padding: '10px 20px',
          borderRadius: 12,
          border: 'none',
          background: showPetals ? 'rgba(255,183,197,0.9)' : 'rgba(100,100,100,0.8)',
          color: showPetals ? '#5c1a2a' : '#eee',
          fontWeight: 'bold',
          fontSize: 14,
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          transition: 'all 0.3s ease',
          zIndex: 10,
        }}
      >
        {showPetals ? '🌸 Petals On' : '🌸 Petals Off'}
      </button>
    </div>
  )
}
