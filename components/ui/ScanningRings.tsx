'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface ScanningRingsProps {
  bass: number
  mids: number
  theme?: ColorTheme
}

export default function ScanningRings({ bass, mids, theme }: ScanningRingsProps) {
  const groupRef = useRef<THREE.Group>(null)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  // Ring configurations (different radii and speeds)
  const ringConfigs = useMemo(
    () => [
      { radius: 30, thickness: 0.15, speed: 0.3, color: primaryColor, height: 8 },
      { radius: 40, thickness: 0.2, speed: -0.2, color: tertiaryColor, height: 10 },
      { radius: 50, thickness: 0.12, speed: 0.15, color: secondaryColor, height: 12 },
    ],
    [primaryColor, secondaryColor, tertiaryColor]
  )

  return (
    <group ref={groupRef}>
      {ringConfigs.map((config, index) => (
        <ScanningRing
          key={index}
          radius={config.radius}
          thickness={config.thickness}
          speed={config.speed}
          color={config.color}
          height={config.height}
          bass={bass}
          mids={mids}
        />
      ))}
    </group>
  )
}

// Individual scanning ring
function ScanningRing({
  radius,
  thickness,
  speed,
  color,
  height,
  bass,
  mids,
}: {
  radius: number
  thickness: number
  speed: number
  color: string
  height: number
  bass: number
  mids: number
}) {
  const ringRef = useRef<THREE.Group>(null)
  const sweepRef = useRef<THREE.Mesh>(null)
  const markerRefs = useRef<THREE.Mesh[]>([])

  // Rotate ring
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += state.clock.getDelta() * speed
    }

    // Animate sweep highlight
    if (sweepRef.current) {
      const material = sweepRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 2 + bass * 3
    }

    // Pulse markers
    markerRefs.current.forEach((marker, index) => {
      if (marker) {
        const material = marker.material as THREE.MeshStandardMaterial
        const offset = index * 0.5
        material.emissiveIntensity = 2 + Math.sin(state.clock.elapsedTime * 2 + offset) * mids * 2
      }
    })
  })

  // Cardinal direction markers (N, E, S, W positions)
  const markerPositions = useMemo(() => {
    const positions: THREE.Vector3[] = []
    const angles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]

    angles.forEach((angle) => {
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      positions.push(new THREE.Vector3(x, 0, z))
    })

    return positions
  }, [radius])

  return (
    <group ref={ringRef} position={[0, height, 0]}>
      {/* Main ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - thickness, radius, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sweeping highlight segment (30 degrees) */}
      <mesh ref={sweepRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - thickness, radius, 64, 8, 0, Math.PI / 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Grid coordinate markers at cardinal points */}
      {markerPositions.map((pos, index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) markerRefs.current[index] = el
          }}
          position={[pos.x, 0, pos.z]}
        >
          <boxGeometry args={[0.3, 0.1, 0.3]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Small orbiting indicator */}
      <OrbitingIndicator radius={radius} color={color} bass={bass} />
    </group>
  )
}

// Small indicator that orbits the ring
function OrbitingIndicator({ radius, color, bass }: { radius: number; color: string; bass: number }) {
  const indicatorRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!indicatorRef.current) return

    const angle = state.clock.elapsedTime * 1.5
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    indicatorRef.current.position.set(x, 0, z)

    // Pulse with bass
    const scale = 1 + bass * 0.5
    indicatorRef.current.scale.setScalar(scale)

    const material = indicatorRef.current.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = 3 + bass * 2
  })

  return (
    <mesh ref={indicatorRef}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}
