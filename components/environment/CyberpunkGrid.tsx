'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface CyberpunkGridProps {
  bass: number
  theme?: ColorTheme
}

export default function CyberpunkGrid({ bass, theme }: CyberpunkGridProps) {
  const gridRef = useRef<THREE.GridHelper>(null)
  const groundRef = useRef<THREE.Mesh>(null)
  const scanLineRef = useRef<THREE.Mesh>(null)
  const scanLine2Ref = useRef<THREE.Mesh>(null)

  const gridColor = theme?.colors.primary || '#00ffff'
  const gridColor2 = theme?.colors.secondary || '#ff00ff'

  // Tron-style scan line that sweeps across the grid
  const scanLineMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: gridColor,
      emissive: gridColor,
      emissiveIntensity: 3,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })
  }, [gridColor])

  const scanLine2Material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: gridColor2,
      emissive: gridColor2,
      emissiveIntensity: 3,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })
  }, [gridColor2])

  useFrame((state) => {
    if (!gridRef.current || !groundRef.current) return

    // Subtle pulse with bass
    const pulseFactor = 1 + bass * 0.1
    gridRef.current.scale.setScalar(pulseFactor)

    // Grid opacity pulses gently
    const material = gridRef.current.material as THREE.Material
    if (Array.isArray(material)) {
      material.forEach(mat => {
        if ('opacity' in mat) {
          mat.opacity = 0.3 + bass * 0.2
        }
      })
    } else {
      if ('opacity' in material) {
        material.opacity = 0.3 + bass * 0.2
      }
    }

    // Ground plane subtle glow
    const groundMat = groundRef.current.material as THREE.MeshStandardMaterial
    groundMat.emissiveIntensity = 0.05 + bass * 0.1

    // Animated scan lines sweeping across the grid
    if (scanLineRef.current) {
      const time = state.clock.elapsedTime
      scanLineRef.current.position.z = Math.sin(time * 0.5) * 90
      scanLineMaterial.emissiveIntensity = 3 + bass * 2
    }

    if (scanLine2Ref.current) {
      const time = state.clock.elapsedTime
      scanLine2Ref.current.position.x = Math.cos(time * 0.6) * 90
      scanLine2Material.emissiveIntensity = 3 + bass * 2
    }
  })

  return (
    <group position={[0, -0.5, 0]}>
      {/* Reflective ground plane */}
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive={gridColor}
          emissiveIntensity={0.05}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Glowing grid lines */}
      <gridHelper
        ref={gridRef}
        args={[200, 40, gridColor, gridColor2]}
      />

      {/* Tron-style animated scan lines */}
      <mesh ref={scanLineRef} position={[0, 0.1, 0]}>
        <planeGeometry args={[200, 0.5]} />
        <primitive object={scanLineMaterial} attach="material" />
      </mesh>

      <mesh ref={scanLine2Ref} position={[0, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[200, 0.5]} />
        <primitive object={scanLine2Material} attach="material" />
      </mesh>

      {/* Glowing grid intersections at corners */}
      {[-50, 0, 50].map((x) =>
        [-50, 0, 50].map((z) => (
          <mesh key={`intersection-${x}-${z}`} position={[x, 0.2, z]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial
              color={gridColor}
              emissive={gridColor}
              emissiveIntensity={2 + bass * 1}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))
      )}

      {/* Vertical grid walls removed for better performance */}
    </group>
  )
}
