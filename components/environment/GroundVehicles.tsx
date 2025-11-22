'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface GroundVehiclesProps {
  bass: number
  mids: number
  beatDetected: boolean
  theme?: ColorTheme
}

interface VehicleRefs {
  groupRef: React.RefObject<THREE.Group>
  headlightsRef: React.RefObject<THREE.Mesh>
  brakelightsRef: React.RefObject<THREE.Mesh>
  pathRadius: number
  pathAngle: number
  speed: number
  isBraking: boolean
  brakeTimer: number
}

function GroundVehicle({
  pathRadius,
  pathAngle,
  speed,
  color,
  size,
  vehicleType,
  onMount
}: {
  pathRadius: number
  pathAngle: number
  speed: number
  color: THREE.Color
  size: number
  vehicleType: 'car' | 'motorcycle' | 'truck'
  onMount: (refs: VehicleRefs) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const headlightsRef = useRef<THREE.Mesh>(null)
  const brakelightsRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (groupRef.current && headlightsRef.current && brakelightsRef.current) {
      onMount({
        groupRef,
        headlightsRef,
        brakelightsRef,
        pathRadius,
        pathAngle,
        speed,
        isBraking: false,
        brakeTimer: 0
      })
    }
  }, [])

  // Different vehicle shapes
  const renderVehicle = () => {
    switch (vehicleType) {
      case 'motorcycle':
        return (
          <>
            {/* Main body - thin and sleek */}
            <mesh castShadow>
              <boxGeometry args={[size * 1.5, size * 0.4, size * 0.6]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Rider */}
            <mesh position={[0, size * 0.6, 0]}>
              <capsuleGeometry args={[size * 0.15, size * 0.3, 4, 4]} />
              <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
            </mesh>
          </>
        )
      case 'truck':
        return (
          <>
            {/* Cab - disabled shadows for performance */}
            <mesh position={[size * 0.8, size * 0.3, 0]}>
              <boxGeometry args={[size * 1.2, size * 0.8, size * 1.2]} />
              <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Cargo container */}
            <mesh position={[-size * 0.8, size * 0.4, 0]}>
              <boxGeometry args={[size * 2, size, size * 1.2]} />
              <meshStandardMaterial color="#2a2a3e" metalness={0.5} roughness={0.6} />
            </mesh>
          </>
        )
      default: // car
        return (
          <>
            {/* Main body - disabled shadows for performance */}
            <mesh>
              <boxGeometry args={[size * 2, size * 0.5, size]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Windshield/cabin */}
            <mesh position={[size * 0.2, size * 0.4, 0]}>
              <boxGeometry args={[size * 0.8, size * 0.3, size * 0.9]} />
              <meshStandardMaterial
                color="#1a1a2e"
                transparent
                opacity={0.6}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </>
        )
    }
  }

  return (
    <group ref={groupRef}>
      {renderVehicle()}

      {/* Headlights - removed point lights, using emissive meshes only for performance */}
      <mesh position={[size * 1.2, size * 0.2, size * 0.3]} ref={headlightsRef}>
        <sphereGeometry args={[0.1, 4, 4]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[size * 1.2, size * 0.2, -size * 0.3]}>
        <sphereGeometry args={[0.1, 4, 4]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* Brake lights - removed point lights, using emissive meshes only */}
      <mesh position={[-size * 1.2, size * 0.2, size * 0.3]} ref={brakelightsRef}>
        <sphereGeometry args={[0.08, 4, 4]} />
        <meshBasicMaterial color="#660000" />
      </mesh>
      <mesh position={[-size * 1.2, size * 0.2, -size * 0.3]}>
        <sphereGeometry args={[0.08, 4, 4]} />
        <meshBasicMaterial color="#660000" />
      </mesh>

      {/* Underbody neon (cyberpunk style) */}
      <mesh position={[0, -size * 0.3, 0]}>
        <boxGeometry args={[size * 1.8, size * 0.05, size * 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function GroundVehicles({
  bass,
  mids,
  beatDetected,
  theme
}: GroundVehiclesProps) {
  const vehicleRefsArray = useRef<VehicleRefs[]>([])

  const vehicleData = useMemo(() => {
    const vehicles = []
    const count = 16 // Optimized for performance

    const types: Array<'car' | 'motorcycle' | 'truck'> = ['car', 'motorcycle', 'truck']

    for (let i = 0; i < count; i++) {
      const lane = Math.floor(i / 8) // 3 lanes
      const pathRadius = 38 + lane * 5
      const speed = 0.15 + Math.random() * 0.1
      const vehicleType = types[Math.floor(Math.random() * types.length)]

      let size = 0.6
      if (vehicleType === 'motorcycle') size = 0.4
      if (vehicleType === 'truck') size = 0.8

      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary),
          new THREE.Color(theme.colors.tertiary),
          new THREE.Color('#ff0000'),
          new THREE.Color('#0000ff'),
          new THREE.Color('#ffff00')
        ]
        color = colors[Math.floor(Math.random() * colors.length)]
      } else {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ff0000', '#00ff00', '#0000ff']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      vehicles.push({
        pathRadius,
        pathAngle: (i / count) * Math.PI * 2,
        speed: lane % 2 === 0 ? speed : -speed, // Opposite directions per lane
        color,
        size,
        vehicleType
      })
    }

    return vehicles
  }, [theme])

  const handleVehicleMount = (index: number) => (refs: VehicleRefs) => {
    vehicleRefsArray.current[index] = refs
  }

  // Single useFrame for all vehicles
  useFrame((state) => {
    const time = state.clock.elapsedTime

    vehicleRefsArray.current.forEach((refs, index) => {
      if (!refs?.groupRef.current || !refs.headlightsRef.current || !refs.brakelightsRef.current) return

      // Move along circular path
      refs.pathAngle += refs.speed * 0.016 // ~60fps normalized

      const x = Math.cos(refs.pathAngle) * refs.pathRadius
      const z = Math.sin(refs.pathAngle) * refs.pathRadius

      refs.groupRef.current.position.set(x, 0.3, z)

      // Face direction of travel
      refs.groupRef.current.rotation.y = refs.pathAngle + (refs.speed > 0 ? Math.PI / 2 : -Math.PI / 2)

      // Random braking
      refs.brakeTimer -= 0.016
      if (refs.brakeTimer <= 0 && Math.random() > 0.98) {
        refs.isBraking = true
        refs.brakeTimer = 0.5 + Math.random() * 1.0
      }
      if (refs.brakeTimer <= 0) {
        refs.isBraking = false
        refs.brakeTimer = 2 + Math.random() * 3
      }

      // Brake lights - update material color instead of intensity
      if (refs.isBraking) {
        const brakeMat = refs.brakelightsRef.current.material as THREE.MeshBasicMaterial
        brakeMat.color.setHex(0xff0000)
      } else {
        const brakeMat = refs.brakelightsRef.current.material as THREE.MeshBasicMaterial
        brakeMat.color.setHex(0x660000)
      }

      // Headlights are always on (meshBasicMaterial)

      // Slight bounce with bass
      refs.groupRef.current.position.y = 0.3 + bass * 0.1

      // Speed up on beats
      const beatBoost = beatDetected ? 1.5 : 1.0
      refs.speed = Math.abs(refs.speed) * (refs.speed > 0 ? beatBoost : -beatBoost)
    })
  })

  return (
    <group>
      {vehicleData.map((vehicle, i) => (
        <GroundVehicle
          key={i}
          pathRadius={vehicle.pathRadius}
          pathAngle={vehicle.pathAngle}
          speed={vehicle.speed}
          color={vehicle.color}
          size={vehicle.size}
          vehicleType={vehicle.vehicleType}
          onMount={handleVehicleMount(i)}
        />
      ))}
    </group>
  )
}
