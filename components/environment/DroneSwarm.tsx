'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'
import { shouldRenderByDistance } from '@/lib/lod-helper'

interface DroneSwarmProps {
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  theme?: ColorTheme
}

type DroneType = 'box' | 'surveillance-quad' | 'delivery' | 'combat' | 'nano-swarm' | 'repair' | 'camera' | 'agricultural' | 'racing' | 'security' | 'medical'

interface DroneData {
  basePosition: THREE.Vector3
  phase: number
  speed: number
  orbitRadius: number
  heightOffset: number
  color: THREE.Color
  droneType: DroneType
  size: number
}

export default function DroneSwarm({
  bass,
  mids,
  highs,
  beatDetected,
  theme
}: DroneSwarmProps) {
  const dronesRef = useRef<THREE.InstancedMesh>(null)
  const lightsRef = useRef<THREE.InstancedMesh>(null)
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])
  const tempVector = useMemo(() => new THREE.Vector3(), [])

  // Generate drone data
  const { droneData, droneCount } = useMemo(() => {
    const count = 20 // Optimized for performance
    const drones: DroneData[] = []

    const droneTypes: DroneType[] = [
      'box', 'surveillance-quad', 'delivery', 'combat', 'nano-swarm',
      'repair', 'camera', 'agricultural', 'racing', 'security', 'medical'
    ]

    // Create formations
    const formations = 4
    const dronesPerFormation = count / formations

    for (let formation = 0; formation < formations; formation++) {
      const formationAngle = (formation / formations) * Math.PI * 2
      const formationRadius = 25 + formation * 15
      const formationX = Math.cos(formationAngle) * formationRadius
      const formationZ = Math.sin(formationAngle) * formationRadius
      const formationHeight = 12 + formation * 8

      for (let i = 0; i < dronesPerFormation; i++) {
        const phase = (i / dronesPerFormation) * Math.PI * 2
        const droneType = droneTypes[Math.floor(Math.random() * droneTypes.length)]

        // Vary size based on drone type
        let size = 0.3
        if (droneType === 'nano-swarm') size = 0.15
        if (droneType === 'delivery' || droneType === 'agricultural') size = 0.4
        if (droneType === 'combat' || droneType === 'security') size = 0.35
        if (droneType === 'racing') size = 0.25
        if (droneType === 'medical') size = 0.32

        let color: THREE.Color
        if (theme) {
          const colors = [
            new THREE.Color(theme.colors.primary),
            new THREE.Color(theme.colors.secondary),
            new THREE.Color(theme.colors.tertiary)
          ]
          color = colors[formation % colors.length]
        } else {
          // Type-specific colors
          if (droneType === 'medical') color = new THREE.Color('#ffffff')
          else if (droneType === 'combat' || droneType === 'security') color = new THREE.Color('#ff0000')
          else if (droneType === 'agricultural') color = new THREE.Color('#00ff00')
          else if (droneType === 'racing') color = new THREE.Color('#ffff00')
          else {
            const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00']
            color = new THREE.Color(colors[formation % colors.length])
          }
        }

        drones.push({
          basePosition: new THREE.Vector3(formationX, formationHeight, formationZ),
          phase,
          speed: droneType === 'racing' ? 0.6 + Math.random() * 0.3 : 0.3 + Math.random() * 0.2,
          orbitRadius: droneType === 'nano-swarm' ? 1 + Math.random() * 2 : 2 + Math.random() * 3,
          heightOffset: Math.random() * 2,
          color,
          droneType,
          size
        })
      }
    }

    return { droneData: drones, droneCount: count }
  }, [theme])

  // Initialize instances
  useEffect(() => {
    if (!dronesRef.current || !lightsRef.current) return

    droneData.forEach((drone, i) => {
      // Set initial position
      tempObject.position.copy(drone.basePosition)
      tempObject.scale.set(1, 1, 1)
      tempObject.updateMatrix()

      dronesRef.current!.setMatrixAt(i, tempObject.matrix)
      lightsRef.current!.setMatrixAt(i, tempObject.matrix)

      dronesRef.current!.setColorAt(i, new THREE.Color('#1a1a2e'))
      lightsRef.current!.setColorAt(i, drone.color)
    })

    dronesRef.current.instanceMatrix.needsUpdate = true
    lightsRef.current.instanceMatrix.needsUpdate = true
    if (dronesRef.current.instanceColor) dronesRef.current.instanceColor.needsUpdate = true
    if (lightsRef.current.instanceColor) lightsRef.current.instanceColor.needsUpdate = true
  }, [droneData, tempObject])

  // Animate drones
  const { camera } = useThree()
  useFrame((state) => {
    if (!dronesRef.current || !lightsRef.current) return

    const time = state.clock.elapsedTime
    const MAX_RENDER_DISTANCE = 120 // Drones are farther away

    droneData.forEach((drone, i) => {
      // Orbit around formation center
      const angle = time * drone.speed + drone.phase
      const orbitX = Math.cos(angle) * drone.orbitRadius
      const orbitZ = Math.sin(angle) * drone.orbitRadius

      // Height oscillation
      const heightWave = Math.sin(time * 2 + drone.phase) * drone.heightOffset

      // Music reactivity
      const bassBoost = bass * 2
      const midsExpand = mids * drone.orbitRadius * 0.3
      const highsScatter = highs * Math.sin(time * 10 + drone.phase) * 0.5

      // Beat reaction - spread out
      const beatExpand = beatDetected ? 3 : 0

      const x = drone.basePosition.x + orbitX + highsScatter + (beatExpand * Math.cos(angle))
      const y = drone.basePosition.y + heightWave + bassBoost
      const z = drone.basePosition.z + orbitZ + (beatExpand * Math.sin(angle))

      // Distance-based culling for performance
      tempVector.set(x, y, z)
      if (!shouldRenderByDistance(tempVector, camera, MAX_RENDER_DISTANCE)) {
        // Hide by scaling to zero
        tempObject.scale.set(0, 0, 0)
        tempObject.updateMatrix()
        dronesRef.current.setMatrixAt(i, tempObject.matrix)
        lightsRef.current.setMatrixAt(i, tempObject.matrix)
        return
      }

      // Drone body - vary shape by type
      const baseSize = drone.size
      tempObject.position.set(x, y, z)

      // Different proportions for different drone types
      if (drone.droneType === 'surveillance-quad' || drone.droneType === 'delivery') {
        // Wider, flatter for quads
        tempObject.scale.set(
          baseSize * (1.2 + mids * 0.2),
          baseSize * 0.3,
          baseSize * (1.2 + mids * 0.2)
        )
      } else if (drone.droneType === 'combat' || drone.droneType === 'security') {
        // Angular, aggressive
        tempObject.scale.set(
          baseSize * (1.3 + mids * 0.1),
          baseSize * 0.4,
          baseSize * (0.8 + mids * 0.1)
        )
      } else if (drone.droneType === 'nano-swarm') {
        // Tiny spherical
        tempObject.scale.set(
          baseSize * (1 + mids * 0.3),
          baseSize * (1 + mids * 0.3),
          baseSize * (1 + mids * 0.3)
        )
      } else if (drone.droneType === 'racing') {
        // Sleek, elongated
        tempObject.scale.set(
          baseSize * (1.5 + mids * 0.15),
          baseSize * 0.25,
          baseSize * (0.6 + mids * 0.1)
        )
      } else if (drone.droneType === 'medical') {
        // Boxy, utilitarian
        tempObject.scale.set(
          baseSize * (1.1 + mids * 0.15),
          baseSize * 0.8,
          baseSize * (1.1 + mids * 0.15)
        )
      } else {
        // Default box shape
        tempObject.scale.set(
          baseSize * (1 + mids * 0.2),
          baseSize * 0.5,
          baseSize * (1 + mids * 0.2)
        )
      }

      tempObject.rotation.y = angle + Math.PI / 2
      tempObject.rotation.x = Math.sin(time * 3 + drone.phase) * 0.2
      tempObject.updateMatrix()
      dronesRef.current.setMatrixAt(i, tempObject.matrix)

      // Light - vary position and size by type
      const lightYOffset = drone.droneType === 'surveillance-quad' ? -0.15 : -0.2
      tempObject.position.set(x, y + lightYOffset, z)
      tempObject.scale.set(
        baseSize * 0.5,
        baseSize * 0.5,
        baseSize * 0.5
      )
      tempObject.updateMatrix()
      lightsRef.current.setMatrixAt(i, tempObject.matrix)

      // Color pulse
      const intensity = 0.6 + highs * 0.4
      tempColor.copy(drone.color).multiplyScalar(intensity)
      lightsRef.current.setColorAt(i, tempColor)
    })

    dronesRef.current.instanceMatrix.needsUpdate = true
    lightsRef.current.instanceMatrix.needsUpdate = true
    if (lightsRef.current.instanceColor) {
      lightsRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Drone bodies - disabled shadows for performance */}
      <instancedMesh
        ref={dronesRef}
        args={[undefined, undefined, droneCount]}
      >
        <boxGeometry args={[1, 0.5, 1]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.2}
        />
      </instancedMesh>

      {/* Drone lights */}
      <instancedMesh
        ref={lightsRef}
        args={[undefined, undefined, droneCount]}
      >
        <sphereGeometry args={[1, 4, 4]} />
        <meshStandardMaterial
          color="white"
          emissive="white"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Energy trails visualization */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={60}
            array={new Float32Array(
              Array.from({ length: 180 }, (_, i) => {
                const angle = (i / 60) * Math.PI * 2
                const radius = 30 + (i % 3) * 15
                if (i % 3 === 0) return Math.cos(angle) * radius
                if (i % 3 === 1) return 15 + (i % 20)
                return Math.sin(angle) * radius
              })
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          color={theme?.colors.primary || '#00ffff'}
          transparent
          opacity={0.3}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
