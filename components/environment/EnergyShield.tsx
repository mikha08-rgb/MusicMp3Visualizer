'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface EnergyShieldProps {
  bass: number
  mids: number
  beatDetected: boolean
  theme?: ColorTheme
}

export default function EnergyShield({
  bass,
  mids,
  beatDetected,
  theme
}: EnergyShieldProps) {
  const shieldRef = useRef<THREE.Mesh>(null)
  const hexGridRef = useRef<THREE.LineSegments>(null)
  const pulseRingRef = useRef<THREE.Mesh>(null)

  // Create hexagonal pattern for shield
  const hexPattern = useMemo(() => {
    const geometry = new THREE.EdgesGeometry(
      new THREE.IcosahedronGeometry(45, 2)
    )
    return geometry
  }, [])

  useFrame((state) => {
    if (!shieldRef.current || !hexGridRef.current || !pulseRingRef.current) return

    const time = state.clock.elapsedTime

    // Main shield pulsing
    const pulseFactor = 1 + bass * 0.15 + (beatDetected ? 0.1 : 0)
    shieldRef.current.scale.setScalar(pulseFactor)

    // Shield material animation
    const mat = shieldRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.4 + bass * 0.3 + (beatDetected ? 0.3 : 0)
    mat.opacity = 0.15 + mids * 0.1

    // Rotate hex grid slowly
    hexGridRef.current.rotation.y = time * 0.1
    hexGridRef.current.rotation.x = time * 0.05
    hexGridRef.current.scale.setScalar(pulseFactor)

    // Hex grid opacity
    const hexMat = hexGridRef.current.material as THREE.LineBasicMaterial
    hexMat.opacity = 0.3 + bass * 0.2 + (beatDetected ? 0.2 : 0)

    // Pulse ring animation
    const pulseScale = 1 + Math.sin(time * 2) * 0.1 + bass * 0.2
    pulseRingRef.current.scale.setScalar(pulseScale * pulseFactor)
    pulseRingRef.current.rotation.z = time * 0.3

    const pulseMat = pulseRingRef.current.material as THREE.MeshStandardMaterial
    pulseMat.emissiveIntensity = 0.8 + Math.sin(time * 3) * 0.2 + bass * 0.5
    pulseMat.opacity = 0.4 + Math.sin(time * 2) * 0.2
  })

  const shieldColor = theme ? new THREE.Color(theme.colors.primary) : new THREE.Color('#00ffff')
  const accentColor = theme ? new THREE.Color(theme.colors.secondary) : new THREE.Color('#ff00ff')

  return (
    <group position={[0, 0, 0]}>
      {/* Main shield dome */}
      <mesh ref={shieldRef}>
        <sphereGeometry args={[45, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={shieldColor}
          emissive={shieldColor}
          emissiveIntensity={0.4}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Hexagonal grid pattern */}
      <lineSegments ref={hexGridRef} geometry={hexPattern}>
        <lineBasicMaterial
          color={shieldColor}
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </lineSegments>

      {/* Energy pulse ring at base */}
      <mesh ref={pulseRingRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <ringGeometry args={[43, 45, 64]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.8}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Energy particles around the shield perimeter */}
      <EnergyParticles bass={bass} theme={theme} shieldColor={shieldColor} />
    </group>
  )
}

function EnergyParticles({
  bass,
  theme,
  shieldColor
}: {
  bass: number
  theme?: ColorTheme
  shieldColor: THREE.Color
}) {
  const particlesRef = useRef<THREE.Points>(null)

  const particleData = useMemo(() => {
    const count = 200
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 44 + Math.random() * 2
      const height = Math.random() * 20

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * radius

      colors[i * 3] = shieldColor.r
      colors[i * 3 + 1] = shieldColor.g
      colors[i * 3 + 2] = shieldColor.b

      sizes[i] = 0.3 + Math.random() * 0.5
    }

    return { positions, colors, sizes, count }
  }, [shieldColor])

  useFrame((state) => {
    if (!particlesRef.current) return

    const time = state.clock.elapsedTime
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < particleData.count; i++) {
      const angle = (i / particleData.count) * Math.PI * 2
      const radius = 44 + Math.sin(time * 2 + i) * 1

      positions[i * 3] = Math.cos(angle + time * 0.5) * radius
      positions[i * 3 + 2] = Math.sin(angle + time * 0.5) * radius
      positions[i * 3 + 1] = (Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5) * 20
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true

    const mat = particlesRef.current.material as THREE.PointsMaterial
    mat.opacity = 0.6 + bass * 0.4
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
          />
        <bufferAttribute
            attach="attributes-color"
            args={[particleData.colors, 3]}
          />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color={shieldColor}
        transparent
        opacity={0.6}
        vertexColors
        sizeAttenuation
        toneMapped={false}
        depthWrite={false}
      />
    </points>
  )
}
