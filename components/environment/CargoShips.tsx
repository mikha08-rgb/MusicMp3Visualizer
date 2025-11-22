'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface CargoShipsProps {
  bass: number
  mids: number
  beatDetected: boolean
  theme?: ColorTheme
}

interface ShipRefs {
  groupRef: React.RefObject<THREE.Group>
  thrustersRef: React.RefObject<THREE.Group>
  lightsRef: React.RefObject<THREE.Group>
  pathRadius: number
  pathAngle: number
  height: number
  speed: number
  hoverPhase: number
}

function CargoShip({
  pathRadius,
  pathAngle,
  height,
  speed,
  color,
  size,
  onMount
}: {
  pathRadius: number
  pathAngle: number
  height: number
  speed: number
  color: THREE.Color
  size: number
  onMount: (refs: ShipRefs) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const thrustersRef = useRef<THREE.Group>(null)
  const lightsRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current && thrustersRef.current && lightsRef.current) {
      onMount({
        groupRef,
        thrustersRef,
        lightsRef,
        pathRadius,
        pathAngle,
        height,
        speed,
        hoverPhase: pathAngle
      })
    }
  }, [])

  return (
    <group ref={groupRef}>
      {/* Main hull - disabled shadows for performance */}
      <mesh>
        <boxGeometry args={[size * 4, size * 1, size * 2]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Cargo containers on top */}
      <mesh position={[0, size * 0.8, 0]}>
        <boxGeometry args={[size * 3.5, size * 0.6, size * 1.8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 1.5, 0]}>
        <boxGeometry args={[size * 3, size * 0.6, size * 1.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Cockpit/bridge */}
      <mesh position={[size * 2, size * 0.3, 0]}>
        <boxGeometry args={[size * 0.8, size * 0.6, size * 1.2]} />
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Cockpit windows */}
      <mesh position={[size * 2.4, size * 0.3, 0]}>
        <planeGeometry args={[size * 0.3, size * 0.4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Running lights */}
      <group ref={lightsRef}>
        {/* Navigation lights - removed point lights for performance */}
        <mesh position={[size * 2.5, size * 0.5, size]}>
          <sphereGeometry args={[0.15, 4, 4]} />
          <meshStandardMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>

        <mesh position={[size * 2.5, size * 0.5, -size]}>
          <sphereGeometry args={[0.15, 4, 4]} />
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>

        {/* Position lights along hull */}
        <mesh position={[-size, size * 0.5, 0]}>
          <sphereGeometry args={[0.1, 4, 4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Thrusters */}
      <group ref={thrustersRef}>
        {/* Bottom thrusters */}
        <mesh position={[-size * 1.5, -size * 0.6, size * 0.6]}>
          <cylinderGeometry args={[0.3, 0.4, 0.5, 6]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-size * 1.5, -size * 0.9, size * 0.6]}>
          <coneGeometry args={[0.4, 0.6, 6]} />
          <meshStandardMaterial
            color="#00aaff"
            emissive="#00aaff"
            emissiveIntensity={1.5}
            transparent
            opacity={0.7}
            toneMapped={false}
          />
        </mesh>

        <mesh position={[-size * 1.5, -size * 0.6, -size * 0.6]}>
          <cylinderGeometry args={[0.3, 0.4, 0.5, 6]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-size * 1.5, -size * 0.9, -size * 0.6]}>
          <coneGeometry args={[0.4, 0.6, 6]} />
          <meshStandardMaterial
            color="#00aaff"
            emissive="#00aaff"
            emissiveIntensity={1.5}
            transparent
            opacity={0.7}
            toneMapped={false}
          />
        </mesh>

        {/* Rear engine glow - removed point lights for performance */}
        <mesh position={[-size * 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 1, 6]} />
          <meshStandardMaterial
            color="#ff6600"
            emissive="#ff6600"
            emissiveIntensity={2}
            transparent
            opacity={0.6}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Antenna/sensor array on top - removed point light */}
      <mesh position={[size, size * 2.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 6]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[size, size * 2.7, 0]}>
        <sphereGeometry args={[0.15, 4, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function CargoShips({
  bass,
  mids,
  beatDetected,
  theme
}: CargoShipsProps) {
  const shipRefsArray = useRef<ShipRefs[]>([])

  const shipData = useMemo(() => {
    const ships = []
    const count = 5 // Large objects, keep count low

    for (let i = 0; i < count; i++) {
      const pathRadius = 70 + i * 15
      const height = 25 + i * 8
      const speed = 0.05 + Math.random() * 0.03
      const size = 1.5 + Math.random() * 0.5

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

      ships.push({
        pathRadius,
        pathAngle: (i / count) * Math.PI * 2,
        height,
        speed: i % 2 === 0 ? speed : -speed,
        color,
        size
      })
    }

    return ships
  }, [theme])

  const handleShipMount = (index: number) => (refs: ShipRefs) => {
    shipRefsArray.current[index] = refs
  }

  // Single useFrame for all ships
  useFrame((state) => {
    const time = state.clock.elapsedTime

    shipRefsArray.current.forEach((refs) => {
      if (!refs?.groupRef.current || !refs.thrustersRef.current || !refs.lightsRef.current) return

      // Move along circular path
      refs.pathAngle += refs.speed * 0.016

      const x = Math.cos(refs.pathAngle) * refs.pathRadius
      const z = Math.sin(refs.pathAngle) * refs.pathRadius

      // Gentle hover oscillation
      const hoverBob = Math.sin(time * 0.5 + refs.hoverPhase) * 1.5

      // Bass makes ships bob more
      const bassBob = bass * 2

      const y = refs.height + hoverBob + bassBob

      refs.groupRef.current.position.set(x, y, z)

      // Face direction of travel
      refs.groupRef.current.rotation.y = refs.pathAngle + (refs.speed > 0 ? Math.PI / 2 : -Math.PI / 2)

      // Slight tilt based on movement
      refs.groupRef.current.rotation.z = Math.sin(time * 0.3 + refs.hoverPhase) * 0.05

      // Thruster pulse with mids
      const thrusterIntensity = 1.5 + mids * 1.0 + Math.sin(time * 4) * 0.3
      refs.thrustersRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          if (child.material.emissive) {
            child.material.emissiveIntensity = thrusterIntensity
          }
        }
      })

      // Lights flicker on beat
      if (beatDetected) {
        refs.lightsRef.current.scale.setScalar(1.3)
      } else {
        refs.lightsRef.current.scale.setScalar(1.0)
      }
    })
  })

  return (
    <group>
      {shipData.map((ship, i) => (
        <CargoShip
          key={i}
          pathRadius={ship.pathRadius}
          pathAngle={ship.pathAngle}
          height={ship.height}
          speed={ship.speed}
          color={ship.color}
          size={ship.size}
          onMount={handleShipMount(i)}
        />
      ))}
    </group>
  )
}
