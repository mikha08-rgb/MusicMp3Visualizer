'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface SkyPlatformsProps {
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  theme?: ColorTheme
}

interface PlatformRefs {
  platformRef: React.RefObject<THREE.Group>
  beamRef: React.RefObject<THREE.Mesh>
  lightRingRef: React.RefObject<THREE.Mesh>
  energyFieldRef: React.RefObject<THREE.Mesh>
  pulsePhase: number
  height: number
}

function SkyPlatform({
  position,
  size,
  color,
  hasBeam,
  onMount
}: {
  position: THREE.Vector3
  size: number
  color: THREE.Color
  hasBeam: boolean
  onMount: (refs: PlatformRefs) => void
}) {
  const platformRef = useRef<THREE.Group>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const lightRingRef = useRef<THREE.Mesh>(null)
  const energyFieldRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (platformRef.current && beamRef.current && lightRingRef.current && energyFieldRef.current) {
      onMount({
        platformRef,
        beamRef,
        lightRingRef,
        energyFieldRef,
        pulsePhase: position.x + position.z,
        height: position.y
      })
    }
  }, [])

  return (
    <group ref={platformRef} position={position}>
      {/* Main platform structure */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[size, size, 0.5, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Landing pad markings */}
      <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 0.3, size * 0.4, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 0.6, size * 0.65, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>

      {/* Edge lights */}
      <mesh ref={lightRingRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 0.95, size, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      {/* Support struts */}
      <mesh position={[size * 0.7, -0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-size * 0.7, -0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.5, size * 0.7]}>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.5, -size * 0.7]}>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Energy field above platform */}
      <mesh ref={energyFieldRef} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[size * 0.5, size * 0.5, 2, 16, 1, true]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Vertical light beam */}
      {hasBeam && (
        <mesh ref={beamRef} position={[0, 30, 0]}>
          <cylinderGeometry args={[0.5, 0.8, 60, 16, 1, true]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Single platform light - removed individual corner lights for performance */}
      <pointLight position={[0, 1, 0]} color={color} intensity={3} distance={15} decay={2} />

      {/* Holographic platform number */}
      <mesh position={[0, 0.3, 0]}>
        <planeGeometry args={[size * 0.5, size * 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function SkyPlatforms({
  bass,
  mids,
  highs,
  beatDetected,
  theme
}: SkyPlatformsProps) {
  const platformRefsArray = useRef<PlatformRefs[]>([])

  const platformData = useMemo(() => {
    const platforms = []
    const count = 8

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 50 + (i % 2) * 20
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = 35 + (i % 3) * 10

      const size = 3 + Math.random() * 2
      const hasBeam = i % 2 === 0 // Every other platform has a beam

      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary),
          new THREE.Color(theme.colors.tertiary)
        ]
        color = colors[i % colors.length]
      } else {
        const colors = ['#00ffff', '#ff00ff', '#ffff00']
        color = new THREE.Color(colors[i % colors.length])
      }

      platforms.push({
        position: new THREE.Vector3(x, y, z),
        size,
        color,
        hasBeam
      })
    }

    return platforms
  }, [theme])

  const handlePlatformMount = (index: number) => (refs: PlatformRefs) => {
    platformRefsArray.current[index] = refs
  }

  // Single useFrame for all platforms
  useFrame((state) => {
    const time = state.clock.elapsedTime

    platformRefsArray.current.forEach((refs) => {
      if (!refs?.platformRef.current || !refs.beamRef.current || !refs.lightRingRef.current || !refs.energyFieldRef.current) return

      // Gentle rotation
      refs.platformRef.current.rotation.y = time * 0.2 + refs.pulsePhase

      // Hover oscillation
      const hoverBob = Math.sin(time * 0.8 + refs.pulsePhase) * 0.5
      refs.platformRef.current.position.y = refs.height + hoverBob + bass * 1.5

      // Light ring pulse
      const lightRingMat = refs.lightRingRef.current.material as THREE.MeshStandardMaterial
      lightRingMat.emissiveIntensity = 1.2 + Math.sin(time * 3 + refs.pulsePhase) * 0.3 + mids * 0.5

      // Energy field pulse
      const energyFieldMat = refs.energyFieldRef.current.material as THREE.MeshStandardMaterial
      energyFieldMat.emissiveIntensity = 0.4 + highs * 0.6
      energyFieldMat.opacity = 0.2 + highs * 0.3

      // Rotate energy field
      refs.energyFieldRef.current.rotation.y = time * 1.5

      // Beam intensity and animation
      if (refs.beamRef.current.material instanceof THREE.MeshStandardMaterial) {
        const beamMat = refs.beamRef.current.material
        beamMat.emissiveIntensity = 1 + Math.sin(time * 2 + refs.pulsePhase) * 0.5 + bass * 0.8
        beamMat.opacity = 0.15 + highs * 0.1

        // Beam rotation
        refs.beamRef.current.rotation.y = time * 0.5
      }

      // Beat reaction - expand
      if (beatDetected) {
        refs.platformRef.current.scale.setScalar(1.1)
      } else {
        refs.platformRef.current.scale.setScalar(1.0)
      }
    })
  })

  return (
    <group>
      {platformData.map((platform, i) => (
        <SkyPlatform
          key={i}
          position={platform.position}
          size={platform.size}
          color={platform.color}
          hasBeam={platform.hasBeam}
          onMount={handlePlatformMount(i)}
        />
      ))}
    </group>
  )
}
