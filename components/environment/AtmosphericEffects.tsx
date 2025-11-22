'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface AtmosphericEffectsProps {
  bass: number
  theme?: ColorTheme
  showRain?: boolean
}

export default function AtmosphericEffects({
  bass,
  theme,
  showRain = true
}: AtmosphericEffectsProps) {
  const rainRef = useRef<THREE.Points>(null)
  const fogParticlesRef = useRef<THREE.Points>(null)

  // Rain particles
  const rainData = useMemo(() => {
    const particleCount = 400 // Optimized for performance
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      // Spread rain across large area
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = Math.random() * 100
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200

      velocities[i] = 0.5 + Math.random() * 0.5
    }

    return { positions, velocities }
  }, [])

  // Fog particles (dust motes, smog)
  const fogData = useMemo(() => {
    const particleCount = 150 // Optimized for performance
    const positions = new Float32Array(particleCount * 3)
    const speeds = new Float32Array(particleCount)
    const phases = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150
      positions[i * 3 + 1] = Math.random() * 60
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150

      speeds[i] = 0.05 + Math.random() * 0.1
      phases[i] = Math.random() * Math.PI * 2
    }

    return { positions, speeds, phases }
  }, [])

  // Animate rain
  useFrame((state, delta) => {
    if (!rainRef.current || !showRain) return

    const positions = rainRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length / 3; i++) {
      // Fall down
      positions[i * 3 + 1] -= rainData.velocities[i] * delta * 60

      // Reset to top when reaching ground
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 100
        positions[i * 3] = (Math.random() - 0.5) * 200
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200
      }
    }

    rainRef.current.geometry.attributes.position.needsUpdate = true
  })

  // Animate fog particles
  useFrame((state) => {
    if (!fogParticlesRef.current) return

    const time = state.clock.elapsedTime
    const positions = fogParticlesRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length / 3; i++) {
      // Gentle drift
      const speed = fogData.speeds[i]
      const phase = fogData.phases[i]

      positions[i * 3] += Math.sin(time * speed + phase) * 0.02
      positions[i * 3 + 2] += Math.cos(time * speed + phase) * 0.02

      // Subtle vertical float
      positions[i * 3 + 1] += Math.sin(time * speed * 2 + phase) * 0.01

      // Wrap around if too far
      if (Math.abs(positions[i * 3]) > 100) {
        positions[i * 3] = (Math.random() - 0.5) * 150
      }
      if (Math.abs(positions[i * 3 + 2]) > 100) {
        positions[i * 3 + 2] = (Math.random() - 0.5) * 150
      }
      if (positions[i * 3 + 1] < 0 || positions[i * 3 + 1] > 60) {
        positions[i * 3 + 1] = Math.random() * 60
      }
    }

    fogParticlesRef.current.geometry.attributes.position.needsUpdate = true

    // Pulse opacity with bass
    const material = fogParticlesRef.current.material as THREE.PointsMaterial
    material.opacity = 0.3 + bass * 0.2
  })

  const rainColor = theme?.colors.primary || '#00ffff'
  const fogColor = theme?.colors.secondary || '#ff00ff'

  return (
    <group>
      {/* Rain */}
      {showRain && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={rainData.positions.length / 3}
              array={rainData.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.15}
            color="#ffffff"
            transparent
            opacity={0.4}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Fog particles */}
      <points ref={fogParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={fogData.positions.length / 3}
            array={fogData.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.5}
          color={fogColor}
          transparent
          opacity={0.3}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Floating neon dust near ground */}
      <points position={[0, 2, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={new Float32Array(Array.from({ length: 300 }, () => (Math.random() - 0.5) * 120))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          color={rainColor}
          transparent
          opacity={0.5}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
