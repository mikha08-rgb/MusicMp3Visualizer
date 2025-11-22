'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { waterReflectionShader } from '@/lib/shaders/waterReflection'
import type { ColorTheme } from '@/lib/themes'

interface ReflectiveWaterProps {
  position?: THREE.Vector3 | [number, number, number]
  rotation?: THREE.Euler | [number, number, number]
  size?: number
  waterColor?: string
  audioReactivity?: number
  theme?: ColorTheme
}

export default function ReflectiveWater({
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
  size = 20,
  waterColor = '#0a0a2e',
  audioReactivity = 0,
  theme,
}: ReflectiveWaterProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      waterColor: { value: new THREE.Color(waterColor) },
      reflectionTint: {
        value: new THREE.Color(theme?.colors.primary || '#00ffff'),
      },
      time: { value: 0 },
      waveSpeed: { value: 0.3 },
      waveAmplitude: { value: 0.05 },
      rippleFrequency: { value: 3.0 },
      audioReactivity: { value: 0 },
      reflectionStrength: { value: 0.5 },
      environmentMap: { value: null },
    }),
    [waterColor, theme]
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: waterReflectionShader.vertexShader,
        fragmentShader: waterReflectionShader.fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    [uniforms]
  )

  useFrame((state) => {
    if (material.uniforms) {
      material.uniforms.time.value = state.clock.elapsedTime
      material.uniforms.audioReactivity.value = audioReactivity
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} material={material}>
      <planeGeometry args={[size, size, 64, 64]} />
    </mesh>
  )
}
