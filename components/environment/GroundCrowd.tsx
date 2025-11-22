'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'
import { shouldRenderByDistance } from '@/lib/lod-helper'

interface GroundCrowdProps {
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  theme?: ColorTheme
}

interface PersonData {
  pathRadius: number
  pathAngle: number
  speed: number
  height: number
  color: THREE.Color
  dancePhase: number
  walkPhase: number
}

export default function GroundCrowd({
  bass,
  mids,
  highs,
  beatDetected,
  theme
}: GroundCrowdProps) {
  const crowdRef = useRef<THREE.InstancedMesh>(null)
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])
  const tempVector = useMemo(() => new THREE.Vector3(), []) // Reusable vector for distance checks

  // Generate crowd data
  const { peopleData, peopleCount } = useMemo(() => {
    const count = 48 // Reduced from 64 for better performance
    const people: PersonData[] = []

    // Create people at different radii (street level)
    const rings = 4
    const peoplePerRing = count / rings

    for (let ring = 0; ring < rings; ring++) {
      const radius = 30 + ring * 10

      for (let i = 0; i < peoplePerRing; i++) {
        const angle = (i / peoplePerRing) * Math.PI * 2

        // Varying person attributes
        const height = 1.5 + Math.random() * 0.4
        const speed = 0.1 + Math.random() * 0.15

        // Person colors (clothing)
        let color: THREE.Color
        if (theme) {
          const colors = [
            new THREE.Color(theme.colors.primary),
            new THREE.Color(theme.colors.secondary),
            new THREE.Color(theme.colors.tertiary),
            new THREE.Color('#ffffff'),
            new THREE.Color('#000000')
          ]
          color = colors[Math.floor(Math.random() * colors.length)]
        } else {
          const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ffffff', '#000000', '#ff0080']
          color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
        }

        people.push({
          pathRadius: radius,
          pathAngle: angle,
          speed: Math.random() > 0.5 ? speed : -speed,
          height,
          color,
          dancePhase: Math.random() * Math.PI * 2,
          walkPhase: Math.random() * Math.PI * 2
        })
      }
    }

    return { peopleData: people, peopleCount: count }
  }, [theme])

  // Initialize instances
  useEffect(() => {
    if (!crowdRef.current) return

    peopleData.forEach((person, i) => {
      const angle = person.pathAngle
      const x = Math.cos(angle) * person.pathRadius
      const z = Math.sin(angle) * person.pathRadius

      tempObject.position.set(x, person.height / 2 + 0.1, z)
      tempObject.scale.set(0.3, person.height, 0.3)
      tempObject.rotation.y = angle + Math.PI / 2
      tempObject.updateMatrix()

      crowdRef.current!.setMatrixAt(i, tempObject.matrix)
      crowdRef.current!.setColorAt(i, person.color)
    })

    crowdRef.current.instanceMatrix.needsUpdate = true
    if (crowdRef.current.instanceColor) {
      crowdRef.current.instanceColor.needsUpdate = true
    }
  }, [peopleData, tempObject])

  // Animate crowd with multi-level LOD for optimal performance
  // KEY FIX: Always update position every frame for smooth movement
  // Only throttle expensive animations (dance, bob, color) based on distance
  const { camera } = useThree()
  useFrame((state) => {
    if (!crowdRef.current) return

    const time = state.clock.elapsedTime
    const frameCount = Math.floor(time * 60) // Use as frame counter

    peopleData.forEach((person, i) => {
      // ALWAYS update position every frame - this is cheap and critical for smooth movement
      person.pathAngle += person.speed * 0.016 // ~60fps normalized

      const x = Math.cos(person.pathAngle) * person.pathRadius
      const z = Math.sin(person.pathAngle) * person.pathRadius

      // Calculate distance for LOD - reuse vector to avoid allocation
      tempVector.set(x, person.height / 2, z)
      const distanceSq = camera.position.distanceToSquared(tempVector)

      // LOD Levels with distance-squared for faster comparison
      const CLOSE_DIST_SQ = 30 * 30      // 0-30 units: Full detail
      const MEDIUM_DIST_SQ = 50 * 50     // 30-50 units: Reduced animation
      const FAR_DIST_SQ = 70 * 70        // 50-70 units: Minimal animation
      const CULL_DIST_SQ = 80 * 80       // 70-80 units: Don't render

      // LOD Level 4: Cull - Don't render
      if (distanceSq > CULL_DIST_SQ) {
        tempObject.scale.set(0, 0, 0)
        tempObject.updateMatrix()
        crowdRef.current!.setMatrixAt(i, tempObject.matrix)
        return
      }

      // LOD Level 3: Far - Simple position only, no animations
      if (distanceSq > FAR_DIST_SQ) {
        // Still update position EVERY frame for smooth movement
        const y = person.height / 2 + 0.1
        tempObject.position.set(x, y, z)
        tempObject.scale.set(0.3, person.height, 0.3)
        tempObject.rotation.y = person.pathAngle + Math.PI / 2
        tempObject.updateMatrix()
        crowdRef.current!.setMatrixAt(i, tempObject.matrix)
        return
      }

      // LOD Level 2: Medium - Smooth position + simplified animations every 2 frames
      if (distanceSq > MEDIUM_DIST_SQ) {
        // Position ALWAYS updates for smooth movement
        let y = person.height / 2 + 0.1
        let beatScale = 1.0

        // Only compute expensive animations every 2 frames
        if (frameCount % 2 === 0) {
          const walkBob = Math.sin(time * 8 + person.walkPhase) * 0.05
          beatScale = beatDetected ? 1.1 : 1.0
          y += walkBob

          // Update color every 2 frames
          const colorIntensity = 0.8 + mids * 0.2
          tempColor.copy(person.color).multiplyScalar(colorIntensity)
          crowdRef.current!.setColorAt(i, tempColor)
        }

        tempObject.position.set(x, y, z)
        tempObject.scale.set(0.3 * beatScale, person.height * beatScale, 0.3 * beatScale)
        tempObject.rotation.y = person.pathAngle + Math.PI / 2
        tempObject.updateMatrix()
        crowdRef.current!.setMatrixAt(i, tempObject.matrix)
        return
      }

      // LOD Level 1: Close - Full detail, every frame
      if (distanceSq <= CLOSE_DIST_SQ) {
        // Walking bob animation
        const walkBob = Math.sin(time * 8 + person.walkPhase) * 0.05

        // Dance on beats - jump and scale
        const beatScale = beatDetected ? 1.2 : 1.0
        const danceJump = beatDetected ? 0.3 : 0
        const danceRotation = Math.sin(time * 4 + person.dancePhase) * 0.3 * bass

        const y = person.height / 2 + 0.1 + walkBob + danceJump

        tempObject.position.set(x, y, z)
        tempObject.scale.set(
          0.3 * beatScale,
          person.height * beatScale,
          0.3 * beatScale
        )
        tempObject.rotation.y = person.pathAngle + Math.PI / 2 + danceRotation
        tempObject.updateMatrix()

        crowdRef.current!.setMatrixAt(i, tempObject.matrix)

        // Color pulse with mids
        const colorIntensity = 0.7 + mids * 0.3
        tempColor.copy(person.color).multiplyScalar(colorIntensity)
        crowdRef.current!.setColorAt(i, tempColor)
      }
    })

    crowdRef.current.instanceMatrix.needsUpdate = true
    if (crowdRef.current.instanceColor) {
      crowdRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Main crowd - simple capsule-like people */}
      <instancedMesh
        ref={crowdRef}
        args={[undefined, undefined, peopleCount]}
      >
        <capsuleGeometry args={[0.5, 0.5, 4, 4]} />
        <meshStandardMaterial
          color="white"
          roughness={0.7}
          metalness={0.1}
        />
      </instancedMesh>

      {/* Add some ambient crowd noise visualization - energy particles above crowd */}
      <points position={[0, 3, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(
              Array.from({ length: 150 }, (_, i) => {
                const angle = (i / 50) * Math.PI * 2
                const radius = 35 + (i % 3) * 10
                if (i % 3 === 0) return Math.cos(angle) * radius
                if (i % 3 === 1) return Math.random() * 2
                return Math.sin(angle) * radius
              })
            ), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.3}
          color={theme?.colors.primary || '#00ffff'}
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
