'use client'

import { useRef, useMemo, memo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface LayeredRingsProps {
  bass: number
  mids: number
  highs: number
  frequencyData: Uint8Array
  beatDetected: boolean
  isPlaying: boolean
  showParticles?: boolean
  theme?: ColorTheme
}

// Optimized Ring using InstancedMesh for massive performance improvement
function Ring({
  radius,
  barCount,
  frequencySlice,
  colorHueShift,
  rotationSpeed,
  baseColor,
}: {
  radius: number
  barCount: number
  frequencySlice: Uint8Array
  colorHueShift: number
  rotationSpeed: number
  baseColor?: string
}) {
  const groupRef = useRef<THREE.Group>(null)
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)

  // Store scale values for smooth interpolation
  const scalesRef = useRef<Float32Array>(new Float32Array(barCount))

  // Temporary objects for matrix calculations
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Create instance data once
  const instanceData = useMemo(() => {
    const angleStep = (Math.PI * 2) / barCount
    const data = []

    for (let i = 0; i < barCount; i++) {
      const angle = i * angleStep
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      const t = i / barCount
      const hue = (t + colorHueShift) % 1

      // Create vibrant color
      const color = baseColor
        ? new THREE.Color(baseColor)
        : new THREE.Color().setHSL(hue, 0.9, 0.7)

      data.push({
        position: new THREE.Vector3(x, 0, z),
        rotation: new THREE.Euler(0, -angle, 0),
        hue,
        color,
      })
    }

    return data
  }, [barCount, radius, colorHueShift, baseColor])

  // Initialize instance matrices and colors
  useEffect(() => {
    if (!instancedMeshRef.current) return

    instanceData.forEach((data, i) => {
      tempObject.position.copy(data.position)
      tempObject.rotation.copy(data.rotation)
      tempObject.scale.set(1, 1, 1)
      tempObject.updateMatrix()

      instancedMeshRef.current!.setMatrixAt(i, tempObject.matrix)
      instancedMeshRef.current!.setColorAt(i, data.color)
    })

    instancedMeshRef.current.instanceMatrix.needsUpdate = true
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true
    }
  }, [instanceData, tempObject])

  useFrame((state, delta) => {
    if (!groupRef.current || !instancedMeshRef.current) return

    // Rotate the ring
    if (rotationSpeed !== 0) {
      groupRef.current.rotation.y += delta * rotationSpeed
    }

    // Update bar heights based on frequency data
    let needsUpdate = false

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * frequencySlice.length)
      const frequencyValue = frequencySlice[dataIndex] || 0

      // Normalize frequency value to scale
      const targetScale = 0.5 + (frequencyValue / 255) * 4.5

      // Smooth transition
      const currentScale = scalesRef.current[i] || 1
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.3)
      scalesRef.current[i] = newScale

      // Update instance matrix
      const data = instanceData[i]
      tempObject.position.copy(data.position)
      tempObject.position.y = newScale / 2
      tempObject.rotation.copy(data.rotation)
      tempObject.scale.set(1, newScale, 1)
      tempObject.updateMatrix()

      instancedMeshRef.current.setMatrixAt(i, tempObject.matrix)
      needsUpdate = true
    }

    if (needsUpdate) {
      instancedMeshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, barCount]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshBasicMaterial
          color="white"
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}

const CentralOrb = memo(function CentralOrb({
  bass,
  beatDetected,
  color = '#ff6b6b',
  emissiveColor = '#ff3333'
}: {
  bass: number
  beatDetected: boolean
  color?: string
  emissiveColor?: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Pulse with bass
    const targetScale = 1 + bass * 1.5
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.2)
    )

    // Rotation
    meshRef.current.rotation.y += delta * 0.5
    meshRef.current.rotation.x += delta * 0.3

    // Beat flash - reduced intensity
    const material = meshRef.current.material as THREE.MeshStandardMaterial
    if (beatDetected) {
      material.emissiveIntensity = 1.2
    } else {
      material.emissiveIntensity = THREE.MathUtils.lerp(
        material.emissiveIntensity,
        0.6,
        0.15
      )
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={0.8}
        roughness={0.3}
        metalness={0.7}
        toneMapped={false}
      />
    </mesh>
  )
})

// Optimized particles using InstancedMesh
function BackgroundParticles({ highs, color = '#4ecdc4' }: { highs: number; color?: string }) {
  const particleCount = 500
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(color), [color])

  // Initialize particle positions once
  const particlePositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < particleCount; i++) {
      positions.push(new THREE.Vector3(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 50
      ))
    }
    return positions
  }, [])

  // Initialize instances
  useEffect(() => {
    if (!instancedMeshRef.current) return

    particlePositions.forEach((position, i) => {
      tempObject.position.copy(position)
      tempObject.scale.setScalar(0.08)
      tempObject.updateMatrix()

      instancedMeshRef.current!.setMatrixAt(i, tempObject.matrix)
      instancedMeshRef.current!.setColorAt(i, tempColor)
    })

    instancedMeshRef.current.instanceMatrix.needsUpdate = true
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true
    }
  }, [particlePositions, tempObject, tempColor])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    groupRef.current.rotation.y += delta * 0.05

    // Scale with highs
    const targetScale = 1 + highs * 0.5
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1)
    )
  })

  return (
    <group ref={groupRef}>
      <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, particleCount]}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4 + highs * 0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}

export default function LayeredRings({
  bass,
  mids,
  highs,
  frequencyData,
  beatDetected,
  isPlaying,
  showParticles = true,
  theme
}: LayeredRingsProps) {
  // Split frequency data for different rings
  const bassData = useMemo(() => {
    const third = Math.floor(frequencyData.length / 3)
    return frequencyData.slice(0, third)
  }, [frequencyData])

  const midsData = useMemo(() => {
    const third = Math.floor(frequencyData.length / 3)
    return frequencyData.slice(third, third * 2)
  }, [frequencyData])

  const highsData = useMemo(() => {
    const third = Math.floor(frequencyData.length / 3)
    return frequencyData.slice(third * 2)
  }, [frequencyData])

  return (
    <group>
      {/* Background particles */}
      {showParticles && (
        <BackgroundParticles
          highs={highs}
          color={theme?.colors.particles}
        />
      )}

      {/* Central orb */}
      <CentralOrb
        bass={bass}
        beatDetected={beatDetected}
        color={theme?.colors.orb}
        emissiveColor={theme?.colors.orbEmissive}
      />

      {/* Inner ring - bass frequencies */}
      <Ring
        radius={5}
        barCount={32}
        frequencySlice={bassData}
        colorHueShift={0}
        rotationSpeed={isPlaying ? 0.1 : 0}
        baseColor={theme?.colors.primary}
      />

      {/* Middle ring - mid frequencies */}
      <Ring
        radius={10}
        barCount={48}
        frequencySlice={midsData}
        colorHueShift={0.33}
        rotationSpeed={isPlaying ? -0.15 : 0}
        baseColor={theme?.colors.secondary}
      />

      {/* Outer ring - high frequencies */}
      <Ring
        radius={15}
        barCount={64}
        frequencySlice={highsData}
        colorHueShift={0.66}
        rotationSpeed={isPlaying ? 0.08 : 0}
        baseColor={theme?.colors.tertiary}
      />
    </group>
  )
}
