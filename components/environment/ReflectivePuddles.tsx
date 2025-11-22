'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface ReflectivePuddlesProps {
  bass: number
  mids: number
  theme?: ColorTheme
}

export default function ReflectivePuddles({
  bass,
  mids,
  theme
}: ReflectivePuddlesProps) {
  const puddlesRef = useRef<THREE.Group>(null)
  const rippleRef = useRef<THREE.Mesh>(null)

  // Generate puddle positions
  const puddleData = useMemo(() => {
    const puddles = []
    const count = 15

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
      const radius = 30 + Math.random() * 25
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const size = 1.5 + Math.random() * 3
      const rotation = Math.random() * Math.PI

      puddles.push({
        position: new THREE.Vector3(x, 0.02, z),
        size,
        rotation
      })
    }

    return puddles
  }, [])

  // Animate puddles
  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (rippleRef.current) {
      // Create ripple effect on bass hits
      const rippleScale = 1 + bass * 0.3 + Math.sin(time * 4) * 0.1
      rippleRef.current.scale.set(rippleScale, 1, rippleScale)

      const rippleMat = rippleRef.current.material as THREE.MeshStandardMaterial
      rippleMat.opacity = 0.15 + bass * 0.15
      rippleMat.emissiveIntensity = 0.3 + mids * 0.4
    }
  })

  const puddleColor = theme?.colors.primary || '#00ffff'

  return (
    <group ref={puddlesRef}>
      {/* Individual puddles */}
      {puddleData.map((puddle, i) => (
        <mesh
          key={i}
          position={puddle.position}
          rotation={[-Math.PI / 2, puddle.rotation, 0]}
        >
          <circleGeometry args={[puddle.size, 32]} />
          <meshStandardMaterial
            color="#0a0a1a"
            emissive={puddleColor}
            emissiveIntensity={0.2}
            roughness={0.05}
            metalness={0.95}
            transparent
            opacity={0.4}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}

      {/* Central animated ripple puddle */}
      <mesh
        ref={rippleRef}
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[4, 8, 32]} />
        <meshStandardMaterial
          color={puddleColor}
          emissive={puddleColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Puddle reflections - simple glow points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={30}
            array={new Float32Array(
              Array.from({ length: 90 }, (_, i) => {
                const angle = (i / 30) * Math.PI * 2
                const radius = 35 + (i % 3) * 8
                if (i % 3 === 0) return Math.cos(angle) * radius
                if (i % 3 === 1) return 0.05
                return Math.sin(angle) * radius
              })
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.8}
          color={puddleColor}
          transparent
          opacity={0.4}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Rain impact particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={20}
            array={new Float32Array(
              Array.from({ length: 60 }, (_, i) => {
                const angle = Math.random() * Math.PI * 2
                const radius = Math.random() * 40
                if (i % 3 === 0) return Math.cos(angle) * radius
                if (i % 3 === 1) return 0.1 + Math.random() * 0.2
                return Math.sin(angle) * radius
              })
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.3}
          color="#ffffff"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </group>
  )
}
