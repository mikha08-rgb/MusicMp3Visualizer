'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface FlyingVehiclesProps {
  bass: number
  theme?: ColorTheme
}

interface VehicleRefs {
  groupRef: React.RefObject<THREE.Group | null>
  lightRef: React.RefObject<THREE.PointLight | null>
  trailRef: React.RefObject<THREE.Mesh | null>
  pathRadius: number
  pathAngleOffset: number
  height: number
  speed: number
}

function FlyingVehicle({
  pathRadius,
  pathAngleOffset,
  height,
  speed,
  color,
  size,
  onMount
}: {
  pathRadius: number
  pathAngleOffset: number
  height: number
  speed: number
  color: THREE.Color
  size: number
  onMount: (refs: VehicleRefs) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const trailRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (groupRef.current && lightRef.current && trailRef.current) {
      onMount({
        groupRef,
        lightRef,
        trailRef,
        pathRadius,
        pathAngleOffset,
        height,
        speed
      })
    }
  }, [])

  return (
    <group ref={groupRef}>
      {/* Vehicle body */}
      <mesh castShadow>
        <boxGeometry args={[size * 2, size * 0.5, size]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Cockpit */}
      <mesh position={[size * 0.5, size * 0.3, 0]}>
        <boxGeometry args={[size * 0.8, size * 0.4, size * 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
          toneMapped={false}
        />
      </mesh>

      {/* Headlights */}
      <pointLight
        ref={lightRef}
        position={[size * 1.2, 0, 0]}
        color={color}
        intensity={2}
        distance={10}
        decay={2}
      />

      {/* Neon underlight strips */}
      <mesh position={[0, -size * 0.3, 0]}>
        <boxGeometry args={[size * 1.8, size * 0.1, size * 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* Light trail */}
      <mesh ref={trailRef} position={[-size * 1.5, 0, 0]}>
        <planeGeometry args={[size * 2, size * 0.3]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Small engine glow particles */}
      <points position={[-size, 0, size * 0.3]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([
              0, 0, 0,
              -0.2, 0.1, 0,
              -0.4, 0.2, 0,
              -0.2, -0.1, 0,
              -0.4, -0.2, 0,
            ]), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={size * 0.2}
          color={color}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      <points position={[-size, 0, -size * 0.3]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([
              0, 0, 0,
              -0.2, 0.1, 0,
              -0.4, 0.2, 0,
              -0.2, -0.1, 0,
              -0.4, -0.2, 0,
            ]), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={size * 0.2}
          color={color}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

export default function FlyingVehicles({ bass, theme }: FlyingVehiclesProps) {
  const vehicleRefsArray = useRef<VehicleRefs[]>([])

  const vehicleData = useMemo(() => {
    const vehicles = []
    const count = 8 // Reduced from 12 for better performance

    for (let i = 0; i < count; i++) {
      const pathRadius = 30 + Math.random() * 50
      const height = 15 + Math.random() * 20
      const speed = 0.1 + Math.random() * 0.2
      const size = 0.8 + Math.random() * 0.5

      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary),
          new THREE.Color(theme.colors.tertiary)
        ]
        color = colors[Math.floor(Math.random() * colors.length)]
      } else {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ff0080']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      vehicles.push({
        pathRadius,
        pathAngleOffset: (i / count) * Math.PI * 2,
        height,
        speed: Math.random() > 0.5 ? speed : -speed, // Some go clockwise, some counter-clockwise
        color,
        size
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

    vehicleRefsArray.current.forEach((refs) => {
      if (!refs?.groupRef.current || !refs.lightRef.current || !refs.trailRef.current) return

      // Circular path
      const angle = refs.pathAngleOffset + time * refs.speed
      const x = Math.cos(angle) * refs.pathRadius
      const z = Math.sin(angle) * refs.pathRadius

      refs.groupRef.current.position.set(x, refs.height, z)

      // Face direction of travel
      refs.groupRef.current.rotation.y = angle + Math.PI / 2

      // Pulsing lights
      refs.lightRef.current.intensity = 2 + Math.sin(time * 5) * 0.5

      // Trail opacity
      const trailMat = refs.trailRef.current.material as THREE.MeshBasicMaterial
      trailMat.opacity = 0.3 + Math.sin(time * 3) * 0.2
    })
  })

  return (
    <group>
      {vehicleData.map((vehicle, i) => (
        <FlyingVehicle
          key={i}
          pathRadius={vehicle.pathRadius}
          pathAngleOffset={vehicle.pathAngleOffset}
          height={vehicle.height}
          speed={vehicle.speed}
          color={vehicle.color}
          size={vehicle.size}
          onMount={handleVehicleMount(i)}
        />
      ))}
    </group>
  )
}
