'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'
import { dataStreamShader } from '@/lib/shaders/dataStream'

interface DataStreamsProps {
  bass: number
  mids: number
  theme?: ColorTheme
}

// Single data stream column
function DataStreamColumn({
  position,
  color,
  bass,
  speed,
}: {
  position: THREE.Vector3
  color: string
  bass: number
  speed: number
}) {
  const streamRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      streamColor: { value: new THREE.Color(color) },
      time: { value: 0 },
      flowSpeed: { value: speed },
      audioIntensity: { value: 0 },
      density: { value: 10.0 },
    }),
    [color, speed]
  )

  // Create particle system for the stream
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const particleCount = 50
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5 // x
      positions[i * 3 + 1] = Math.random() * 15 // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5 // z
      sizes[i] = Math.random() * 0.2 + 0.1
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    return geometry
  }, [])

  useFrame((state) => {
    if (!streamRef.current || !particlesRef.current) return

    const time = state.clock.elapsedTime

    // Update shader uniforms
    uniforms.time.value = time
    uniforms.audioIntensity.value = bass

    // Animate particles upward
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length / 3; i++) {
      // Move particles up
      positions[i * 3 + 1] += speed * (1 + bass * 0.5) * 0.1

      // Reset to bottom when they reach top
      if (positions[i * 3 + 1] > 15) {
        positions[i * 3 + 1] = 0
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true

    // Pulse material intensity
    const material = particlesRef.current.material as THREE.PointsMaterial
    material.opacity = 0.6 + bass * 0.4
  })

  return (
    <group position={position}>
      {/* Shader-based data stream plane */}
      <mesh ref={streamRef} rotation={[0, 0, 0]}>
        <planeGeometry args={[1, 15]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={dataStreamShader.vertexShader}
          fragmentShader={dataStreamShader.fragmentShader}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Particle system for extra detail */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.15}
          color={color}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

export default function DataStreams({ bass, mids, theme }: DataStreamsProps) {
  const groupRef = useRef<THREE.Group>(null)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  // Create data streams at grid intersections and circuit board nodes
  const streamPositions = useMemo(() => {
    const positions: { pos: THREE.Vector3; color: string; speed: number }[] = []
    const gridSize = 6
    const spacing = 15

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Only create streams at some positions (not all)
        if (Math.random() > 0.6) {
          const x = (i - gridSize / 2) * spacing
          const z = (j - gridSize / 2) * spacing

          // Skip center area (where visualizer is)
          if (Math.abs(x) < 15 && Math.abs(z) < 15) continue

          // Choose color based on position
          const colorChoice = Math.random()
          const color =
            colorChoice > 0.66 ? primaryColor : colorChoice > 0.33 ? secondaryColor : tertiaryColor

          positions.push({
            pos: new THREE.Vector3(x, 0, z),
            color,
            speed: 0.5 + Math.random() * 0.5,
          })
        }
      }
    }

    return positions
  }, [primaryColor, secondaryColor, tertiaryColor])

  return (
    <group ref={groupRef}>
      {streamPositions.map((stream, index) => (
        <DataStreamColumn
          key={`stream-${index}`}
          position={stream.pos}
          color={stream.color}
          bass={bass}
          speed={stream.speed}
        />
      ))}
    </group>
  )
}
