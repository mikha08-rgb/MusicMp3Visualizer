'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface StreetDetailsProps {
  bass: number
  theme?: ColorTheme
}

interface StreetLightRefs {
  lightRef: React.RefObject<THREE.PointLight | null>
  glowRef: React.RefObject<THREE.Mesh | null>
  flickerPhase: number
}

interface VendingMachineRefs {
  screenRef: React.RefObject<THREE.Mesh | null>
}

interface NeonSignRefs {
  meshRef: React.RefObject<THREE.Mesh | null>
}

function StreetLight({
  position,
  color,
  onMount
}: {
  position: THREE.Vector3
  color: THREE.Color
  onMount: (refs: StreetLightRefs) => void
}) {
  const lightRef = useRef<THREE.PointLight>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (lightRef.current && glowRef.current) {
      onMount({
        lightRef,
        glowRef,
        flickerPhase: position.x
      })
    }
  }, [])

  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 5]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Light housing */}
      <mesh position={[0, 5.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Glowing light */}
      <mesh ref={glowRef} position={[0, 5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
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
        position={[0, 5, 0]}
        color={color}
        intensity={3}
        distance={15}
        decay={2}
      />
    </group>
  )
}

function VendingMachine({
  position,
  color,
  onMount
}: {
  position: THREE.Vector3
  color: THREE.Color
  onMount: (refs: VendingMachineRefs) => void
}) {
  const screenRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (screenRef.current) {
      onMount({ screenRef })
    }
  }, [])

  return (
    <group position={position}>
      {/* Main body */}
      <mesh>
        <boxGeometry args={[1.5, 2.5, 1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.5, 0.51]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Neon strip at bottom */}
      <mesh position={[0, -1.3, 0.51]}>
        <boxGeometry args={[1.4, 0.1, 0.05]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* Top logo strip */}
      <mesh position={[0, 1.3, 0.51]}>
        <boxGeometry args={[1.4, 0.2, 0.05]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function NeonSign({
  position,
  rotation,
  size,
  color,
  onMount
}: {
  position: THREE.Vector3
  rotation: number
  size: [number, number]
  color: THREE.Color
  onMount: (refs: NeonSignRefs) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (meshRef.current) {
      onMount({ meshRef })
    }
  }, [])

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Sign backing */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[size[0], size[1], 0.1]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Neon tubing effect */}
      <mesh ref={meshRef}>
        <planeGeometry args={size} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>

    </group>
  )
}

export default function StreetDetails({ bass, theme }: StreetDetailsProps) {
  const streetLightRefsArray = useRef<StreetLightRefs[]>([])
  const vendingMachineRefsArray = useRef<VendingMachineRefs[]>([])
  const neonSignRefsArray = useRef<NeonSignRefs[]>([])

  const streetLightData = useMemo(() => {
    const lights = []
    const count = 12 // Optimized for performance
    const radius = 55

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      let color: THREE.Color
      if (theme) {
        color = new THREE.Color(i % 2 === 0 ? theme.colors.primary : theme.colors.secondary)
      } else {
        color = new THREE.Color(i % 2 === 0 ? '#00ffff' : '#ff00ff')
      }

      lights.push({
        position: new THREE.Vector3(x, 0, z),
        color
      })
    }

    return lights
  }, [theme])

  const vendingMachineData = useMemo(() => {
    const machines = []
    const count = 4 // Optimized for performance

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 48
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary),
          new THREE.Color(theme.colors.tertiary)
        ]
        color = colors[Math.floor(Math.random() * colors.length)]
      } else {
        const colors = ['#00ffff', '#ff00ff', '#ffff00']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      machines.push({
        position: new THREE.Vector3(x, 1.25, z),
        color
      })
    }

    return machines
  }, [theme])

  const neonSignData = useMemo(() => {
    const signs = []
    const count = 6 // Optimized for performance

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 52
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = 8 + Math.random() * 10

      const width = 2 + Math.random() * 2
      const height = 1 + Math.random() * 1

      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary),
          new THREE.Color(theme.colors.tertiary)
        ]
        color = colors[Math.floor(Math.random() * colors.length)]
      } else {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      signs.push({
        position: new THREE.Vector3(x, y, z),
        rotation: angle + Math.PI, // Face inward
        size: [width, height] as [number, number],
        color
      })
    }

    return signs
  }, [theme])

  const handleStreetLightMount = (index: number) => (refs: StreetLightRefs) => {
    streetLightRefsArray.current[index] = refs
  }

  const handleVendingMachineMount = (index: number) => (refs: VendingMachineRefs) => {
    vendingMachineRefsArray.current[index] = refs
  }

  const handleNeonSignMount = (index: number) => (refs: NeonSignRefs) => {
    neonSignRefsArray.current[index] = refs
  }

  // Single useFrame for ALL street details - huge performance improvement!
  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Animate street lights
    streetLightRefsArray.current.forEach((refs) => {
      if (!refs?.lightRef.current || !refs.glowRef.current) return

      const flicker = Math.sin(time * 10 + refs.flickerPhase) * 0.1
      refs.lightRef.current.intensity = 3 + flicker

      const glowMat = refs.glowRef.current.material as THREE.MeshStandardMaterial
      glowMat.emissiveIntensity = 1 + flicker
    })

    // Animate vending machines
    vendingMachineRefsArray.current.forEach((refs) => {
      if (!refs?.screenRef.current) return

      const mat = refs.screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.8 + Math.sin(time * 2) * 0.2
    })

    // Animate neon signs
    neonSignRefsArray.current.forEach((refs) => {
      if (!refs?.meshRef.current) return

      const mat = refs.meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.8 + Math.sin(time * 3) * 0.2
    })
  })

  return (
    <group>
      {/* Street lights */}
      {streetLightData.map((light, i) => (
        <StreetLight
          key={`light-${i}`}
          position={light.position}
          color={light.color}
          onMount={handleStreetLightMount(i)}
        />
      ))}

      {/* Vending machines */}
      {vendingMachineData.map((machine, i) => (
        <VendingMachine
          key={`machine-${i}`}
          position={machine.position}
          color={machine.color}
          onMount={handleVendingMachineMount(i)}
        />
      ))}

      {/* Neon signs */}
      {neonSignData.map((sign, i) => (
        <NeonSign
          key={`sign-${i}`}
          position={sign.position}
          rotation={sign.rotation}
          size={sign.size}
          color={sign.color}
          onMount={handleNeonSignMount(i)}
        />
      ))}
    </group>
  )
}
