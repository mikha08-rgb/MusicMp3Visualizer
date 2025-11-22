'use client'

import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'
import EnergyShield from '../shaders/EnergyShield'

interface EnergyBarrierProps {
  bass: number
  beatDetected: boolean
  theme?: ColorTheme
}

export default function EnergyBarrier({
  bass,
  beatDetected,
  theme,
}: EnergyBarrierProps) {
  const [impactPosition, setImpactPosition] = useState(new THREE.Vector3(0, 15, 0))

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Update impact position on beats
    if (beatDetected && Math.random() > 0.7) {
      const angle = Math.random() * Math.PI * 2
      const radius = 15
      const height = 10 + Math.random() * 20

      setImpactPosition(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        )
      )
    }

    // Slow drift of impact position
    setImpactPosition((prev) => {
      const newPos = prev.clone()
      newPos.x += Math.sin(time * 0.5) * 0.05
      newPos.z += Math.cos(time * 0.3) * 0.05
      return newPos
    })
  })

  return (
    <group>
      {/* Main cylindrical energy barrier */}
      <EnergyShield
        position={[0, 15, 0]}
        radius={18}
        height={35}
        audioReactivity={bass}
        theme={theme}
        impactPosition={impactPosition}
      />

      {/* Smaller rotating barriers */}
      <EnergyShield
        position={[25, 10, 25]}
        radius={8}
        height={20}
        audioReactivity={bass * 0.5}
        theme={theme}
      />

      <EnergyShield
        position={[-25, 10, -25]}
        radius={8}
        height={20}
        audioReactivity={bass * 0.5}
        theme={theme}
      />

      <EnergyShield
        position={[25, 10, -25]}
        radius={8}
        height={20}
        audioReactivity={bass * 0.5}
        theme={theme}
      />

      <EnergyShield
        position={[-25, 10, 25]}
        radius={8}
        height={20}
        audioReactivity={bass * 0.5}
        theme={theme}
      />
    </group>
  )
}
