'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface MarketStallsProps {
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  theme?: ColorTheme
}

interface StallRefs {
  signRef: React.RefObject<THREE.Mesh | null>
  displayRef: React.RefObject<THREE.Mesh | null>
  awningRef: React.RefObject<THREE.Mesh | null>
  pulsePhase: number
}

function MarketStall({
  position,
  rotation,
  color,
  stallType,
  onMount
}: {
  position: THREE.Vector3
  rotation: number
  color: THREE.Color
  stallType: 'food' | 'tech' | 'clothing' | 'noodles'
  onMount: (refs: StallRefs) => void
}) {
  const signRef = useRef<THREE.Mesh>(null)
  const displayRef = useRef<THREE.Mesh>(null)
  const awningRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (signRef.current && displayRef.current && awningRef.current) {
      onMount({
        signRef,
        displayRef,
        awningRef,
        pulsePhase: position.x + position.z
      })
    }
  }, [])

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Main stall structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 2, 1.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Counter */}
      <mesh position={[0, -0.3, 0.8]} castShadow>
        <boxGeometry args={[1.8, 0.1, 0.3]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Awning/canopy */}
      <mesh ref={awningRef} position={[0, 1.2, 0.3]}>
        <boxGeometry args={[2.2, 0.1, 1.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Neon sign above */}
      <mesh ref={signRef} position={[0, 1.5, 0]}>
        <boxGeometry args={[1.5, 0.3, 0.05]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Holographic display */}
      <mesh ref={displayRef} position={[0, 0.8, 0.76]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Type-specific items */}
      {stallType === 'food' && (
        <>
          {/* Steam particles above food stall */}
          <points position={[0, 1.5, 0]}>
            <bufferGeometry>
              <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([
                  -0.3, 0, 0,
                  0.3, 0, 0,
                  -0.2, 0.3, 0,
                  0.2, 0.3, 0,
                  -0.1, 0.6, 0,
                  0.1, 0.6, 0,
                  0, 0.9, 0,
                  0, 1.2, 0,
                ]), 3]}
          />
            </bufferGeometry>
            <pointsMaterial
              size={0.3}
              color="#ffffff"
              transparent
              opacity={0.4}
              sizeAttenuation
            />
          </points>
        </>
      )}

      {stallType === 'tech' && (
        <>
          {/* Floating holo-products */}
          <mesh position={[-0.4, 0.5, 0.9]}>
            <boxGeometry args={[0.2, 0.2, 0.1]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh position={[0.4, 0.5, 0.9]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
        </>
      )}

      {stallType === 'noodles' && (
        <>
          {/* Noodle bar stools */}
          <mesh position={[0.7, -0.6, 1.5]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[-0.7, -0.6, 1.5]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Lantern */}
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color="#ff8800"
              emissive="#ff8800"
              emissiveIntensity={1}
              toneMapped={false}
            />
          </mesh>
          <pointLight position={[0, 1.8, 0]} color="#ff8800" intensity={2} distance={5} />
        </>
      )}

      {/* Removed individual point lights for performance - relying on global lighting */}

      {/* Underlight strips */}
      <mesh position={[0, -0.9, 0.75]}>
        <boxGeometry args={[2, 0.05, 0.05]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function MarketStalls({
  bass,
  mids,
  highs,
  beatDetected,
  theme
}: MarketStallsProps) {
  const stallRefsArray = useRef<StallRefs[]>([])

  const stallData = useMemo(() => {
    const stalls = []
    const count = 8 // Optimized for performance
    const types: Array<'food' | 'tech' | 'clothing' | 'noodles'> = ['food', 'tech', 'clothing', 'noodles']

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 56 // Between street and buildings
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      const stallType = types[Math.floor(Math.random() * types.length)]

      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary),
          new THREE.Color(theme.colors.tertiary)
        ]
        color = colors[Math.floor(Math.random() * colors.length)]
      } else {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0080', '#ff8800']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      stalls.push({
        position: new THREE.Vector3(x, 0, z),
        rotation: angle + Math.PI, // Face inward toward center
        color,
        stallType
      })
    }

    return stalls
  }, [theme])

  const handleStallMount = (index: number) => (refs: StallRefs) => {
    stallRefsArray.current[index] = refs
  }

  // Single useFrame for all stalls
  useFrame((state) => {
    const time = state.clock.elapsedTime

    stallRefsArray.current.forEach((refs) => {
      if (!refs?.signRef.current || !refs.displayRef.current || !refs.awningRef.current) return

      // Sign flicker and pulse with music
      const signMat = refs.signRef.current.material as THREE.MeshStandardMaterial
      signMat.emissiveIntensity = 0.8 + Math.sin(time * 2 + refs.pulsePhase) * 0.2 + mids * 0.3

      // Holographic display scanlines and glitch
      const displayMat = refs.displayRef.current.material as THREE.MeshStandardMaterial
      displayMat.emissiveIntensity = 0.6 + Math.sin(time * 5 + refs.pulsePhase) * 0.2 + highs * 0.4
      displayMat.opacity = 0.7 + Math.sin(time * 3) * 0.1

      // Awning glow with bass
      const awningMat = refs.awningRef.current.material as THREE.MeshStandardMaterial
      awningMat.emissiveIntensity = 0.3 + bass * 0.4

      // Beat reaction - awning bounce
      if (beatDetected) {
        refs.awningRef.current.position.y = 1.2 + 0.1
        refs.signRef.current.position.y = 1.5 + 0.15
      } else {
        refs.awningRef.current.position.y = 1.2
        refs.signRef.current.position.y = 1.5
      }
    })
  })

  return (
    <group>
      {stallData.map((stall, i) => (
        <MarketStall
          key={i}
          position={stall.position}
          rotation={stall.rotation}
          color={stall.color}
          stallType={stall.stallType}
          onMount={handleStallMount(i)}
        />
      ))}
    </group>
  )
}
