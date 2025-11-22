'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { volumetricFogShader } from '@/lib/shaders/volumetricFog'
import type { ColorTheme } from '@/lib/themes'

interface VolumetricFogProps {
  position?: THREE.Vector3 | [number, number, number]
  size?: [number, number, number]
  audioReactivity?: number
  density?: number
  lightPosition?: THREE.Vector3
  theme?: ColorTheme
  marchSteps?: number
}

export default function VolumetricFog({
  position = [0, 0, 0],
  size = [100, 50, 100],
  audioReactivity = 0,
  density = 0.3,
  lightPosition = new THREE.Vector3(0, 30, 0),
  theme,
  marchSteps = 16,
}: VolumetricFogProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      fogColor: {
        value: new THREE.Color(theme?.colors.primary || '#0a0a1e'),
      },
      lightPosition: { value: lightPosition },
      lightColor: {
        value: new THREE.Color(theme?.colors.primary || '#00ffff'),
      },
      time: { value: 0 },
      density: { value: density },
      audioReactivity: { value: 0 },
      lightIntensity: { value: 2.0 },
      marchSteps: { value: marchSteps },
      marchDistance: { value: 50.0 },
    }),
    [theme, density, lightPosition, marchSteps]
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: volumetricFogShader.vertexShader,
        fragmentShader: volumetricFogShader.fragmentShader,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
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
    <mesh ref={meshRef} position={position} material={material}>
      <boxGeometry args={size} />
    </mesh>
  )
}
