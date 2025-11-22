'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface DiagnosticPanelsProps {
  bass: number
  mids: number
  highs: number
  frequencyData: Uint8Array
  theme?: ColorTheme
}

export default function DiagnosticPanels({
  bass,
  mids,
  highs,
  frequencyData,
  theme,
}: DiagnosticPanelsProps) {
  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'

  // Panel positions (floating at edges)
  const panelConfigs = useMemo(
    () => [
      { position: new THREE.Vector3(-45, 15, -20), rotation: [0, Math.PI / 6, 0], type: 'waveform' as const },
      { position: new THREE.Vector3(45, 12, -15), rotation: [0, -Math.PI / 6, 0], type: 'spectrum' as const },
      { position: new THREE.Vector3(0, 20, -50), rotation: [0, 0, 0], type: 'levels' as const },
    ],
    []
  )

  return (
    <group>
      {panelConfigs.map((config, index) => (
        <DiagnosticPanel
          key={index}
          position={config.position}
          rotation={config.rotation}
          type={config.type}
          bass={bass}
          mids={mids}
          highs={highs}
          frequencyData={frequencyData}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      ))}
    </group>
  )
}

// Individual diagnostic panel
function DiagnosticPanel({
  position,
  rotation,
  type,
  bass,
  mids,
  highs,
  frequencyData,
  primaryColor,
  secondaryColor,
}: {
  position: THREE.Vector3
  rotation: number[]
  type: 'waveform' | 'spectrum' | 'levels'
  bass: number
  mids: number
  highs: number
  frequencyData: Uint8Array
  primaryColor: string
  secondaryColor: string
}) {
  const panelRef = useRef<THREE.Group>(null)
  const barsRef = useRef<THREE.InstancedMesh>(null)
  const frameRef = useRef<THREE.LineSegments>(null)

  const barCount = 16
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Gentle floating animation
  useFrame((state) => {
    if (panelRef.current) {
      panelRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 0.5) * 0.5
      panelRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }

    if (!barsRef.current) return

    // Update visualization bars based on type
    for (let i = 0; i < barCount; i++) {
      let height = 0

      if (type === 'spectrum') {
        // Frequency spectrum visualization
        const freqIndex = Math.floor((i / barCount) * (frequencyData.length / 2))
        height = (frequencyData[freqIndex] / 255) * 2
      } else if (type === 'waveform') {
        // Sine wave pattern with audio reactivity
        const phase = (i / barCount) * Math.PI * 2
        height = 0.5 + Math.sin(phase + state.clock.elapsedTime * 2) * bass * 0.5
      } else if (type === 'levels') {
        // Three-level meter (bass, mids, highs)
        if (i < barCount / 3) height = bass * 2
        else if (i < (barCount * 2) / 3) height = mids * 2
        else height = highs * 2
      }

      // Position and scale bars
      const x = (i - barCount / 2) * 0.3
      tempObject.position.set(x, height / 2, 0)
      tempObject.scale.set(0.2, Math.max(0.1, height), 0.1)
      tempObject.updateMatrix()

      barsRef.current.setMatrixAt(i, tempObject.matrix)

      // Color based on height
      const color = height > 1 ? secondaryColor : primaryColor
      barsRef.current.setColorAt(i, tempColor.set(color))
    }

    barsRef.current.instanceMatrix.needsUpdate = true
    if (barsRef.current.instanceColor) {
      barsRef.current.instanceColor.needsUpdate = true
    }

    // Pulse frame glow
    if (frameRef.current) {
      const material = frameRef.current.material as THREE.LineBasicMaterial
      material.opacity = 0.6 + bass * 0.3
    }
  })

  // Corner bracket geometry
  const bracketGeometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    const width = 5
    const height = 3
    const bracketSize = 0.5

    // Create L-shaped brackets at corners
    const corners = [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
      { x: -width / 2, y: height / 2 },
    ]

    corners.forEach((corner) => {
      // Horizontal line
      points.push(new THREE.Vector3(corner.x, corner.y, 0))
      points.push(new THREE.Vector3(corner.x + Math.sign(corner.x || 1) * bracketSize, corner.y, 0))
      // Vertical line
      points.push(new THREE.Vector3(corner.x, corner.y, 0))
      points.push(new THREE.Vector3(corner.x, corner.y + Math.sign(corner.y || 1) * bracketSize, 0))
    })

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [])

  return (
    <group ref={panelRef} position={position.toArray()} rotation={rotation as [number, number, number]}>
      {/* Panel background (translucent) */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing border frame */}
      <lineSegments ref={frameRef} geometry={bracketGeometry}>
        <lineBasicMaterial color={primaryColor} transparent opacity={0.6} linewidth={2} />
      </lineSegments>

      {/* Visualization bars (instanced) */}
      <instancedMesh ref={barsRef} args={[undefined, undefined, barCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="white"
          emissive={primaryColor}
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </instancedMesh>

      {/* Corner accent markers */}
      {[-2.5, 2.5].map((x) =>
        [-1.5, 1.5].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, 0]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial
              color={primaryColor}
              emissive={primaryColor}
              emissiveIntensity={3}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))
      )}
    </group>
  )
}
