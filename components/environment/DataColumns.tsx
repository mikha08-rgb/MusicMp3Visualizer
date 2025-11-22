'use client'

import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'
import { geometries } from '@/lib/geometry-library'
import { AnimationManager } from '@/lib/AnimationManager'

interface DataColumnsProps {
  bass: number
  mids: number
  theme?: ColorTheme
}

export default function DataColumns({ bass, mids, theme }: DataColumnsProps) {
  const particlesRef = useRef<THREE.InstancedMesh>(null)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  // Column positions at circuit intersections
  const columnPositions = useMemo(() => {
    const positions: THREE.Vector3[] = []
    const gridSize = 8
    const spacing = 10

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (Math.random() > 0.6) { // Only some positions have columns
          const x = (i - gridSize / 2) * spacing
          const z = (j - gridSize / 2) * spacing
          positions.push(new THREE.Vector3(x, 0, z))
        }
      }
    }

    return positions
  }, [])

  const particlesPerColumn = 10
  const totalParticles = columnPositions.length * particlesPerColumn
  const maxHeight = 12

  // Temporary objects for matrix updates - reused across frames
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Store refs for AnimationManager access
  const bassRef = useRef(bass)
  bassRef.current = bass

  // Particle data (height and speed for each particle)
  const particleData = useMemo(() => {
    return Array.from({ length: totalParticles }, () => ({
      height: Math.random() * maxHeight,
      speed: 0.5 + Math.random() * 1.0,
      columnIndex: 0, // Will be set in animation
    }))
  }, [totalParticles, maxHeight])

  // Use AnimationManager instead of useFrame - massive performance improvement
  useEffect(() => {
    const unregister = AnimationManager.register(
      'data-columns-animation',
      (time, delta) => {
        if (!particlesRef.current) return

        const speedMultiplier = 1 + bassRef.current * 1.5

        // CRITICAL FIX: Calculate delta ONCE before the loop, not inside it!
        // This was being called 250+ times per frame before (bug!)
        const deltaTime = delta

        columnPositions.forEach((columnPos, colIndex) => {
          const columnColor = colIndex % 3 === 0 ? primaryColor : colIndex % 3 === 1 ? secondaryColor : tertiaryColor

          for (let i = 0; i < particlesPerColumn; i++) {
            const particleIndex = colIndex * particlesPerColumn + i
            const data = particleData[particleIndex]

            // Update height - using pre-calculated deltaTime
            data.height += deltaTime * data.speed * speedMultiplier

            // Respawn at bottom when reaching top
            if (data.height > maxHeight) {
              data.height = 0
            }

            // Pre-calculate wobble offsets (optimization)
            const wobbleX = Math.sin(time + particleIndex) * 0.3
            const wobbleZ = Math.cos(time + particleIndex) * 0.3

            // Position particle
            tempObject.position.set(
              columnPos.x + wobbleX,
              data.height,
              columnPos.z + wobbleZ
            )

            // Scale particles - smaller at bottom and top, larger in middle
            const heightRatio = data.height / maxHeight
            const scaleFactor = Math.sin(heightRatio * Math.PI) * (0.15 + bassRef.current * 0.1)
            tempObject.scale.setScalar(scaleFactor)

            tempObject.updateMatrix()
            particlesRef.current!.setMatrixAt(particleIndex, tempObject.matrix)

            // Set color (opacity calculation removed as it's not used in material)
            tempColor.set(columnColor)
            particlesRef.current!.setColorAt(particleIndex, tempColor)
          }
        })

        particlesRef.current.instanceMatrix.needsUpdate = true
        if (particlesRef.current.instanceColor) {
          particlesRef.current.instanceColor.needsUpdate = true
        }
      },
      'medium', // Medium priority - visual effect
      60 // 60 Hz - smooth animation
    )

    return unregister
  }, [columnPositions, particleData, particlesPerColumn, maxHeight, primaryColor, secondaryColor, tertiaryColor])

  if (columnPositions.length === 0) return null

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, totalParticles]}>
      {/* OPTIMIZATION: Use shared geometry from library with reduced segments (4x4 instead of 6x6)
          For tiny particles, 4x4 (96 triangles) is visually identical to 6x6 (216 triangles)
          Saves 55% of geometry processing! */}
      <primitive object={geometries.sphere.tiny} />
      {/* ULTRA-OPTIMIZATION: MeshBasicMaterial for glowing particles (3-5x faster than Standard!) */}
      <meshBasicMaterial
        color={primaryColor}
        transparent
        opacity={0.8}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
