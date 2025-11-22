'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface LightTrailsProps {
  bass: number
  mids: number
  theme?: ColorTheme
}

// Single light trail ribbon
function LightTrail({
  radius,
  height,
  speed,
  color,
  offset,
  bass,
}: {
  radius: number
  height: number
  speed: number
  color: string
  offset: number
  bass: number
}) {
  const trailRef = useRef<THREE.Mesh>(null)

  // Create tube path
  const tubePath = useMemo(() => {
    const points: THREE.Vector3[] = []
    const segments = 64

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      points.push(new THREE.Vector3(x, height, z))
    }

    return new THREE.CatmullRomCurve3(points, true)
  }, [radius, height])

  useFrame((state) => {
    if (!trailRef.current) return

    // Rotate trail
    trailRef.current.rotation.y += state.clock.getDelta() * speed

    // Bass reactive glow
    const material = trailRef.current.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = 2 + bass * 3
  })

  return (
    <mesh ref={trailRef} rotation={[0, offset, 0]}>
      <tubeGeometry args={[tubePath, 64, 0.1, 8, true]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function LightTrails({ bass, mids, theme }: LightTrailsProps) {
  const groupRef = useRef<THREE.Group>(null)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  // Speed up with bass
  const baseSpeed = 0.3 + bass * 0.5

  return (
    <group ref={groupRef}>
      {/* Multiple light trail ribbons at different heights and radii */}

      {/* Inner cyan trail */}
      <LightTrail
        radius={15}
        height={0.5}
        speed={baseSpeed}
        color={primaryColor}
        offset={0}
        bass={bass}
      />

      {/* Mid orange trail (counter-rotating) */}
      <LightTrail
        radius={20}
        height={1.0}
        speed={-baseSpeed * 0.8}
        color={secondaryColor}
        offset={Math.PI / 3}
        bass={bass}
      />

      {/* Outer electric blue trail */}
      <LightTrail
        radius={25}
        height={1.5}
        speed={baseSpeed * 0.6}
        color={tertiaryColor}
        offset={Math.PI / 2}
        bass={bass}
      />

      {/* High altitude cyan trail */}
      <LightTrail
        radius={18}
        height={8}
        speed={baseSpeed * 1.2}
        color={primaryColor}
        offset={Math.PI}
        bass={bass}
      />

      {/* Vertical connecting ribbons */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, index) => (
        <VerticalRibbon
          key={`vertical-${index}`}
          angle={angle}
          radius={22}
          color={index % 2 === 0 ? primaryColor : tertiaryColor}
          bass={bass}
        />
      ))}
    </group>
  )
}

// Vertical light ribbon connecting different levels
function VerticalRibbon({
  angle,
  radius,
  color,
  bass,
}: {
  angle: number
  radius: number
  color: string
  bass: number
}) {
  const ribbonRef = useRef<THREE.Mesh>(null)

  const verticalPath = useMemo(() => {
    const points: THREE.Vector3[] = []
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    for (let i = 0; i <= 20; i++) {
      const y = (i / 20) * 10
      points.push(new THREE.Vector3(x, y, z))
    }

    return new THREE.CatmullRomCurve3(points, false)
  }, [angle, radius])

  useFrame(() => {
    if (!ribbonRef.current) return

    // Bass reactive glow
    const material = ribbonRef.current.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = 1.5 + bass * 2
  })

  return (
    <mesh ref={ribbonRef}>
      <tubeGeometry args={[verticalPath, 20, 0.08, 6, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
