'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { energyFieldShader } from '@/lib/shaders/energyField'
import type { ColorTheme } from '@/lib/themes'

interface EnergyShieldProps {
  position?: THREE.Vector3 | [number, number, number]
  radius?: number
  height?: number
  audioReactivity?: number
  theme?: ColorTheme
  impactPosition?: THREE.Vector3
}

export default function EnergyShield({
  position = [0, 0, 0],
  radius = 15,
  height = 30,
  audioReactivity = 0,
  theme,
  impactPosition,
}: EnergyShieldProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      fieldColor: {
        value: new THREE.Color(theme?.colors.primary || '#00ffff'),
      },
      accentColor: {
        value: new THREE.Color(theme?.colors.secondary || '#ff00ff'),
      },
      time: { value: 0 },
      hexSize: { value: 0.8 },
      hexThickness: { value: 0.35 },
      audioReactivity: { value: 0 },
      flowSpeed: { value: 0.1 },
      impactX: { value: 0 },
      impactY: { value: 0 },
      impactZ: { value: 0 },
    }),
    [theme]
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: energyFieldShader.vertexShader,
        fragmentShader: energyFieldShader.fragmentShader,
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

      if (impactPosition) {
        material.uniforms.impactX.value = impactPosition.x
        material.uniforms.impactY.value = impactPosition.y
        material.uniforms.impactZ.value = impactPosition.z
      }
    }
  })

  return (
    <mesh ref={meshRef} position={position} material={material}>
      <cylinderGeometry args={[radius, radius, height, 32, 1, true]} />
    </mesh>
  )
}
