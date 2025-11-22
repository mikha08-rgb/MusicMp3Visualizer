'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface TronHUDProps {
  bass: number
  mids: number
  theme?: ColorTheme
}

// Scanning rings that sweep outward from center
function ScanningRing({
  radius,
  speed,
  color,
  bass,
}: {
  radius: number
  speed: number
  color: string
  bass: number
}) {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ringRef.current) return

    const time = state.clock.elapsedTime

    // Pulse scale with bass
    const scale = radius + Math.sin(time * speed) * 5 + bass * 3
    ringRef.current.scale.setScalar(scale / radius)

    // Rotate slowly
    ringRef.current.rotation.z += 0.005

    // Fade in/out
    const material = ringRef.current.material as THREE.MeshStandardMaterial
    const pulse = Math.sin(time * speed) * 0.5 + 0.5
    material.opacity = pulse * 0.4 + 0.2
  })

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
      <ringGeometry args={[radius - 0.2, radius, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Grid coordinate markers
function CoordinateMarkers({ color }: { color: string }) {
  const markersRef = useRef<THREE.Group>(null)

  return (
    <group ref={markersRef}>
      {/* Create coordinate markers at key grid positions */}
      {[-50, -25, 0, 25, 50].map((x) =>
        [-50, -25, 0, 25, 50].map((z) => {
          // Skip center
          if (x === 0 && z === 0) return null

          return (
            <group key={`marker-${x}-${z}`} position={[x, 0.2, z]}>
              {/* Small glowing cube marker */}
              <mesh>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={1.5}
                  transparent
                  opacity={0.6}
                />
              </mesh>

              {/* Vertical line */}
              <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 4, 4]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={1}
                  transparent
                  opacity={0.3}
                />
              </mesh>
            </group>
          )
        })
      )}
    </group>
  )
}

// Status indicator rings orbiting the center
function StatusIndicator({
  radius,
  speed,
  offset,
  color,
}: {
  radius: number
  speed: number
  offset: number
  color: string
}) {
  const indicatorRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!indicatorRef.current) return

    const time = state.clock.elapsedTime
    const angle = time * speed + offset

    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    indicatorRef.current.position.set(x, 5, z)
    indicatorRef.current.rotation.y = angle
  })

  return (
    <group ref={indicatorRef}>
      {/* Glowing ring */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.5, 0.1, 8, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Center dot */}
      <mesh>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={4}
        />
      </mesh>
    </group>
  )
}

export default function TronHUD({ bass, mids, theme }: TronHUDProps) {
  const groupRef = useRef<THREE.Group>(null)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  return (
    <group ref={groupRef}>
      {/* Scanning rings at different radii */}
      <ScanningRing radius={20} speed={0.5} color={primaryColor} bass={bass} />
      <ScanningRing radius={30} speed={0.4} color={tertiaryColor} bass={bass} />
      <ScanningRing radius={40} speed={0.3} color={secondaryColor} bass={bass} />

      {/* Grid coordinate markers */}
      <CoordinateMarkers color={tertiaryColor} />

      {/* Orbiting status indicators */}
      <StatusIndicator
        radius={10}
        speed={0.5}
        offset={0}
        color={primaryColor}
      />
      <StatusIndicator
        radius={10}
        speed={0.5}
        offset={Math.PI}
        color={secondaryColor}
      />
      <StatusIndicator
        radius={10}
        speed={-0.6}
        offset={Math.PI / 2}
        color={tertiaryColor}
      />
    </group>
  )
}
