'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'
import { AnimationManager } from '@/lib/AnimationManager'

interface ScreenFlashProps {
  bass: number
  beatDetected: boolean
  theme?: ColorTheme
}

export default function ScreenFlash({ bass, beatDetected, theme }: ScreenFlashProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const flashIntensityRef = useRef(0)
  const lastBeatTimeRef = useRef(0)

  // Store props in refs for AnimationManager
  const bassRef = useRef(bass)
  const beatDetectedRef = useRef(beatDetected)
  bassRef.current = bass
  beatDetectedRef.current = beatDetected

  // Migrated to AnimationManager
  useEffect(() => {
    const unregister = AnimationManager.register(
      'screen-flash-animation',
      (time) => {
        if (!meshRef.current) return

        const material = meshRef.current.material as THREE.MeshBasicMaterial

        // Trigger flash on beat - much more subtle
        if (beatDetectedRef.current && time - lastBeatTimeRef.current > 0.2) {
          lastBeatTimeRef.current = time
          flashIntensityRef.current = bassRef.current * 0.2

          // Random color from theme only on very big beats
          if (bassRef.current > 0.85) {
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
        flashIntensityRef.current *= 0.9

        // Update material opacity
        material.opacity = flashIntensityRef.current

        // Very subtle pulse with bass
        const bassPulse = bassRef.current * 0.05
        material.opacity = Math.max(material.opacity, bassPulse)
      },
      'low', // Low priority - subtle effect
      60 // 60 Hz - smooth flash
    )

    return unregister
  }, [theme])

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
