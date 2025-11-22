'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'
import NeonSign from '../shaders/NeonSign'

interface NeonSignsProps {
  bass: number
  mids: number
  highs: number
  theme?: ColorTheme
}

export default function NeonSigns({
  bass,
  mids,
  highs,
  theme,
}: NeonSignsProps) {
  // Generate sign positions around the city
  const signData = useMemo(() => {
    const signs = []
    const count = 24

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 35 + Math.random() * 20
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = 5 + Math.random() * 25

      // Random orientation facing center
      const rotation = [
        0,
        -angle + Math.PI / 2,
        0
      ] as [number, number, number]

      // Random size
      const width = 1.5 + Math.random() * 3
      const height = 0.4 + Math.random() * 0.6

      // Random color from theme
      const colors = [
        theme?.colors.primary || '#00ffff',
        theme?.colors.secondary || '#ff00ff',
        theme?.colors.tertiary || '#ffff00',
        '#ff0055',
        '#00ff88',
      ]
      const color = colors[Math.floor(Math.random() * colors.length)]

      // Varied pulse speeds
      const pulseSpeed = 1.5 + Math.random() * 2.5

      signs.push({
        position: [x, y, z] as [number, number, number],
        rotation,
        width,
        height,
        color,
        pulseSpeed,
      })
    }

    return signs
  }, [theme])

  // Vertical neon signs on buildings
  const verticalSigns = useMemo(() => {
    const signs = []
    const count = 16

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3
      const radius = 30 + Math.random() * 25
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = 15 + Math.random() * 20

      const rotation = [
        0,
        -angle + Math.PI / 2,
        0
      ] as [number, number, number]

      const colors = [
        theme?.colors.primary || '#00ffff',
        theme?.colors.secondary || '#ff00ff',
      ]
      const color = colors[i % 2]

      signs.push({
        position: [x, y, z] as [number, number, number],
        rotation,
        width: 0.3,
        height: 8,
        color,
        pulseSpeed: 2.0,
      })
    }

    return signs
  }, [theme])

  return (
    <group>
      {/* Horizontal neon signs */}
      {signData.map((sign, i) => (
        <NeonSign
          key={`horizontal-${i}`}
          position={sign.position}
          rotation={sign.rotation}
          width={sign.width}
          height={sign.height}
          color={sign.color}
          audioReactivity={bass + mids * 0.3}
          pulseSpeed={sign.pulseSpeed}
          pulseIntensity={0.8}
          flickerAmount={0.15}
        />
      ))}

      {/* Vertical neon strips */}
      {verticalSigns.map((sign, i) => (
        <NeonSign
          key={`vertical-${i}`}
          position={sign.position}
          rotation={sign.rotation}
          width={sign.width}
          height={sign.height}
          color={sign.color}
          audioReactivity={highs * 0.5}
          pulseSpeed={sign.pulseSpeed}
          pulseIntensity={1.2}
          flickerAmount={0.2}
        />
      ))}

      {/* Ground level entrance signs */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 40
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

        return (
          <NeonSign
            key={`ground-${i}`}
            position={[x, 1.5, z]}
            rotation={[0, -angle + Math.PI / 2, 0]}
            width={2.5}
            height={0.8}
            color={theme?.colors.tertiary || '#ffff00'}
            audioReactivity={mids}
            pulseSpeed={3.0}
            pulseIntensity={0.6}
            flickerAmount={0.05}
          />
        )
      })}
    </group>
  )
}
