'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gpuParticleShader } from '@/lib/shaders/gpuParticles'
import type { ColorTheme } from '@/lib/themes'

interface GPUParticleSystemProps {
  count?: number
  audioReactivity?: number
  theme?: ColorTheme
  area?: [number, number, number]
  particleSize?: number
}

export default function GPUParticleSystem({
  count = 5000,
  audioReactivity = 0,
  theme,
  area = [100, 50, 100],
  particleSize = 20,
}: GPUParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null)

  // Generate particle data
  const { positions, velocities, sizes, lives, ids } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const lives = new Float32Array(count)
    const ids = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Random position within area
      positions[i3] = (Math.random() - 0.5) * area[0]
      positions[i3 + 1] = Math.random() * area[1]
      positions[i3 + 2] = (Math.random() - 0.5) * area[2]

      // Random velocity
      velocities[i3] = (Math.random() - 0.5) * 0.2
      velocities[i3 + 1] = -Math.random() * 0.5 - 0.1 // Mostly downward
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.2

      // Random size and life
      sizes[i] = Math.random() * particleSize + particleSize * 0.5
      lives[i] = Math.random()

      // Unique ID
      ids[i] = i
    }

    return { positions, velocities, sizes, lives, ids }
  }, [count, area, particleSize])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('particlePosition', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('particleVelocity', new THREE.Float32BufferAttribute(velocities, 3))
    geo.setAttribute('particleSize', new THREE.Float32BufferAttribute(sizes, 1))
    geo.setAttribute('particleLife', new THREE.Float32BufferAttribute(lives, 1))
    geo.setAttribute('particleId', new THREE.Float32BufferAttribute(ids, 1))
    return geo
  }, [positions, velocities, sizes, lives, ids])

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      audioReactivity: { value: 0 },
      particleColor1: {
        value: new THREE.Color(theme?.colors.primary || '#00ffff'),
      },
      particleColor2: {
        value: new THREE.Color(theme?.colors.secondary || '#ff00ff'),
      },
      glowIntensity: { value: 1.5 },
      softness: { value: 0.1 },
    }),
    [theme]
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: gpuParticleShader.vertexShader,
        fragmentShader: gpuParticleShader.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [uniforms]
  )

  useFrame((state) => {
    if (material.uniforms) {
      material.uniforms.time.value = state.clock.elapsedTime
      material.uniforms.audioReactivity.value = audioReactivity
    }

    // Update particle lives
    if (pointsRef.current) {
      const lifeAttr = pointsRef.current.geometry.getAttribute('particleLife') as THREE.BufferAttribute
      const posAttr = pointsRef.current.geometry.getAttribute('particlePosition') as THREE.BufferAttribute

      for (let i = 0; i < count; i++) {
        const i3 = i * 3

        // Decrease life
        lifeAttr.array[i] -= 0.003

        // Reset particle when life runs out
        if (lifeAttr.array[i] <= 0) {
          lifeAttr.array[i] = 1.0
          posAttr.array[i3] = (Math.random() - 0.5) * area[0]
          posAttr.array[i3 + 1] = area[1]
          posAttr.array[i3 + 2] = (Math.random() - 0.5) * area[2]
        }
      }

      lifeAttr.needsUpdate = true
      posAttr.needsUpdate = true
    }
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
