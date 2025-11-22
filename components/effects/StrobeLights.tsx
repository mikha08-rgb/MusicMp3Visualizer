'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface StrobeLightsProps {
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  theme?: ColorTheme
}

export default function StrobeLights({ bass, mids, highs, beatDetected, theme }: StrobeLightsProps) {
  const light1Ref = useRef<THREE.PointLight>(null)
  const light2Ref = useRef<THREE.PointLight>(null)
  const light3Ref = useRef<THREE.PointLight>(null)
  const light4Ref = useRef<THREE.PointLight>(null)
  const spotLight1Ref = useRef<THREE.SpotLight>(null)
  const spotLight2Ref = useRef<THREE.SpotLight>(null)

  const strobePhaseRef = useRef(0)
  const lastBeatRef = useRef(0)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // STROBE ON BEATS
    if (beatDetected && time - lastBeatRef.current > 0.1) {
      lastBeatRef.current = time
      strobePhaseRef.current = 1
    } else {
      strobePhaseRef.current *= 0.9
    }

    // ROTATING LIGHTS - Spin around the scene
    const rotationSpeed = 0.5 + mids * 2
    const angle1 = time * rotationSpeed
    const angle2 = time * rotationSpeed + Math.PI * 0.66
    const angle3 = time * rotationSpeed + Math.PI * 1.33

    const radius = 50

    if (light1Ref.current) {
      light1Ref.current.position.set(
        Math.cos(angle1) * radius,
        20 + bass * 20,
        Math.sin(angle1) * radius
      )
      light1Ref.current.intensity = (3 + bass * 10) * (1 + strobePhaseRef.current * 2)
      if (theme) light1Ref.current.color.set(theme.colors.primary)
    }

    if (light2Ref.current) {
      light2Ref.current.position.set(
        Math.cos(angle2) * radius,
        20 + mids * 15,
        Math.sin(angle2) * radius
      )
      light2Ref.current.intensity = (3 + mids * 8) * (1 + strobePhaseRef.current * 2)
      if (theme) light2Ref.current.color.set(theme.colors.secondary)
    }

    if (light3Ref.current) {
      light3Ref.current.position.set(
        Math.cos(angle3) * radius,
        20 + highs * 10,
        Math.sin(angle3) * radius
      )
      light3Ref.current.intensity = (3 + highs * 6) * (1 + strobePhaseRef.current * 2)
      if (theme) light3Ref.current.color.set(theme.colors.tertiary)
    }

    // CENTRAL EXPLOSION LIGHT - Pulses from center
    if (light4Ref.current) {
      light4Ref.current.intensity = (5 + bass * 30) * (1 + strobePhaseRef.current * 5)
      if (theme && beatDetected && bass > 0.7) {
        // Flash white on huge beats
        light4Ref.current.color.set('#ffffff')
      } else if (theme) {
        light4Ref.current.color.set(theme.colors.orb)
      }
    }

    // SPOTLIGHTS - Sweep across the scene
    if (spotLight1Ref.current) {
      const spotAngle = time * 0.8
      spotLight1Ref.current.position.set(
        Math.cos(spotAngle) * 40,
        40,
        Math.sin(spotAngle) * 40
      )
      spotLight1Ref.current.target.position.set(0, 0, 0)
      spotLight1Ref.current.intensity = 20 + bass * 50
      if (theme) spotLight1Ref.current.color.set(theme.colors.primary)
    }

    if (spotLight2Ref.current) {
      const spotAngle = -time * 0.6
      spotLight2Ref.current.position.set(
        Math.cos(spotAngle) * 40,
        40,
        Math.sin(spotAngle) * 40
      )
      spotLight2Ref.current.target.position.set(0, 0, 0)
      spotLight2Ref.current.intensity = 20 + mids * 40
      if (theme) spotLight2Ref.current.color.set(theme.colors.secondary)
    }
  })

  return (
    <>
      {/* Rotating point lights */}
      <pointLight
        ref={light1Ref}
        intensity={3}
        distance={80}
        decay={2}
        color="#00ffff"
      />
      <pointLight
        ref={light2Ref}
        intensity={3}
        distance={80}
        decay={2}
        color="#ff00ff"
      />
      <pointLight
        ref={light3Ref}
        intensity={3}
        distance={80}
        decay={2}
        color="#ffff00"
      />

      {/* Central explosion light */}
      <pointLight
        ref={light4Ref}
        position={[0, 10, 0]}
        intensity={5}
        distance={100}
        decay={2}
        color="#ffffff"
      />

      {/* Sweeping spotlights */}
      <spotLight
        ref={spotLight1Ref}
        intensity={20}
        angle={Math.PI / 6}
        penumbra={0.5}
        distance={100}
        decay={2}
        color="#00ffff"
        castShadow={false}
      />
      <spotLight
        ref={spotLight2Ref}
        intensity={20}
        angle={Math.PI / 6}
        penumbra={0.5}
        distance={100}
        decay={2}
        color="#ff00ff"
        castShadow={false}
      />
    </>
  )
}
