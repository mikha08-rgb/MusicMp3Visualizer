'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface ScreenFlashProps {
  bass: number
  beatDetected: boolean
  theme?: ColorTheme
}

export default function ScreenFlash({ bass, beatDetected, theme }: ScreenFlashProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const flashIntensityRef = useRef(0)
  const lastBeatTimeRef = useRef(0)

  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.elapsedTime
    const material = meshRef.current.material as THREE.MeshBasicMaterial

    // Trigger flash on beat - much more subtle
    if (beatDetected && time - lastBeatTimeRef.current > 0.2) { // Increased cooldown
      lastBeatTimeRef.current = time
      flashIntensityRef.current = bass * 0.2 // Reduced from 0.6 to 0.2

      // Random color from theme only on very big beats
      if (bass > 0.85) { // Increased threshold from 0.7 to 0.85
        const colors = theme ? [
          theme.colors.primary,
          theme.colors.secondary,
          theme.colors.tertiary,
        ] : ['#ffffff']
        const randomColor = colors[Math.floor(Math.random() * colors.length)]
        material.color.set(randomColor)
      }
    }

    // Decay flash intensity very quickly
    flashIntensityRef.current *= 0.9 // Faster decay

    // Update material opacity
    material.opacity = flashIntensityRef.current

    // Very subtle pulse with bass
    const bassPulse = bass * 0.05 // Reduced from 0.15 to 0.05
    material.opacity = Math.max(material.opacity, bassPulse)
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 59.9]}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}
