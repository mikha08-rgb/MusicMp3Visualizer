'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

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

  // Temporary objects for matrix updates
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Particle data (height and speed for each particle)
  const particleData = useMemo(() => {
    return Array.from({ length: totalParticles }, () => ({
      height: Math.random() * maxHeight,
      speed: 0.5 + Math.random() * 1.0,
      columnIndex: 0, // Will be set in animation
    }))
  }, [totalParticles, maxHeight])

  // Animate particles rising
  useFrame((state) => {
    if (!particlesRef.current) return

    const time = state.clock.elapsedTime
    const speedMultiplier = 1 + bass * 1.5

    columnPositions.forEach((columnPos, colIndex) => {
      const columnColor = colIndex % 3 === 0 ? primaryColor : colIndex % 3 === 1 ? secondaryColor : tertiaryColor

      for (let i = 0; i < particlesPerColumn; i++) {
        const particleIndex = colIndex * particlesPerColumn + i
        const data = particleData[particleIndex]

        // Update height
        data.height += state.clock.getDelta() * data.speed * speedMultiplier

        // Respawn at bottom when reaching top
        if (data.height > maxHeight) {
          data.height = 0
        }

        // Position particle
        tempObject.position.set(
          columnPos.x + (Math.sin(time + particleIndex) * 0.3), // Slight horizontal wobble
          data.height,
          columnPos.z + (Math.cos(time + particleIndex) * 0.3)
        )

        // Scale particles - smaller at bottom and top, larger in middle
        const heightRatio = data.height / maxHeight
        const scaleFactor = Math.sin(heightRatio * Math.PI) * (0.15 + bass * 0.1)
        tempObject.scale.setScalar(scaleFactor)

        tempObject.updateMatrix()
        particlesRef.current.setMatrixAt(particleIndex, tempObject.matrix)

        // Set color with opacity based on height
        const opacity = Math.sin(heightRatio * Math.PI) // Fade at top and bottom
        tempColor.set(columnColor)
        particlesRef.current.setColorAt(particleIndex, tempColor)
      }
    })

    particlesRef.current.instanceMatrix.needsUpdate = true
    if (particlesRef.current.instanceColor) {
      particlesRef.current.instanceColor.needsUpdate = true
    }
  })

  if (columnPositions.length === 0) return null

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, totalParticles]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="white"
        emissive={primaryColor}
        emissiveIntensity={3}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  )
}
