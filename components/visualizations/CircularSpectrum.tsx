'use client'

import { useRef, useMemo, memo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface CircularSpectrumProps {
  bass: number
  mids: number
  highs: number
  frequencyData: Uint8Array
  beatDetected: boolean
  isPlaying: boolean
  showParticles?: boolean
  theme?: ColorTheme
}

// Central pulsing sphere
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

    const targetScale = 1 + bass * 1.5
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.2)
    )

    meshRef.current.rotation.y += delta * 0.5
    meshRef.current.rotation.x += delta * 0.3

    const material = meshRef.current.material as THREE.MeshStandardMaterial
    if (beatDetected) {
      material.emissiveIntensity = 1.5
    } else {
      material.emissiveIntensity = THREE.MathUtils.lerp(
        material.emissiveIntensity,
        0.8,
        0.15
      )
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 32, 32]} />
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

// Circular spectrum bars
function SpectrumBars({
  frequencyData,
  radius,
  isPlaying,
  theme
}: {
  frequencyData: Uint8Array
  radius: number
  isPlaying: boolean
  theme?: ColorTheme
}) {
  const barCount = 128
  const groupRef = useRef<THREE.Group>(null)
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const scalesRef = useRef<Float32Array>(new Float32Array(barCount))

  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  const instanceData = useMemo(() => {
    const angleStep = (Math.PI * 2) / barCount
    const data = []

    for (let i = 0; i < barCount; i++) {
      const angle = i * angleStep
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      const t = i / barCount
      const color = theme
        ? new THREE.Color(theme.colors.primary).lerp(
            new THREE.Color(theme.colors.tertiary),
            t
          )
        : new THREE.Color().setHSL(t, 0.9, 0.6)

      data.push({
        position: new THREE.Vector3(x, 0, z),
        rotation: new THREE.Euler(0, -angle, 0),
        color,
      })
    }

    return data
  }, [barCount, radius, theme])

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

    if (isPlaying) {
      groupRef.current.rotation.y += delta * 0.1
    }

    let needsUpdate = false

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * frequencyData.length)
      const frequencyValue = frequencyData[dataIndex] || 0

      const targetScale = 0.5 + (frequencyValue / 255) * 8

      const currentScale = scalesRef.current[i] || 1
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.25)
      scalesRef.current[i] = newScale

      const data = instanceData[i]
      tempObject.position.copy(data.position)
      tempObject.position.y = newScale / 2
      tempObject.rotation.copy(data.rotation)
      tempObject.scale.set(0.5, newScale, 0.5)
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
        <meshStandardMaterial
          color="white"
          toneMapped={false}
          emissive={theme?.colors.primary || '#ffffff'}
          emissiveIntensity={0.3}
        />
      </instancedMesh>
    </group>
  )
}

// Floating particles
function FloatingParticles({ highs, color = '#4ecdc4' }: { highs: number; color?: string }) {
  const particleCount = 300
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(color), [color])

  const particlePositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const radius = 15 + Math.random() * 10
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = (Math.random() - 0.5) * 20

      positions.push(new THREE.Vector3(x, y, z))
    }
    return positions
  }, [])

  useEffect(() => {
    if (!instancedMeshRef.current) return

    particlePositions.forEach((position, i) => {
      tempObject.position.copy(position)
      tempObject.scale.setScalar(0.1)
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

    const targetScale = 1 + highs * 0.6
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
          opacity={0.5 + highs * 0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}

export default function CircularSpectrum({
  bass,
  mids,
  highs,
  frequencyData,
  beatDetected,
  isPlaying,
  showParticles = true,
  theme
}: CircularSpectrumProps) {
  return (
    <group>
      {showParticles && (
        <FloatingParticles
          highs={highs}
          color={theme?.colors.particles}
        />
      )}

      <CentralOrb
        bass={bass}
        beatDetected={beatDetected}
        color={theme?.colors.orb}
        emissiveColor={theme?.colors.orbEmissive}
      />

      <SpectrumBars
        frequencyData={frequencyData}
        radius={10}
        isPlaying={isPlaying}
        theme={theme}
      />
    </group>
  )
}
