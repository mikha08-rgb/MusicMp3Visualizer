'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tronGlowShader } from '@/lib/shaders/tronGlow'

interface TronEdgesProps {
  geometry: THREE.BufferGeometry
  color: string
  bass?: number
  position?: THREE.Vector3
  rotation?: THREE.Euler
}

// Adds glowing Tron-style edges to any geometry
export default function TronEdges({ geometry, color, bass = 0, position, rotation }: TronEdgesProps) {
  const edgesRef = useRef<THREE.Mesh>(null)

  // Shader uniforms for animated glow
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      time: { value: 0 },
      audioIntensity: { value: 0 },
      glowIntensity: { value: 1.5 },
      gridScale: { value: 5.0 },
      scanlineSpeed: { value: 0.5 },
      fresnelPower: { value: 2.0 },
    }),
    [color]
  )

  // Create edge geometry
  const edgeGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(geometry, 15) // 15 degree threshold for edges
  }, [geometry])

  useFrame((state) => {
    if (!edgesRef.current) return

    const time = state.clock.elapsedTime

    // Update shader uniforms
    uniforms.time.value = time
    uniforms.audioIntensity.value = bass
  })

  return (
    <>
      {/* Line-based edges for sharp glow */}
      <lineSegments geometry={edgeGeometry} position={position} rotation={rotation}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.8 + bass * 0.2}
          linewidth={2}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Shader-based mesh overlay for fresnel glow effect */}
      <mesh ref={edgesRef} geometry={geometry} position={position} rotation={rotation}>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={tronGlowShader.vertexShader}
          fragmentShader={tronGlowShader.fragmentShader}
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
