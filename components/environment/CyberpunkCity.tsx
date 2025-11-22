'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface CyberpunkCityProps {
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  theme?: ColorTheme
}

// Individual detailed building component
function DetailedBuilding({
  position,
  width,
  depth,
  height,
  color,
  pulsePhase,
  bass,
  mids,
  beatDetected,
  theme
}: {
  position: THREE.Vector3
  width: number
  depth: number
  height: number
  color: THREE.Color
  pulsePhase: number
  bass: number
  mids: number
  beatDetected: boolean
  theme?: ColorTheme
}) {
  const buildingRef = useRef<THREE.Group>(null)
  const windowsRef = useRef<THREE.InstancedMesh>(null)
  const neonAccentRef = useRef<THREE.Mesh>(null)

  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Generate window positions
  const windowData = useMemo(() => {
    const windows = []
    const windowsPerFloor = Math.floor(width / 1.2) * Math.floor(depth / 1.2)
    const floors = Math.floor(height / 3.5)
    const windowCount = Math.min(windowsPerFloor * floors, 80) // Reduced for performance

    for (let i = 0; i < windowCount; i++) {
      const floor = Math.floor(i / windowsPerFloor)
      const windowInFloor = i % windowsPerFloor
      const windowsWide = Math.floor(width / 0.8)

      const col = windowInFloor % windowsWide
      const row = Math.floor(windowInFloor / windowsWide)

      const x = (col - windowsWide / 2) * 1.2
      const y = floor * 3.5 + 1.5
      const z = (row - Math.floor(depth / 1.2) / 2) * 1.2

      windows.push({
        position: new THREE.Vector3(x, y, z),
        lit: Math.random() > 0.3 // 70% of windows are lit
      })
    }

    return windows
  }, [width, depth, height])

  // Initialize windows
  useEffect(() => {
    if (!windowsRef.current) return

    windowData.forEach((window, i) => {
      tempObject.position.copy(window.position)
      tempObject.scale.set(0.3, 0.4, 0.3)
      tempObject.updateMatrix()
      windowsRef.current!.setMatrixAt(i, tempObject.matrix)

      if (window.lit) {
        tempColor.set('#ffff80') // Warm yellow light
      } else {
        tempColor.set('#000000')
      }
      windowsRef.current!.setColorAt(i, tempColor)
    })

    windowsRef.current.instanceMatrix.needsUpdate = true
    if (windowsRef.current.instanceColor) {
      windowsRef.current.instanceColor.needsUpdate = true
    }
  }, [windowData, tempObject, tempColor])

  useFrame((state) => {
    if (!buildingRef.current || !windowsRef.current || !neonAccentRef.current) return

    const time = state.clock.elapsedTime

    // Pulse building slightly with bass
    const pulseFactor = 1 + bass * 0.05 * Math.sin(time * 2 + pulsePhase)
    buildingRef.current.scale.y = pulseFactor

    // Animate neon accent intensity
    const neonIntensity = 0.5 + mids * 0.5 + (beatDetected ? 0.5 : 0)
    const neonMat = neonAccentRef.current.material as THREE.MeshStandardMaterial
    neonMat.emissiveIntensity = neonIntensity

    // Flicker random windows (less frequently)
    if (Math.random() > 0.99) {
      const randomWindow = Math.floor(Math.random() * windowData.length)
      const window = windowData[randomWindow]
      if (window.lit) {
        const flickerIntensity = 0.5 + Math.random() * 0.5
        tempColor.set('#ffff80').multiplyScalar(flickerIntensity)
        windowsRef.current.setColorAt(randomWindow, tempColor)
        if (windowsRef.current.instanceColor) {
          windowsRef.current.instanceColor.needsUpdate = true
        }
      }
    }
  })

  return (
    <group ref={buildingRef} position={position}>
      {/* Main building body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color="#0a0a1a"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Windows - instanced */}
      <instancedMesh
        ref={windowsRef}
        args={[undefined, undefined, windowData.length]}
        castShadow={false}
      >
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial
          color="white"
          emissive="#ffff80"
          emissiveIntensity={1}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Neon accent strip at top */}
      <mesh ref={neonAccentRef} position={[0, height / 2 + 0.2, 0]}>
        <boxGeometry args={[width + 0.2, 0.3, depth + 0.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Wireframe edge glow - simplified */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width * 1.01, height * 1.01, depth * 1.01)]} />
        <lineBasicMaterial color={color} transparent opacity={0.2} />
      </lineSegments>
    </group>
  )
}

export default function CyberpunkCity({
  bass,
  mids,
  highs,
  beatDetected,
  theme
}: CyberpunkCityProps) {
  const buildingCount = 24 // Optimized for performance with detailed buildings

  // Building data: position, size, base height, color
  const buildingData = useMemo(() => {
    const buildings = []
    const cityRadius = 45
    const rings = 3
    const buildingsPerRing = buildingCount / rings

    for (let ring = 0; ring < rings; ring++) {
      const radius = cityRadius + ring * 25
      const count = Math.floor(buildingsPerRing)

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

        // Varying building dimensions
        const width = 4 + Math.random() * 5
        const depth = 4 + Math.random() * 5
        const baseHeight = 10 + Math.random() * 30 + ring * 15

        // Neon colors - cyan, magenta, purple, blue
        let color: THREE.Color
        if (theme) {
          const colors = [
            new THREE.Color(theme.colors.primary),
            new THREE.Color(theme.colors.secondary),
            new THREE.Color(theme.colors.tertiary)
          ]
          color = colors[Math.floor(Math.random() * colors.length)]
        } else {
          const colors = ['#00ffff', '#ff00ff', '#8b00ff', '#0080ff']
          color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
        }

        buildings.push({
          position: new THREE.Vector3(x, baseHeight / 2, z),
          width,
          depth,
          baseHeight,
          color,
          pulsePhase: Math.random() * Math.PI * 2
        })
      }
    }

    return buildings
  }, [buildingCount, theme])

  return (
    <group>
      {buildingData.map((building, i) => (
        <DetailedBuilding
          key={i}
          position={building.position}
          width={building.width}
          depth={building.depth}
          height={building.baseHeight}
          color={building.color}
          pulsePhase={building.pulsePhase}
          bass={bass}
          mids={mids}
          beatDetected={beatDetected}
          theme={theme}
        />
      ))}
    </group>
  )
}
