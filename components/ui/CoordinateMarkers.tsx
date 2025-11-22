'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface CoordinateMarkersProps {
  bass: number
  mids: number
  theme?: ColorTheme
}

export default function CoordinateMarkers({ bass, mids, theme }: CoordinateMarkersProps) {
  const groupRef = useRef<THREE.Group>(null)
  const statusIndicatorsRef = useRef<THREE.InstancedMesh>(null)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  // Grid positions for L-bracket markers
  const gridMarkerPositions = useMemo(() => {
    const positions: { pos: THREE.Vector3; rotation: number }[] = []
    const gridSize = 60
    const step = 20

    // Grid markers at regular intervals
    for (let x = -gridSize; x <= gridSize; x += step) {
      for (let z = -gridSize; z <= gridSize; z += step) {
        // Skip center area (too cluttered)
        if (Math.abs(x) < step && Math.abs(z) < step) continue

        positions.push({
          pos: new THREE.Vector3(x, 0.3, z),
          rotation: Math.random() * Math.PI * 2,
        })
      }
    }

    return positions
  }, [])

  // Orbiting status indicators
  const statusIndicatorCount = 4
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  useFrame((state) => {
    if (!statusIndicatorsRef.current) return

    const time = state.clock.elapsedTime
    const orbitRadius = 35

    for (let i = 0; i < statusIndicatorCount; i++) {
      const angle = (i / statusIndicatorCount) * Math.PI * 2 + time * 0.5
      const x = Math.cos(angle) * orbitRadius
      const z = Math.sin(angle) * orbitRadius
      const y = 15 + Math.sin(time * 2 + i) * 2

      tempObject.position.set(x, y, z)
      tempObject.scale.setScalar(0.3 + bass * 0.2)
      tempObject.updateMatrix()

      statusIndicatorsRef.current.setMatrixAt(i, tempObject.matrix)

      // Alternate colors
      const color = i % 2 === 0 ? primaryColor : secondaryColor
      statusIndicatorsRef.current.setColorAt(i, tempColor.set(color))
    }

    statusIndicatorsRef.current.instanceMatrix.needsUpdate = true
    if (statusIndicatorsRef.current.instanceColor) {
      statusIndicatorsRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      {/* Grid coordinate markers (L-shaped brackets) */}
      {gridMarkerPositions.slice(0, 20).map((marker, index) => (
        <LBracketMarker
          key={index}
          position={marker.pos}
          rotation={marker.rotation}
          color={index % 3 === 0 ? primaryColor : index % 3 === 1 ? tertiaryColor : secondaryColor}
          bass={bass}
        />
      ))}

      {/* Orbiting status indicators */}
      <instancedMesh ref={statusIndicatorsRef} args={[undefined, undefined, statusIndicatorCount]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="white"
          emissive={primaryColor}
          emissiveIntensity={3}
          transparent
          opacity={0.8}
        />
      </instancedMesh>

      {/* Corner "active zone" indicators (glowing pips) */}
      {[-45, 45].map((x) =>
        [-45, 45].map((z) => (
          <GlowingPip
            key={`${x}-${z}`}
            position={new THREE.Vector3(x, 5, z)}
            color={tertiaryColor}
            bass={bass}
          />
        ))
      )}
    </group>
  )
}

// L-shaped bracket marker
function LBracketMarker({
  position,
  rotation,
  color,
  bass,
}: {
  position: THREE.Vector3
  rotation: number
  color: string
  bass: number
}) {
  const bracketRef = useRef<THREE.LineSegments>(null)

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    const size = 0.6

    // L-shape
    points.push(new THREE.Vector3(-size / 2, 0, -size / 2))
    points.push(new THREE.Vector3(size / 2, 0, -size / 2))
    points.push(new THREE.Vector3(-size / 2, 0, -size / 2))
    points.push(new THREE.Vector3(-size / 2, 0, size / 2))

    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  useFrame(() => {
    if (!bracketRef.current) return

    const material = bracketRef.current.material as THREE.LineBasicMaterial
    material.opacity = 0.5 + bass * 0.3
  })

  return (
    <lineSegments
      ref={bracketRef}
      position={position.toArray()}
      rotation={[0, rotation, 0]}
      geometry={geometry}
    >
      <lineBasicMaterial color={color} transparent opacity={0.5} linewidth={1} />
    </lineSegments>
  )
}

// Glowing pip indicator
function GlowingPip({ position, color, bass }: { position: THREE.Vector3; color: string; bass: number }) {
  const pipRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!pipRef.current) return

    // Pulse
    const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3 + bass * 0.5
    pipRef.current.scale.setScalar(scale)

    const material = pipRef.current.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = 3 + bass * 2
  })

  return (
    <mesh ref={pipRef} position={position.toArray()}>
      <sphereGeometry args={[0.4, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}
