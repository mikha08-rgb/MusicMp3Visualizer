'use client'

import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'
import { geometries } from '@/lib/geometry-library'
import { AnimationManager } from '@/lib/AnimationManager'

interface PulseData {
  id: number
  startTime: number
  maxRadius: number
  speed: number
  color: string
}

interface GridPulsesProps {
  bass: number
  beatDetected: boolean
  theme?: ColorTheme
}

export default function GridPulses({ bass, beatDetected, theme }: GridPulsesProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [pulses, setPulses] = useState<PulseData[]>([])
  const lastBeatTime = useRef(0)
  const pulseIdCounter = useRef(0)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  // Trigger new pulse on beat detection
  useEffect(() => {
    if (beatDetected && bass > 0.4) {
      const now = performance.now()

      // Throttle pulses (max one every 300ms)
      if (now - lastBeatTime.current < 300) return
      lastBeatTime.current = now

      // Remove old pulses (keep max 5)
      setPulses((prev) => {
        const newPulses = prev.filter((p) => now - p.startTime < 3000)

        // Add new pulse
        const colors = [primaryColor, secondaryColor, tertiaryColor]
        const newPulse: PulseData = {
          id: pulseIdCounter.current++,
          startTime: now,
          maxRadius: 60 + bass * 30,
          speed: 15 + bass * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
        }

        return [...newPulses.slice(-4), newPulse] // Keep max 5 pulses
      })
    }
  }, [beatDetected, bass, primaryColor, secondaryColor, tertiaryColor])

  return (
    <group ref={groupRef} position={[0, 0.15, 0]}>
      {pulses.map((pulse) => (
        <ExpandingRing key={pulse.id} pulse={pulse} />
      ))}
    </group>
  )
}

// Individual expanding ring pulse - optimized with AnimationManager
function ExpandingRing({ pulse }: { pulse: PulseData }) {
  const ringRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  // Migrated to AnimationManager
  useEffect(() => {
    const unregister = AnimationManager.register(
      `grid-pulse-${pulse.id}`,
      () => {
        if (!ringRef.current || !materialRef.current) return

        const elapsed = (performance.now() - pulse.startTime) / 1000
        const progress = Math.min(elapsed * pulse.speed / pulse.maxRadius, 1)

        // Expand ring
        const currentRadius = progress * pulse.maxRadius
        ringRef.current.scale.set(currentRadius, currentRadius, 1)

        // Fade out as it expands
        const opacity = Math.max(0, 1 - progress)
        materialRef.current.opacity = opacity * 0.7

        // Intensity pulse
        materialRef.current.emissiveIntensity = (1 - progress) * 4 + 1
      },
      'medium', // Medium priority - visual effect
      60 // 60 Hz - smooth expansion
    )

    return unregister
  }, [pulse.id, pulse.startTime, pulse.speed, pulse.maxRadius])

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
      {/* OPTIMIZATION: Use shared ring geometry from library */}
      <primitive object={geometries.ring.medium} />
      {/* ULTRA-OPTIMIZATION: MeshBasic for glowing pulses */}
      <meshBasicMaterial
        ref={materialRef}
        color={pulse.color}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}
