'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'
import { energyBarrierShader } from '@/lib/shaders/energyBarrier'

interface EnergyBarriersProps {
  bass: number
  mids: number
  theme?: ColorTheme
}

// Individual energy barrier wall
function EnergyBarrier({
  position,
  rotation,
  size,
  color,
  bass,
}: {
  position: THREE.Vector3
  rotation: number
  size: { width: number; height: number }
  color: string
  bass: number
}) {
  const barrierRef = useRef<THREE.Mesh>(null)

  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      barrierColor: { value: new THREE.Color(color) },
      time: { value: 0 },
      audioIntensity: { value: 0 },
      opacity: { value: 0.6 },
      hexagonScale: { value: 1.0 },
      pulseSpeed: { value: 0.5 },
    }),
    [color]
  )

  useFrame((state) => {
    if (!barrierRef.current) return

    const time = state.clock.elapsedTime

    // Update shader uniforms
    uniforms.time.value = time
    uniforms.audioIntensity.value = bass

    // Pulse opacity with bass
    uniforms.opacity.value = 0.4 + bass * 0.3
  })

  return (
    <mesh
      ref={barrierRef}
      position={position}
      rotation={[0, rotation, 0]}
    >
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={energyBarrierShader.vertexShader}
        fragmentShader={energyBarrierShader.fragmentShader}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function EnergyBarriers({ bass, mids, theme }: EnergyBarriersProps) {
  const groupRef = useRef<THREE.Group>(null)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  // Create barriers at the boundaries of the city
  const barriers = useMemo(() => {
    const cityBoundary = 70
    const barrierHeight = 25
    const wallSegmentSize = 30

    return [
      // North wall - segments
      {
        position: new THREE.Vector3(-40, barrierHeight / 2, cityBoundary),
        rotation: 0,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: primaryColor,
      },
      {
        position: new THREE.Vector3(-10, barrierHeight / 2, cityBoundary),
        rotation: 0,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: tertiaryColor,
      },
      {
        position: new THREE.Vector3(20, barrierHeight / 2, cityBoundary),
        rotation: 0,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: primaryColor,
      },

      // South wall - segments
      {
        position: new THREE.Vector3(-40, barrierHeight / 2, -cityBoundary),
        rotation: 0,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: secondaryColor,
      },
      {
        position: new THREE.Vector3(-10, barrierHeight / 2, -cityBoundary),
        rotation: 0,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: primaryColor,
      },
      {
        position: new THREE.Vector3(20, barrierHeight / 2, -cityBoundary),
        rotation: 0,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: secondaryColor,
      },

      // East wall - segments
      {
        position: new THREE.Vector3(cityBoundary, barrierHeight / 2, -40),
        rotation: Math.PI / 2,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: tertiaryColor,
      },
      {
        position: new THREE.Vector3(cityBoundary, barrierHeight / 2, -10),
        rotation: Math.PI / 2,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: primaryColor,
      },
      {
        position: new THREE.Vector3(cityBoundary, barrierHeight / 2, 20),
        rotation: Math.PI / 2,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: tertiaryColor,
      },

      // West wall - segments
      {
        position: new THREE.Vector3(-cityBoundary, barrierHeight / 2, -40),
        rotation: Math.PI / 2,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: primaryColor,
      },
      {
        position: new THREE.Vector3(-cityBoundary, barrierHeight / 2, -10),
        rotation: Math.PI / 2,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: secondaryColor,
      },
      {
        position: new THREE.Vector3(-cityBoundary, barrierHeight / 2, 20),
        rotation: Math.PI / 2,
        size: { width: wallSegmentSize, height: barrierHeight },
        color: primaryColor,
      },

      // Corner barriers (diagonal)
      {
        position: new THREE.Vector3(cityBoundary * 0.7, barrierHeight / 2, cityBoundary * 0.7),
        rotation: Math.PI / 4,
        size: { width: 20, height: barrierHeight },
        color: tertiaryColor,
      },
      {
        position: new THREE.Vector3(-cityBoundary * 0.7, barrierHeight / 2, cityBoundary * 0.7),
        rotation: -Math.PI / 4,
        size: { width: 20, height: barrierHeight },
        color: secondaryColor,
      },
      {
        position: new THREE.Vector3(cityBoundary * 0.7, barrierHeight / 2, -cityBoundary * 0.7),
        rotation: -Math.PI / 4,
        size: { width: 20, height: barrierHeight },
        color: primaryColor,
      },
      {
        position: new THREE.Vector3(-cityBoundary * 0.7, barrierHeight / 2, -cityBoundary * 0.7),
        rotation: Math.PI / 4,
        size: { width: 20, height: barrierHeight },
        color: tertiaryColor,
      },
    ]
  }, [primaryColor, secondaryColor, tertiaryColor])

  return (
    <group ref={groupRef}>
      {barriers.map((barrier, index) => (
        <EnergyBarrier
          key={`barrier-${index}`}
          position={barrier.position}
          rotation={barrier.rotation}
          size={barrier.size}
          color={barrier.color}
          bass={bass}
        />
      ))}
    </group>
  )
}
