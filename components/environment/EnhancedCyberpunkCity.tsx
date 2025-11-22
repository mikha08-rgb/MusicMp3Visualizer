'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface EnhancedCyberpunkCityProps {
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  theme?: ColorTheme
}

type BuildingShape = 'box' | 'cylinder' | 'pyramid' | 'stepped'

// Building refs interface for centralized animation
interface BuildingRefs {
  buildingRef: React.RefObject<THREE.Group>
  windowsRef: React.RefObject<THREE.InstancedMesh>
  neonAccentRef: React.RefObject<THREE.Mesh>
  signageRef: React.RefObject<THREE.Mesh>
  windowData: Array<{ position: THREE.Vector3; lit: boolean; isBalcony: boolean }>
}

// Individual enhanced building with varied architecture
function EnhancedBuilding({
  position,
  width,
  depth,
  height,
  color,
  pulsePhase,
  shape,
  onMount
}: {
  position: THREE.Vector3
  width: number
  depth: number
  height: number
  color: THREE.Color
  pulsePhase: number
  shape: BuildingShape
  onMount: (refs: BuildingRefs) => void
}) {
  const buildingRef = useRef<THREE.Group>(null)
  const windowsRef = useRef<THREE.InstancedMesh>(null)
  const neonAccentRef = useRef<THREE.Mesh>(null)
  const signageRef = useRef<THREE.Mesh>(null)

  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Generate window positions based on building shape
  const windowData = useMemo(() => {
    const windows = []
    const floors = Math.floor(height / 3.5)
    let windowCount = 0

    if (shape === 'box') {
      // Windows on 4 faces
      const windowsPerSide = Math.floor(Math.max(width, depth) / 1.5)
      windowCount = Math.min(windowsPerSide * floors * 4, 120)

      for (let i = 0; i < windowCount; i++) {
        const floor = i % floors
        const side = Math.floor((i / floors) % 4)
        const posOnSide = Math.floor(i / (floors * 4))

        let x = 0, z = 0
        const y = floor * 3.5 + 1.5

        switch (side) {
          case 0: x = width / 2 - 0.1; z = (posOnSide - windowsPerSide / 2) * 1.5; break
          case 1: x = -width / 2 + 0.1; z = (posOnSide - windowsPerSide / 2) * 1.5; break
          case 2: z = depth / 2 - 0.1; x = (posOnSide - windowsPerSide / 2) * 1.5; break
          case 3: z = -depth / 2 + 0.1; x = (posOnSide - windowsPerSide / 2) * 1.5; break
        }

        windows.push({
          position: new THREE.Vector3(x, y, z),
          lit: Math.random() > 0.25,
          isBalcony: Math.random() > 0.85
        })
      }
    } else if (shape === 'cylinder') {
      // Circular windows
      const windowsPerFloor = 12
      windowCount = Math.min(windowsPerFloor * floors, 100)

      for (let i = 0; i < windowCount; i++) {
        const floor = i % floors
        const anglePos = Math.floor(i / floors)
        const angle = (anglePos / windowsPerFloor) * Math.PI * 2
        const radius = width / 2 - 0.2

        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = floor * 3.5 + 1.5

        windows.push({
          position: new THREE.Vector3(x, y, z),
          lit: Math.random() > 0.25,
          isBalcony: Math.random() > 0.9
        })
      }
    }

    return windows
  }, [width, depth, height, shape])

  // Initialize windows
  useEffect(() => {
    if (!windowsRef.current || windowData.length === 0) return

    windowData.forEach((window, i) => {
      tempObject.position.copy(window.position)
      tempObject.scale.set(window.isBalcony ? 0.5 : 0.3, 0.4, 0.3)
      tempObject.updateMatrix()
      windowsRef.current!.setMatrixAt(i, tempObject.matrix)

      if (window.lit) {
        tempColor.set(window.isBalcony ? '#ffaa00' : '#ffff80')
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

  // Report refs to parent for centralized animation
  useEffect(() => {
    if (buildingRef.current && neonAccentRef.current && signageRef.current) {
      onMount({
        buildingRef,
        windowsRef,
        neonAccentRef,
        signageRef,
        windowData
      })
    }
  }, [])

  // Render different building shapes
  const renderBuilding = () => {
    switch (shape) {
      case 'cylinder':
        return (
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[width / 2, width / 2, height, 16]} />
            <meshStandardMaterial color="#0a0a1a" roughness={0.2} metalness={0.9} />
          </mesh>
        )
      case 'pyramid':
        return (
          <mesh castShadow receiveShadow>
            <coneGeometry args={[width, height, 4]} />
            <meshStandardMaterial color="#0a0a1a" roughness={0.2} metalness={0.9} />
          </mesh>
        )
      case 'stepped':
        return (
          <>
            <mesh castShadow receiveShadow position={[0, -height / 4, 0]}>
              <boxGeometry args={[width * 1.2, height / 2, depth * 1.2]} />
              <meshStandardMaterial color="#0a0a1a" roughness={0.2} metalness={0.9} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, height / 4, 0]}>
              <boxGeometry args={[width * 0.8, height / 2, depth * 0.8]} />
              <meshStandardMaterial color="#0a0a1a" roughness={0.2} metalness={0.9} />
            </mesh>
          </>
        )
      default: // box
        return (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color="#0a0a1a" roughness={0.2} metalness={0.9} />
          </mesh>
        )
    }
  }

  return (
    <group ref={buildingRef} position={position}>
      {/* Main building body */}
      {renderBuilding()}

      {/* Windows */}
      {windowData.length > 0 && (
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
      )}

      {/* Neon accent at top */}
      <mesh ref={neonAccentRef} position={[0, height / 2 + 0.2, 0]}>
        <boxGeometry args={[width + 0.2, 0.3, depth + 0.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Rooftop details */}
      <group position={[0, height / 2, 0]}>
        {/* Antenna */}
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
        {/* Antenna light */}
        <mesh position={[0, 4.2, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
        <pointLight position={[0, 4.2, 0]} color={color} intensity={2} distance={10} />
      </group>

      {/* Neon signage on building side */}
      <mesh
        ref={signageRef}
        position={[0, height * 0.7, shape === 'cylinder' ? width / 2 : depth / 2 + 0.1]}
        rotation={shape === 'cylinder' ? [0, 0, 0] : [0, 0, 0]}
      >
        <planeGeometry args={[width * 0.6, height * 0.15]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function EnhancedCyberpunkCity({
  bass,
  mids,
  highs,
  beatDetected,
  theme
}: EnhancedCyberpunkCityProps) {
  const buildingCount = 28
  const buildingRefsArray = useRef<Array<BuildingRefs & { pulsePhase: number; tempColor: THREE.Color }>>([])
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Building data with varied shapes
  const buildingData = useMemo(() => {
    const buildings = []
    const cityRadius = 45
    const rings = 3
    const buildingsPerRing = buildingCount / rings
    const shapes: BuildingShape[] = ['box', 'cylinder', 'pyramid', 'stepped']

    for (let ring = 0; ring < rings; ring++) {
      const radius = cityRadius + ring * 25
      const count = Math.floor(buildingsPerRing)

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

        // Varying building dimensions
        const baseSize = 4 + Math.random() * 6
        const width = baseSize
        const depth = baseSize
        const baseHeight = 12 + Math.random() * 35 + ring * 18

        // Choose shape - outer rings have more variety
        const shapeIndex = ring === 0 ? 0 : Math.floor(Math.random() * shapes.length)
        const shape = shapes[shapeIndex]

        // Neon colors
        let color: THREE.Color
        if (theme) {
          const colors = [
            new THREE.Color(theme.colors.primary),
            new THREE.Color(theme.colors.secondary),
            new THREE.Color(theme.colors.tertiary)
          ]
          color = colors[Math.floor(Math.random() * colors.length)]
        } else {
          const colors = ['#00ffff', '#ff00ff', '#8b00ff', '#0080ff', '#ff0080']
          color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
        }

        buildings.push({
          position: new THREE.Vector3(x, baseHeight / 2, z),
          width,
          depth,
          baseHeight,
          color,
          pulsePhase: Math.random() * Math.PI * 2,
          shape
        })
      }
    }

    return buildings
  }, [buildingCount, theme])

  // Handle building mount - store refs for centralized animation
  const handleBuildingMount = (index: number) => (refs: BuildingRefs) => {
    buildingRefsArray.current[index] = {
      ...refs,
      pulsePhase: buildingData[index].pulsePhase,
      tempColor: new THREE.Color()
    }
  }

  // Single useFrame hook for ALL buildings - massive performance improvement!
  useFrame((state) => {
    const time = state.clock.elapsedTime

    buildingRefsArray.current.forEach((refs) => {
      if (!refs?.buildingRef.current || !refs.neonAccentRef.current || !refs.signageRef.current) return

      // Subtle pulse with bass
      const pulseFactor = 1 + bass * 0.03 * Math.sin(time * 2 + refs.pulsePhase)
      refs.buildingRef.current.scale.y = pulseFactor

      // Neon accent intensity
      const neonIntensity = 0.5 + mids * 0.5 + (beatDetected ? 0.5 : 0)
      const neonMat = refs.neonAccentRef.current.material as THREE.MeshStandardMaterial
      neonMat.emissiveIntensity = neonIntensity

      // Signage flicker
      const signageMat = refs.signageRef.current.material as THREE.MeshStandardMaterial
      signageMat.emissiveIntensity = 0.8 + Math.sin(time * 3 + refs.pulsePhase) * 0.2 + bass * 0.3

      // Occasional window flicker - reduced frequency for better performance
      if (refs.windowsRef.current && refs.windowData.length > 0 && Math.random() > 0.99) {
        const randomWindow = Math.floor(Math.random() * refs.windowData.length)
        const window = refs.windowData[randomWindow]
        if (window.lit) {
          const flickerIntensity = 0.5 + Math.random() * 0.5
          refs.tempColor.set('#ffff80').multiplyScalar(flickerIntensity)
          refs.windowsRef.current.setColorAt(randomWindow, refs.tempColor)
          if (refs.windowsRef.current.instanceColor) {
            refs.windowsRef.current.instanceColor.needsUpdate = true
          }
        }
      }
    })
  })

  return (
    <group>
      {buildingData.map((building, i) => (
        <EnhancedBuilding
          key={i}
          position={building.position}
          width={building.width}
          depth={building.depth}
          height={building.baseHeight}
          color={building.color}
          pulsePhase={building.pulsePhase}
          shape={building.shape}
          onMount={handleBuildingMount(i)}
        />
      ))}
    </group>
  )
}
