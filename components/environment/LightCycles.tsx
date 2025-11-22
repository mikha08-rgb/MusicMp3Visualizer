'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface LightCyclesProps {
  bass: number
  mids: number
  beatDetected: boolean
  theme?: ColorTheme
}

// Individual light cycle with persistent trail
function LightCycle({
  radius,
  speed,
  offset,
  color,
  bass,
  cycleIndex,
}: {
  radius: number
  speed: number
  offset: number
  color: string
  bass: number
  cycleIndex: number
}) {
  const cycleRef = useRef<THREE.Group>(null)
  const trailRef = useRef<THREE.Line>(null)
  const trailPositions = useRef<THREE.Vector3[]>([])
  const maxTrailLength = 100

  // Light cycle body geometry
  const cycleGeometry = useMemo(() => {
    const group = new THREE.Group()

    // Main body (elongated box)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.8, 1),
      new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1, // Reduced from 2
        metalness: 0.8,
        roughness: 0.2,
      })
    )
    group.add(body)

    // Front wedge
    const wedge = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1, 4),
      new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1.5, // Reduced from 3
        transparent: true,
        opacity: 0.9,
      })
    )
    wedge.rotation.z = Math.PI / 2
    wedge.position.x = 1.5
    group.add(wedge)

    // Glowing light bar (wheel lights)
    const lightBar1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.5, 0.1),
      new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 2, // Reduced from 4
        transparent: true,
        opacity: 0.8,
      })
    )
    lightBar1.position.set(-0.5, 0, 0)
    group.add(lightBar1)

    const lightBar2 = lightBar1.clone()
    lightBar2.position.set(0.5, 0, 0)
    group.add(lightBar2)

    return group
  }, [color])

  useFrame((state) => {
    if (!cycleRef.current) return

    const time = state.clock.elapsedTime
    const adjustedSpeed = speed * (1 + bass * 0.5) // Speed up with bass

    // Calculate position on circular path
    const angle = time * adjustedSpeed + offset
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = 0.5 // Height above ground

    cycleRef.current.position.set(x, y, z)

    // Face direction of movement
    cycleRef.current.rotation.y = angle + Math.PI / 2

    // Very subtle pulse intensity with bass - uniform for all parts
    cycleRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        // No pulsing - keep materials at their base emissive intensity
        // This prevents flashing while maintaining the glow
      }
    })

    // Update trail
    const currentPos = new THREE.Vector3(x, y, z)
    trailPositions.current.push(currentPos)

    // Keep trail length manageable
    if (trailPositions.current.length > maxTrailLength) {
      trailPositions.current.shift()
    }

    // Update trail geometry
    if (trailRef.current && trailPositions.current.length > 1) {
      const points = trailPositions.current.map((p) => p.clone())
      const curve = new THREE.CatmullRomCurve3(points)
      const trailGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50))
      trailRef.current.geometry.dispose()
      trailRef.current.geometry = trailGeometry
    }
  })

  return (
    <group ref={cycleRef}>
      <primitive object={cycleGeometry} />

      {/* Persistent light trail */}
      <line ref={trailRef}>
        <bufferGeometry />
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          linewidth={2}
        />
      </line>
    </group>
  )
}

export default function LightCycles({ bass, mids, beatDetected, theme }: LightCyclesProps) {
  const groupRef = useRef<THREE.Group>(null)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  // 4 light cycles racing around the perimeter
  const cycles = [
    { radius: 45, speed: 0.3, offset: 0, color: primaryColor },
    { radius: 45, speed: -0.35, offset: Math.PI, color: secondaryColor },
    { radius: 48, speed: 0.28, offset: Math.PI / 2, color: tertiaryColor },
    { radius: 42, speed: -0.32, offset: (Math.PI * 3) / 2, color: primaryColor },
  ]

  return (
    <group ref={groupRef}>
      {cycles.map((cycle, index) => (
        <LightCycle
          key={`cycle-${index}`}
          radius={cycle.radius}
          speed={cycle.speed}
          offset={cycle.offset}
          color={cycle.color}
          bass={bass}
          cycleIndex={index}
        />
      ))}
    </group>
  )
}
