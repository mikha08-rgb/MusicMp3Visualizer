'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { neonPulseShader } from '@/lib/shaders/neonPulse'

interface NeonSignProps {
  position?: THREE.Vector3 | [number, number, number]
  rotation?: THREE.Euler | [number, number, number]
  scale?: THREE.Vector3 | [number, number, number]
  color?: string
  audioReactivity?: number
  pulseSpeed?: number
  pulseIntensity?: number
  flickerAmount?: number
  width?: number
  height?: number
}

export default function NeonSign({
  position = [0, 0, 0],
  rotation,
  scale,
  color = '#ff00ff',
  audioReactivity = 0,
  pulseSpeed = 2.0,
  pulseIntensity = 0.5,
  flickerAmount = 0.1,
  width = 2,
  height = 0.5,
}: NeonSignProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      neonColor: { value: new THREE.Color(color) },
      time: { value: 0 },
      pulseSpeed: { value: pulseSpeed },
      pulseIntensity: { value: pulseIntensity },
      audioReactivity: { value: 0 },
      flickerAmount: { value: flickerAmount },
      glowWidth: { value: 0.4 },
    }),
    [color, pulseSpeed, pulseIntensity, flickerAmount]
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: neonPulseShader.vertexShader,
        fragmentShader: neonPulseShader.fragmentShader,
        transparent: false,
        side: THREE.FrontSide,
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
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale} material={material}>
      <planeGeometry args={[width, height]} />
    </mesh>
  )
}
