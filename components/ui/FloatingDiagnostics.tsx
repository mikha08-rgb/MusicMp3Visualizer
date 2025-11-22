'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { ColorTheme } from '@/lib/themes'

interface FloatingDiagnosticsProps {
  bass: number
  mids: number
  highs: number
  frequencyData: Uint8Array
  theme?: ColorTheme
}

// Individual diagnostic panel
function DiagnosticPanel({
  position,
  rotation,
  color,
  bass,
  mids,
  highs,
  panelType,
}: {
  position: THREE.Vector3
  rotation: number
  color: string
  bass: number
  mids: number
  highs: number
  panelType: 'waveform' | 'frequency' | 'status'
}) {
  const panelRef = useRef<THREE.Group>(null)
  const barsRef = useRef<THREE.InstancedMesh>(null)

  // Number of bars for visualizations
  const barCount = 16

  useFrame((state) => {
    if (!panelRef.current) return

    const time = state.clock.elapsedTime

    // Slow rotation
    panelRef.current.rotation.y += 0.002

    // Gentle floating motion
    panelRef.current.position.y = position.y + Math.sin(time * 0.5) * 0.3

    // Update visualization bars based on panel type
    if (barsRef.current) {
      const tempObject = new THREE.Object3D()

      for (let i = 0; i < barCount; i++) {
        let height = 0

        if (panelType === 'waveform') {
          // Sine wave pattern
          height = Math.sin(i * 0.5 + time * 2) * 0.5 + 0.5
        } else if (panelType === 'frequency') {
          // Frequency spectrum simulation
          const freq = i < 5 ? bass : i < 10 ? mids : highs
          height = freq + Math.random() * 0.1
        } else {
          // Status bars
          height = (i / barCount) * (bass + mids + highs) / 3
        }

        const x = (i - barCount / 2) * 0.15
        const y = height * 0.5

        tempObject.position.set(x, y, 0.01)
        tempObject.scale.set(0.1, height, 0.05)
        tempObject.updateMatrix()

        barsRef.current.setMatrixAt(i, tempObject.matrix)
      }

      barsRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={panelRef} position={position} rotation={[0, rotation, 0]}>
      {/* Panel frame */}
      <mesh>
        <boxGeometry args={[3, 2, 0.05]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.7}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Glowing edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(3, 2, 0.05)]} />
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>

      {/* Title text */}
      <Text
        position={[0, 0.8, 0.05]}
        fontSize={0.15}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {panelType === 'waveform'
          ? 'WAVEFORM'
          : panelType === 'frequency'
            ? 'SPECTRUM'
            : 'STATUS'}
      </Text>

      {/* Visualization bars */}
      <instancedMesh ref={barsRef} args={[undefined, undefined, barCount]}>
        <boxGeometry />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </instancedMesh>

      {/* Corner accents */}
      {[
        [-1.4, 0.9],
        [1.4, 0.9],
        [-1.4, -0.9],
        [1.4, -0.9],
      ].map(([x, y], i) => (
        <mesh key={`corner-${i}`} position={[x, y, 0.06]}>
          <boxGeometry args={[0.1, 0.1, 0.02]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={3}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function FloatingDiagnostics({
  bass,
  mids,
  highs,
  frequencyData,
  theme,
}: FloatingDiagnosticsProps) {
  const groupRef = useRef<THREE.Group>(null)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  const panels = useMemo(
    () => [
      {
        position: new THREE.Vector3(-35, 15, -20),
        rotation: Math.PI / 6,
        color: primaryColor,
        type: 'waveform' as const,
      },
      {
        position: new THREE.Vector3(35, 15, -20),
        rotation: -Math.PI / 6,
        color: secondaryColor,
        type: 'frequency' as const,
      },
      {
        position: new THREE.Vector3(-35, 15, 20),
        rotation: -Math.PI / 6,
        color: tertiaryColor,
        type: 'status' as const,
      },
      {
        position: new THREE.Vector3(35, 15, 20),
        rotation: Math.PI / 6,
        color: primaryColor,
        type: 'frequency' as const,
      },
    ],
    [primaryColor, secondaryColor, tertiaryColor]
  )

  return (
    <group ref={groupRef}>
      {panels.map((panel, index) => (
        <DiagnosticPanel
          key={`panel-${index}`}
          position={panel.position}
          rotation={panel.rotation}
          color={panel.color}
          bass={bass}
          mids={mids}
          highs={highs}
          panelType={panel.type}
        />
      ))}
    </group>
  )
}
