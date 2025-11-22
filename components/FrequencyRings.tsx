'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FrequencyRingsProps {
  frequencyData: Uint8Array
  barCount?: number
  radius?: number
  isPlaying: boolean
}

function FrequencyBar({
  position,
  rotation,
  scale,
  color
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: THREE.Color
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[0.3, 1, 0.3]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        toneMapped={false}
      />
    </mesh>
  )
}

export default function FrequencyRings({
  frequencyData,
  barCount = 64,
  radius = 8,
  isPlaying
}: FrequencyRingsProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Create bar data
  const bars = useMemo(() => {
    const barsData = []
    const angleStep = (Math.PI * 2) / barCount

    for (let i = 0; i < barCount; i++) {
      const angle = i * angleStep
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      // Calculate color based on position in the ring
      // Bass (0-0.33): Red -> Yellow
      // Mids (0.33-0.66): Yellow -> Green
      // Highs (0.66-1): Green -> Blue
      const t = i / barCount
      let color: THREE.Color

      if (t < 0.33) {
        // Bass: Red to Yellow
        const localT = t / 0.33
        color = new THREE.Color().setRGB(1, localT, 0)
      } else if (t < 0.66) {
        // Mids: Yellow to Green
        const localT = (t - 0.33) / 0.33
        color = new THREE.Color().setRGB(1 - localT, 1, 0)
      } else {
        // Highs: Green to Blue
        const localT = (t - 0.66) / 0.34
        color = new THREE.Color().setRGB(0, 1 - localT, localT)
      }

      barsData.push({
        position: [x, 0, z] as [number, number, number],
        rotation: [0, -angle, 0] as [number, number, number],
        color,
        index: i,
      })
    }

    return barsData
  }, [barCount, radius])

  // Slow rotation and update bar heights
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Rotate the entire ring slowly
    if (isPlaying) {
      groupRef.current.rotation.y += delta * 0.1
    }

    // Update individual bar heights based on frequency data
    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        // Map frequency data to bar heights
        const dataIndex = Math.floor((index / barCount) * frequencyData.length)
        const frequencyValue = frequencyData[dataIndex] || 0

        // Normalize frequency value (0-255) to scale (0.5-5)
        const targetScale = 0.5 + (frequencyValue / 255) * 4.5

        // Smooth transition
        const currentScale = child.scale.y
        child.scale.y = THREE.MathUtils.lerp(currentScale, targetScale, 0.3)

        // Position bars so they grow upward from the ground
        child.position.y = child.scale.y / 2
      }
    })
  })

  return (
    <group ref={groupRef}>
      {bars.map((bar, index) => (
        <FrequencyBar
          key={index}
          position={bar.position}
          rotation={bar.rotation}
          scale={[1, 1, 1]}
          color={bar.color}
        />
      ))}
    </group>
  )
}
