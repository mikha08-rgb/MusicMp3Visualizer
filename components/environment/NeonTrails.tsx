'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface NeonTrailsProps {
  bass: number
  mids: number
  theme?: ColorTheme
}

// Individual trail path
function NeonTrail({
  pathPoints,
  color,
  speed,
  radius,
  bass
}: {
  pathPoints: THREE.Vector3[]
  color: THREE.Color
  speed: number
  radius: number
  bass: number
}) {
  const trailRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const progressRef = useRef(0)

  useFrame((state) => {
    if (!trailRef.current || !lightRef.current) return

    const time = state.clock.elapsedTime

    // Move along the path
    progressRef.current += speed * (1 + bass * 0.3) * 0.01
    if (progressRef.current >= 1) progressRef.current = 0

    const index = Math.floor(progressRef.current * (pathPoints.length - 1))
    const nextIndex = (index + 1) % pathPoints.length
    const t = (progressRef.current * (pathPoints.length - 1)) % 1

    const currentPoint = pathPoints[index]
    const nextPoint = pathPoints[nextIndex]

    // Interpolate position
    const position = new THREE.Vector3().lerpVectors(currentPoint, nextPoint, t)
    trailRef.current.position.copy(position)
    lightRef.current.position.copy(position)

    // Pulsing glow
    const mat = trailRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 1 + Math.sin(time * 5) * 0.3 + bass * 0.5

    lightRef.current.intensity = 2 + bass * 2
  })

  // Create trail geometry
  const trailGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pathPoints)
    const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.1, 8, false)
    return tubeGeometry
  }, [pathPoints])

  return (
    <group>
      {/* Moving light orb */}
      <mesh ref={trailRef}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* Point light */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={2}
        distance={15}
        decay={2}
      />

      {/* Trail path (faint) */}
      <mesh geometry={trailGeometry}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function NeonTrails({
  bass,
  mids,
  theme
}: NeonTrailsProps) {
  const trailData = useMemo(() => {
    const trails = []
    const count = 8

    for (let i = 0; i < count; i++) {
      // Create circular/orbital paths at different heights
      const pathPoints: THREE.Vector3[] = []
      const segments = 20
      const baseRadius = 50 + Math.random() * 30
      const height = 15 + Math.random() * 20
      const verticalVariation = 5 + Math.random() * 5

      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * Math.PI * 2
        const radiusVariation = Math.sin(angle * 3) * 5
        const heightVariation = Math.sin(angle * 2) * verticalVariation

        const x = Math.cos(angle) * (baseRadius + radiusVariation)
        const y = height + heightVariation
        const z = Math.sin(angle) * (baseRadius + radiusVariation)

        pathPoints.push(new THREE.Vector3(x, y, z))
      }

      // Colors
      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary),
          new THREE.Color(theme.colors.tertiary)
        ]
        color = colors[Math.floor(Math.random() * colors.length)]
      } else {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ff0080', '#00ff80']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      trails.push({
        pathPoints,
        color,
        speed: 0.5 + Math.random() * 0.5,
        radius: baseRadius
      })
    }

    return trails
  }, [theme])

  return (
    <group>
      {trailData.map((trail, i) => (
        <NeonTrail
          key={i}
          pathPoints={trail.pathPoints}
          color={trail.color}
          speed={trail.speed}
          radius={trail.radius}
          bass={bass}
        />
      ))}
    </group>
  )
}
