'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface VolumetricLightsProps {
  bass: number
  mids: number
  beatDetected: boolean
  theme?: ColorTheme
}

// Single volumetric light shaft
function LightShaft({
  position,
  color,
  angle,
  length,
  radius,
  bass,
  beatDetected,
  rotationAxis
}: {
  position: THREE.Vector3
  color: THREE.Color
  angle: number
  length: number
  radius: number
  bass: number
  beatDetected: boolean
  rotationAxis: 'x' | 'y' | 'z'
}) {
  const shaftRef = useRef<THREE.Mesh>(null)
  const coneRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!shaftRef.current || !coneRef.current) return

    const time = state.clock.elapsedTime

    // Rotate based on axis
    if (rotationAxis === 'y') {
      shaftRef.current.rotation.y = angle + time * 0.2
      coneRef.current.rotation.y = angle + time * 0.2
    } else if (rotationAxis === 'x') {
      shaftRef.current.rotation.x = angle + time * 0.1
      coneRef.current.rotation.x = angle + time * 0.1
    }

    // Pulsing intensity
    const baseMat = shaftRef.current.material as THREE.MeshStandardMaterial
    const coneMat = coneRef.current.material as THREE.MeshStandardMaterial

    const intensity = 0.5 + bass * 0.3 + Math.sin(time * 2) * 0.2 + (beatDetected ? 0.3 : 0)
    baseMat.emissiveIntensity = intensity
    baseMat.opacity = 0.15 + bass * 0.1 + (beatDetected ? 0.1 : 0)

    coneMat.emissiveIntensity = intensity * 1.5
    coneMat.opacity = 0.25 + bass * 0.15
  })

  return (
    <group position={position}>
      {/* Main volumetric shaft (cylinder) */}
      <mesh ref={shaftRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.5, radius, length, 16, 1, true]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Cone tip for god ray effect */}
      <mesh ref={coneRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -length / 2]}>
        <coneGeometry args={[radius, length * 0.3, 16, 1, true]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export default function VolumetricLights({
  bass,
  mids,
  beatDetected,
  theme
}: VolumetricLightsProps) {
  const lightShafts = useMemo(() => {
    const shafts = []

    // Top-down shafts from sky
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const radius = 30 + Math.random() * 40
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary),
          new THREE.Color(theme.colors.tertiary)
        ]
        color = colors[Math.floor(Math.random() * colors.length)]
      } else {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ffffff']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      shafts.push({
        position: new THREE.Vector3(x, 60, z),
        color,
        angle: angle,
        length: 50,
        radius: 3 + Math.random() * 3,
        rotationAxis: 'y' as const
      })
    }

    // Horizontal shafts from buildings
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2
      const radius = 70
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = 20 + Math.random() * 15

      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary)
        ]
        color = colors[Math.floor(Math.random() * colors.length)]
      } else {
        const colors = ['#00ffff', '#ff00ff']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      shafts.push({
        position: new THREE.Vector3(x, y, z),
        color,
        angle: angle + Math.PI,
        length: 40,
        radius: 2 + Math.random() * 2,
        rotationAxis: 'x' as const
      })
    }

    return shafts
  }, [theme])

  return (
    <group>
      {lightShafts.map((shaft, i) => (
        <LightShaft
          key={i}
          position={shaft.position}
          color={shaft.color}
          angle={shaft.angle}
          length={shaft.length}
          radius={shaft.radius}
          bass={bass}
          beatDetected={beatDetected}
          rotationAxis={shaft.rotationAxis}
        />
      ))}
    </group>
  )
}
