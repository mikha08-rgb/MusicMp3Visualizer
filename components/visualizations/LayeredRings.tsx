'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LayeredRingsProps {
  bass: number
  mids: number
  highs: number
  frequencyData: Uint8Array
  beatDetected: boolean
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
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
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

function Ring({
  radius,
  barCount,
  frequencySlice,
  colorHueShift,
  rotationSpeed,
}: {
  radius: number
  barCount: number
  frequencySlice: Uint8Array
  colorHueShift: number
  rotationSpeed: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  const bars = useMemo(() => {
    const barsData = []
    const angleStep = (Math.PI * 2) / barCount

    for (let i = 0; i < barCount; i++) {
      const angle = i * angleStep
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      const t = i / barCount
      const hue = (t + colorHueShift) % 1
      const color = new THREE.Color().setHSL(hue, 0.8, 0.5)

      barsData.push({
        position: [x, 0, z] as [number, number, number],
        rotation: [0, -angle, 0] as [number, number, number],
        color,
        index: i,
      })
    }

    return barsData
  }, [barCount, radius, colorHueShift])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Rotate the ring
    if (rotationSpeed !== 0) {
      groupRef.current.rotation.y += delta * rotationSpeed
    }

    // Update bar heights based on frequency data
    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        const dataIndex = Math.floor((index / barCount) * frequencySlice.length)
        const frequencyValue = frequencySlice[dataIndex] || 0

        // Normalize frequency value to scale
        const targetScale = 0.5 + (frequencyValue / 255) * 4.5

        // Smooth transition
        child.scale.y = THREE.MathUtils.lerp(child.scale.y, targetScale, 0.3)

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

function CentralOrb({ bass, beatDetected }: { bass: number; beatDetected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Pulse with bass
    const targetScale = 1 + bass * 1.5
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.2)
    )

    // Rotation
    meshRef.current.rotation.y += delta * 0.5
    meshRef.current.rotation.x += delta * 0.3

    // Beat flash
    const material = meshRef.current.material as THREE.MeshStandardMaterial
    if (beatDetected) {
      material.emissiveIntensity = 2.0
    } else {
      material.emissiveIntensity = THREE.MathUtils.lerp(
        material.emissiveIntensity,
        0.8,
        0.1
      )
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial
        color="#ff6b6b"
        emissive="#ff3333"
        emissiveIntensity={0.8}
        roughness={0.3}
        metalness={0.7}
        toneMapped={false}
      />
    </mesh>
  )
}

function BackgroundParticles({ highs }: { highs: number }) {
  const particleCount = 500
  const particlesRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return pos
  }, [])

  useFrame((state, delta) => {
    if (!particlesRef.current) return

    particlesRef.current.rotation.y += delta * 0.05

    // Scale with highs
    const targetScale = 1 + highs * 0.5
    particlesRef.current.scale.setScalar(
      THREE.MathUtils.lerp(particlesRef.current.scale.x, targetScale, 0.1)
    )
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#4ecdc4"
        transparent
        opacity={0.4 + highs * 0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default function LayeredRings({
  bass,
  mids,
  highs,
  frequencyData,
  beatDetected,
  isPlaying
}: LayeredRingsProps) {
  // Split frequency data for different rings
  const bassData = useMemo(() => {
    const third = Math.floor(frequencyData.length / 3)
    return frequencyData.slice(0, third)
  }, [frequencyData])

  const midsData = useMemo(() => {
    const third = Math.floor(frequencyData.length / 3)
    return frequencyData.slice(third, third * 2)
  }, [frequencyData])

  const highsData = useMemo(() => {
    const third = Math.floor(frequencyData.length / 3)
    return frequencyData.slice(third * 2)
  }, [frequencyData])

  return (
    <group>
      {/* Background particles */}
      <BackgroundParticles highs={highs} />

      {/* Central orb */}
      <CentralOrb bass={bass} beatDetected={beatDetected} />

      {/* Inner ring - bass frequencies */}
      <Ring
        radius={5}
        barCount={32}
        frequencySlice={bassData}
        colorHueShift={0}
        rotationSpeed={isPlaying ? 0.1 : 0}
      />

      {/* Middle ring - mid frequencies */}
      <Ring
        radius={10}
        barCount={48}
        frequencySlice={midsData}
        colorHueShift={0.33}
        rotationSpeed={isPlaying ? -0.15 : 0}
      />

      {/* Outer ring - high frequencies */}
      <Ring
        radius={15}
        barCount={64}
        frequencySlice={highsData}
        colorHueShift={0.66}
        rotationSpeed={isPlaying ? 0.08 : 0}
      />
    </group>
  )
}
