'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface HolographicBillboardsProps {
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  theme?: ColorTheme
}

interface BillboardRefs {
  meshRef: React.RefObject<THREE.Mesh>
  glowRef: React.RefObject<THREE.Mesh>
  baseY: number
  rotation: number
  pulseSpeed: number
}

function HoloBillboard({
  position,
  scale,
  color,
  text,
  rotation,
  pulseSpeed,
  onMount
}: {
  position: THREE.Vector3
  scale: [number, number, number]
  color: THREE.Color
  text: string
  rotation: number
  pulseSpeed: number
  onMount: (refs: BillboardRefs) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (meshRef.current && glowRef.current) {
      onMount({
        meshRef,
        glowRef,
        baseY: position.y,
        rotation,
        pulseSpeed
      })
    }
  }, [])

  return (
    <group position={position}>
      {/* Main holographic screen */}
      <mesh ref={meshRef} rotation={[0, rotation, 0]}>
        <planeGeometry args={scale} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} rotation={[0, rotation, 0]}>
        <planeGeometry args={[scale[0] * 1.2, scale[1] * 1.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Animated scan lines */}
      <mesh rotation={[0, rotation, 0]} position={[0, 0, -0.01]}>
        <planeGeometry args={scale} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export default function HolographicBillboards({
  bass,
  mids,
  highs,
  beatDetected,
  theme
}: HolographicBillboardsProps) {
  const billboardRefsArray = useRef<BillboardRefs[]>([])

  const billboardData = useMemo(() => {
    const billboards = []
    const count = 6 // Optimized for performance

    // Advertisement texts (just visual, not actual text rendering)
    const adTypes = ['AD', 'PROMO', 'SHOP', 'NEON', 'CYBER']

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 60 + Math.random() * 40
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = 15 + Math.random() * 25

      const width = 5 + Math.random() * 5
      const height = 3 + Math.random() * 3

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
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0080']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      billboards.push({
        position: new THREE.Vector3(x, y, z),
        scale: [width, height, 1] as [number, number, number],
        color,
        text: adTypes[Math.floor(Math.random() * adTypes.length)],
        rotation: Math.random() * Math.PI * 2,
        pulseSpeed: 1 + Math.random() * 2
      })
    }

    return billboards
  }, [theme])

  const handleBillboardMount = (index: number) => (refs: BillboardRefs) => {
    billboardRefsArray.current[index] = refs
  }

  // Single useFrame for all billboards
  useFrame((state) => {
    const time = state.clock.elapsedTime

    billboardRefsArray.current.forEach((refs) => {
      if (!refs?.meshRef.current || !refs.glowRef.current) return

      // Gentle float animation
      refs.meshRef.current.position.y = refs.baseY + Math.sin(time * 0.5 + refs.pulseSpeed) * 0.5

      // Pulsing glow
      const pulseFactor = 0.7 + Math.sin(time * refs.pulseSpeed) * 0.3
      const mat = refs.meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = pulseFactor

      const glowMat = refs.glowRef.current.material as THREE.MeshStandardMaterial
      glowMat.opacity = pulseFactor * 0.3

      // Rotate slowly
      refs.meshRef.current.rotation.y = refs.rotation + time * 0.1
      refs.glowRef.current.rotation.y = refs.rotation + time * 0.1
    })
  })

  return (
    <group>
      {billboardData.map((billboard, i) => (
        <HoloBillboard
          key={i}
          position={billboard.position}
          scale={billboard.scale}
          color={billboard.color}
          text={billboard.text}
          rotation={billboard.rotation}
          pulseSpeed={billboard.pulseSpeed}
          onMount={handleBillboardMount(i)}
        />
      ))}
    </group>
  )
}
