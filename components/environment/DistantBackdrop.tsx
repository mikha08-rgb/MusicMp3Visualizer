'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface DistantBackdropProps {
  bass: number
  theme?: ColorTheme
}

/**
 * Enhanced atmospheric 2D backdrop with subtle cyberpunk effects
 * All effects are non-intrusive and performance-friendly
 */
export default function DistantBackdrop({ bass, theme }: DistantBackdropProps) {
  const buildingRefs = useRef<THREE.Mesh[]>([])
  const windowRefs = useRef<THREE.Mesh[]>([])
  const billboardRefs = useRef<THREE.Mesh[]>([])
  const glowShaftRefs = useRef<THREE.Mesh[]>([])
  const cloudRefs = useRef<THREE.Mesh[]>([])
  const hazeRef = useRef<THREE.Mesh>(null)
  const gridRef = useRef<THREE.Mesh>(null)

  // Theme colors
  const color1 = useMemo(() => new THREE.Color(theme?.colors.primary || '#00ffff'), [theme])
  const color2 = useMemo(() => new THREE.Color(theme?.colors.secondary || '#ff00ff'), [theme])
  const color3 = useMemo(() => new THREE.Color(theme?.colors.tertiary || '#8b00ff'), [theme])

  // Building skyline data with window lights
  const buildingData = useMemo(() => {
    const buildings = []
    const count = 12
    const radius = 450

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      const baseHeight = 50 + Math.random() * 100
      const width = 50 + Math.random() * 70

      const colors = [color1, color2, color3]
      const color = colors[Math.floor(Math.random() * colors.length)]

      // Window data for this building
      const windowCount = 3 + Math.floor(Math.random() * 5)
      const windows = []
      for (let w = 0; w < windowCount; w++) {
        windows.push({
          x: (Math.random() - 0.5) * width * 0.6,
          y: (Math.random() - 0.3) * baseHeight,
          twinklePhase: Math.random() * Math.PI * 2
        })
      }

      buildings.push({ x, z, angle, baseHeight, width, color, windows })
    }

    return buildings
  }, [color1, color2, color3])

  // Holographic billboard data
  const billboardData = useMemo(() => {
    const billboards = []
    const count = 8

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
      const radius = 420 + Math.random() * 50
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const height = 80 + Math.random() * 40

      const colors = [color1, color2, color3]
      const color = colors[i % 3]

      const width = 20 + Math.random() * 25
      const billHeight = 10 + Math.random() * 8

      billboards.push({ x, z, angle, height, width, billHeight, color, flickerPhase: Math.random() * Math.PI * 2 })
    }

    return billboards
  }, [color1, color2, color3])

  // Cloud data
  const cloudData = useMemo(() => {
    const clouds = []
    const count = 5

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
      const radius = 400 + Math.random() * 100
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const height = 60 + Math.random() * 30

      const width = 80 + Math.random() * 60
      const cloudHeight = 15 + Math.random() * 10

      clouds.push({ x, z, angle, height, width, cloudHeight, rotationSpeed: 0.01 + Math.random() * 0.02 })
    }

    return clouds
  }, [])

  // Glow shaft data
  const glowShaftData = useMemo(() => {
    const shafts = []
    const count = 8
    const radius = 380

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const height = 70 + Math.random() * 50

      const colors = [color1, color2, color3]
      const color = colors[i % 3]

      shafts.push({ x, z, angle, height, color })
    }

    return shafts
  }, [color1, color2, color3])

  // Subtle animations
  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Building silhouettes - very subtle pulse
    buildingRefs.current.forEach((building, i) => {
      if (!building) return
      const material = building.material as THREE.MeshBasicMaterial
      material.opacity = 0.65 + bass * 0.12 + Math.sin(time * 0.4 + i) * 0.04
    })

    // Window lights - gentle twinkle
    windowRefs.current.forEach((window, i) => {
      if (!window) return
      const material = window.material as THREE.MeshBasicMaterial
      const phase = (window as any).twinklePhase || 0
      material.opacity = 0.6 + Math.sin(time * 1.5 + phase) * 0.3
    })

    // Billboards - slow flicker (not flash)
    billboardRefs.current.forEach((billboard, i) => {
      if (!billboard) return
      const material = billboard.material as THREE.MeshBasicMaterial
      const phase = (billboard as any).flickerPhase || 0
      material.opacity = 0.5 + Math.sin(time * 0.8 + phase) * 0.2 + bass * 0.1
    })

    // Glow shafts - gentle pulse
    glowShaftRefs.current.forEach((shaft, i) => {
      if (!shaft) return
      const material = shaft.material as THREE.MeshBasicMaterial
      material.opacity = 0.1 + bass * 0.06 + Math.sin(time * 0.6 + i) * 0.03
    })

    // Clouds - very slow drift and rotation
    cloudRefs.current.forEach((cloud, i) => {
      if (!cloud) return
      const data = cloudData[i]
      if (data) {
        cloud.rotation.y += data.rotationSpeed * 0.016
      }
      const material = cloud.material as THREE.MeshBasicMaterial
      material.opacity = 0.15 + Math.sin(time * 0.2 + i) * 0.05
    })

    // Horizon haze - slow breathing
    if (hazeRef.current) {
      const material = hazeRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.15 + bass * 0.06 + Math.sin(time * 0.25) * 0.04

      // Subtle color shift
      const colorShift = Math.sin(time * 0.1) * 0.5 + 0.5
      material.color.lerpColors(color1, color2, colorShift)
    }

    // Holographic grid - subtle scanline effect
    if (gridRef.current) {
      const material = gridRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.04 + Math.sin(time * 0.5) * 0.015
    }
  })

  return (
    <group>
      {/* Holographic Grid Sky - very subtle */}
      <mesh
        ref={gridRef}
        position={[0, 50, 0]}
        rotation={[-Math.PI / 2.5, 0, 0]}
      >
        <planeGeometry args={[1000, 600, 20, 12]} />
        <meshBasicMaterial
          color={color1}
          wireframe
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmospheric Clouds with City Glow */}
      {cloudData.map((cloud, i) => (
        <mesh
          key={`cloud-${i}`}
          ref={(el) => {
            if (el) cloudRefs.current[i] = el
          }}
          position={[cloud.x, cloud.height, cloud.z]}
        >
          <planeGeometry args={[cloud.width, cloud.cloudHeight]} />
          <meshBasicMaterial
            color={color3}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Horizon Haze - atmospheric depth */}
      <mesh
        ref={hazeRef}
        position={[0, 20, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[300, 490, 64]} />
        <meshBasicMaterial
          color={color1}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Secondary haze layer for depth */}
      <mesh position={[0, 10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[250, 350, 64]} />
        <meshBasicMaterial
          color={color2}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Glow Shafts - vertical light beams */}
      {glowShaftData.map((shaft, i) => (
        <mesh
          key={`shaft-${i}`}
          ref={(el) => {
            if (el) glowShaftRefs.current[i] = el
          }}
          position={[shaft.x, shaft.height / 2, shaft.z]}
          rotation={[0, shaft.angle + Math.PI, 0]}
        >
          <planeGeometry args={[10, shaft.height]} />
          <meshBasicMaterial
            color={shaft.color}
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Building Silhouettes with Details */}
      {buildingData.map((building, i) => (
        <group key={`building-${i}`}>
          {/* Main building shape */}
          <mesh
            ref={(el) => {
              if (el) buildingRefs.current[i] = el
            }}
            position={[building.x, building.baseHeight / 2, building.z]}
            rotation={[0, building.angle + Math.PI, 0]}
          >
            <planeGeometry args={[building.width, building.baseHeight]} />
            <meshBasicMaterial
              color={building.color}
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Top glow - rooftop lights */}
          <mesh
            position={[building.x, building.baseHeight - 3, building.z]}
            rotation={[0, building.angle + Math.PI, 0]}
          >
            <planeGeometry args={[building.width * 1.15, 8]} />
            <meshBasicMaterial
              color={building.color}
              transparent
              opacity={0.45}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Window lights - tiny twinkling dots */}
          {building.windows.map((window, w) => (
            <mesh
              key={`window-${i}-${w}`}
              ref={(el) => {
                if (el) {
                  windowRefs.current.push(el)
                  ;(el as any).twinklePhase = window.twinklePhase
                }
              }}
              position={[
                building.x + window.x,
                building.baseHeight / 2 + window.y,
                building.z
              ]}
              rotation={[0, building.angle + Math.PI, 0]}
            >
              <planeGeometry args={[1.5, 1.5]} />
              <meshBasicMaterial
                color="#ffeeaa"
                transparent
                opacity={0.6}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          ))}

          {/* Antenna/spire on some buildings */}
          {Math.random() > 0.6 && (
            <mesh
              position={[building.x, building.baseHeight + 8, building.z]}
              rotation={[0, building.angle + Math.PI, 0]}
            >
              <planeGeometry args={[2, 16]} />
              <meshBasicMaterial
                color={building.color}
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Holographic Billboards - slow flicker */}
      {billboardData.map((billboard, i) => (
        <mesh
          key={`billboard-${i}`}
          ref={(el) => {
            if (el) {
              billboardRefs.current[i] = el
              ;(el as any).flickerPhase = billboard.flickerPhase
            }
          }}
          position={[billboard.x, billboard.height, billboard.z]}
          rotation={[0, billboard.angle + Math.PI, 0]}
        >
          <planeGeometry args={[billboard.width, billboard.billHeight]} />
          <meshBasicMaterial
            color={billboard.color}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Ground ambient glow */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[360, 510, 64]} />
        <meshBasicMaterial
          color={color2}
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
