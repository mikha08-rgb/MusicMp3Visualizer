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

  const gridColor = theme?.colors.primary || '#00ffff'
  const gridColor2 = theme?.colors.secondary || '#ff00ff'

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

      {/* Vertical grid walls removed for better performance */}
    </group>
  )
}
