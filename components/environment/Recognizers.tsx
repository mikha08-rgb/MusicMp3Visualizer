'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface RecognizersProps {
  bass: number
  mids: number
  beatDetected: boolean
  theme?: ColorTheme
}

// Individual Recognizer ship (T-shaped craft)
function Recognizer({
  pathRadius,
  height,
  speed,
  offset,
  color,
  bass,
}: {
  pathRadius: number
  height: number
  speed: number
  offset: number
  color: string
  bass: number
}) {
  const recognizerRef = useRef<THREE.Group>(null)

  // Build the iconic T-shaped Recognizer geometry
  const recognizerGeometry = useMemo(() => {
    const group = new THREE.Group()

    // Main body (vertical stem of the T)
    const mainBody = new THREE.Mesh(
      new THREE.BoxGeometry(3, 8, 3),
      new THREE.MeshStandardMaterial({
        color: '#111111',
        emissive: color,
        emissiveIntensity: 0.3,
        metalness: 0.9,
        roughness: 0.1,
      })
    )
    group.add(mainBody)

    // Top horizontal bar (the T crossbar)
    const topBar = new THREE.Mesh(
      new THREE.BoxGeometry(12, 2, 3),
      new THREE.MeshStandardMaterial({
        color: '#111111',
        emissive: color,
        emissiveIntensity: 0.3,
        metalness: 0.9,
        roughness: 0.1,
      })
    )
    topBar.position.y = 5
    group.add(topBar)

    // Glowing edge lines (Tron-style)
    const edgeGeometry = new THREE.BoxGeometry(12.2, 0.2, 0.2)
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 4,
      transparent: true,
      opacity: 0.9,
    })

    // Top edge lines
    const topEdge1 = new THREE.Mesh(edgeGeometry, edgeMaterial)
    topEdge1.position.set(0, 6, 1.6)
    group.add(topEdge1)

    const topEdge2 = new THREE.Mesh(edgeGeometry, edgeMaterial)
    topEdge2.position.set(0, 6, -1.6)
    group.add(topEdge2)

    // Vertical edge lines
    const vertEdgeGeometry = new THREE.BoxGeometry(0.2, 8.2, 0.2)
    const vertEdge1 = new THREE.Mesh(vertEdgeGeometry, edgeMaterial)
    vertEdge1.position.set(1.6, 0, 1.6)
    group.add(vertEdge1)

    const vertEdge2 = new THREE.Mesh(vertEdgeGeometry, edgeMaterial)
    vertEdge2.position.set(-1.6, 0, 1.6)
    group.add(vertEdge2)

    const vertEdge3 = new THREE.Mesh(vertEdgeGeometry, edgeMaterial)
    vertEdge3.position.set(1.6, 0, -1.6)
    group.add(vertEdge3)

    const vertEdge4 = new THREE.Mesh(vertEdgeGeometry, edgeMaterial)
    vertEdge4.position.set(-1.6, 0, -1.6)
    group.add(vertEdge4)

    // Undercarriage lights (glowing panels)
    const lightPanel1 = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.1, 2),
      new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 5,
        transparent: true,
        opacity: 0.8,
      })
    )
    lightPanel1.position.y = -4.5
    group.add(lightPanel1)

    // Cockpit/command area (glowing sphere)
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(1, 8, 8),
      new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 3,
        transparent: true,
        opacity: 0.7,
      })
    )
    cockpit.position.y = 0
    group.add(cockpit)

    return group
  }, [color])

  useFrame((state) => {
    if (!recognizerRef.current) return

    const time = state.clock.elapsedTime

    // Slow patrol in circular path
    const angle = time * speed + offset
    const x = Math.cos(angle) * pathRadius
    const z = Math.sin(angle) * pathRadius
    const y = height + Math.sin(time * 0.5) * 2 // Slight bobbing motion

    recognizerRef.current.position.set(x, y, z)

    // Face direction of movement
    recognizerRef.current.rotation.y = angle + Math.PI / 2

    // Subtle tilt
    recognizerRef.current.rotation.x = Math.sin(time * 0.3) * 0.05
    recognizerRef.current.rotation.z = Math.cos(time * 0.4) * 0.05

    // Very subtle pulse lights with bass
    recognizerRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        if (child.material.emissiveIntensity > 2) {
          // Only pulse the bright lights, very gently
          child.material.emissiveIntensity = child.material.emissiveIntensity * (1 + bass * 0.05) // Reduced from 0.4 to 0.05
        }
      }
    })
  })

  return (
    <group ref={recognizerRef}>
      <primitive object={recognizerGeometry} />
    </group>
  )
}

export default function Recognizers({ bass, mids, beatDetected, theme }: RecognizersProps) {
  const groupRef = useRef<THREE.Group>(null)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'

  // 2 Recognizers on patrol
  const recognizers = [
    { pathRadius: 60, height: 25, speed: 0.08, offset: 0, color: primaryColor },
    { pathRadius: 55, height: 30, speed: -0.1, offset: Math.PI, color: secondaryColor },
  ]

  return (
    <group ref={groupRef}>
      {recognizers.map((recognizer, index) => (
        <Recognizer
          key={`recognizer-${index}`}
          pathRadius={recognizer.pathRadius}
          height={recognizer.height}
          speed={recognizer.speed}
          offset={recognizer.offset}
          color={recognizer.color}
          bass={bass}
        />
      ))}
    </group>
  )
}
