'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { holographicGlassShader } from '@/lib/shaders/holographicGlass'
import type { ColorTheme } from '@/lib/themes'

interface HolographicGlassProps {
  geometry?: THREE.BufferGeometry
  position?: THREE.Vector3 | [number, number, number]
  rotation?: THREE.Euler | [number, number, number]
  scale?: THREE.Vector3 | [number, number, number]
  audioReactivity?: number
  theme?: ColorTheme
}

export default function HolographicGlass({
  geometry,
  position,
  rotation,
  scale,
  audioReactivity = 0,
  theme,
}: HolographicGlassProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      color1: {
        value: new THREE.Color(theme?.colors.primary || '#00ffff'),
      },
      color2: {
        value: new THREE.Color(theme?.colors.secondary || '#ff00ff'),
      },
      color3: {
        value: new THREE.Color(theme?.colors.tertiary || '#ffff00'),
      },
      time: { value: 0 },
      audioReactivity: { value: 0 },
      fresnelPower: { value: 2.0 },
      opacity: { value: 0.6 },
      iridescenceStrength: { value: 1.5 },
    }),
    [theme]
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: holographicGlassShader.vertexShader,
        fragmentShader: holographicGlassShader.fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
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
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  )
}
