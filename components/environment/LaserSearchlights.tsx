'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface LaserSearchlightsProps {
  bass: number
  beatDetected: boolean
  theme?: ColorTheme
}

function LaserBeam({
  position,
  color,
  rotationSpeed,
  heightOffset,
  bass,
  beatDetected
}: {
  position: THREE.Vector3
  color: THREE.Color
  rotationSpeed: number
  heightOffset: number
  bass: number
  beatDetected: boolean
}) {
  const beamRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.SpotLight>(null)

  useFrame((state) => {
    if (!beamRef.current || !lightRef.current) return

    const time = state.clock.elapsedTime

    // Rotate the beam
    beamRef.current.rotation.y = time * rotationSpeed

    // Adjust height based on bass
    const targetY = heightOffset + bass * 15
    beamRef.current.position.y += (targetY - beamRef.current.position.y) * 0.1

    // Intensity pulse on beat
    const baseIntensity = 0.6 + bass * 0.4
    const beatBoost = beatDetected ? 0.3 : 0
    const intensity = baseIntensity + beatBoost

    const mat = beamRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = intensity
    mat.opacity = 0.3 + intensity * 0.2

    // Update spotlight
    lightRef.current.intensity = intensity * 2
    lightRef.current.position.copy(beamRef.current.position)
    lightRef.current.rotation.copy(beamRef.current.rotation)
  })

  return (
    <group position={position}>
      {/* Laser beam cone */}
      <mesh ref={beamRef} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[25, 60, 8, 1, true]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Spotlight for illumination */}
      <spotLight
        ref={lightRef}
        color={color}
        intensity={1}
        angle={Math.PI / 6}
        penumbra={0.5}
        distance={80}
        decay={2}
        castShadow={false}
      />
    </group>
  )
}

export default function LaserSearchlights({
  bass,
  beatDetected,
  theme
}: LaserSearchlightsProps) {
  const beamData = useMemo(() => {
    const beams = []
    const count = 6

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 40 + Math.random() * 20
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      // Colors
      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary),
          new THREE.Color(theme.colors.tertiary)
        ]
        color = colors[Math.floor(Math.random() * colors.length)]
      } else {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      beams.push({
        position: new THREE.Vector3(x, 0, z),
        color,
        rotationSpeed: 0.2 + Math.random() * 0.3,
        heightOffset: 10 + Math.random() * 15
      })
    }

    return beams
  }, [theme])

  return (
    <group>
      {beamData.map((beam, i) => (
        <LaserBeam
          key={i}
          position={beam.position}
          color={beam.color}
          rotationSpeed={beam.rotationSpeed}
          heightOffset={beam.heightOffset}
          bass={bass}
          beatDetected={beatDetected}
        />
      ))}
    </group>
  )
}
