'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'
import ReflectiveWater from '../shaders/ReflectiveWater'

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
  // Generate puddle positions
  const puddleData = useMemo(() => {
    const puddles = []
    const count = 12

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
      const radius = 30 + Math.random() * 25
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const size = 2 + Math.random() * 4
      const rotation = Math.random() * Math.PI

      puddles.push({
        position: [x, 0.02, z] as [number, number, number],
        size,
        rotation
      })
    }

    return puddles
  }, [])

  const puddleColor = theme?.colors.primary || '#00ffff'

  return (
    <group>
      {/* Individual puddles with shader-based water */}
      {puddleData.map((puddle, i) => (
        <ReflectiveWater
          key={i}
          position={puddle.position}
          rotation={[-Math.PI / 2, puddle.rotation, 0]}
          size={puddle.size}
          waterColor="#0a0a1e"
          audioReactivity={bass + mids * 0.5}
          theme={theme}
        />
      ))}

      {/* Large central water surface */}
      <ReflectiveWater
        position={[0, 0.01, 0]}
        size={16}
        waterColor="#0a0a1e"
        audioReactivity={bass}
        theme={theme}
      />

      {/* Puddle reflections - simple glow points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(
              Array.from({ length: 90 }, (_, i) => {
                const angle = (i / 30) * Math.PI * 2
                const radius = 35 + (i % 3) * 8
                if (i % 3 === 0) return Math.cos(angle) * radius
                if (i % 3 === 1) return 0.05
                return Math.sin(angle) * radius
              })
            ), 3]}
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
    </group>
  )
}
