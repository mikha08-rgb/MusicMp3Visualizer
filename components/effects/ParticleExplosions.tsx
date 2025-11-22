'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  size: number
  color: THREE.Color
}

interface ParticleExplosionsProps {
  bass: number
  beatDetected: boolean
  theme?: ColorTheme
}

export default function ParticleExplosions({ bass, beatDetected, theme }: ParticleExplosionsProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const particlesRef = useRef<Particle[]>([])
  const matrixRef = useRef(new THREE.Matrix4())
  const colorRef = useRef(new THREE.Color())
  const maxParticles = 500

  // Initialize particle pool
  useMemo(() => {
    particlesRef.current = []
  }, [])

  const spawnExplosion = (position: THREE.Vector3, count: number, speed: number) => {
    const colors = theme ? [
      new THREE.Color(theme.colors.primary),
      new THREE.Color(theme.colors.secondary),
      new THREE.Color(theme.colors.tertiary),
      new THREE.Color(theme.colors.orb),
    ] : [new THREE.Color('#ffffff')]

    for (let i = 0; i < count; i++) {
      if (particlesRef.current.length >= maxParticles) break

      // Random spherical direction
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const velocity = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).multiplyScalar(speed * (0.5 + Math.random() * 0.5))

      particlesRef.current.push({
        position: position.clone(),
        velocity,
        life: 1,
        maxLife: 1,
        size: 0.3 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)].clone()
      })
    }
  }

  useFrame((state, delta) => {
    if (!instancedMeshRef.current) return

    // Spawn explosions on beats - reduced frequency and intensity
    if (beatDetected && bass > 0.5) { // Only on stronger beats
      // Single subtle explosion
      const explosionCount = Math.floor(bass * 20) + 5 // Reduced from 50+20 to 20+5
      const explosionSpeed = 5 + bass * 15 // Reduced speed

      spawnExplosion(new THREE.Vector3(0, 0, 0), explosionCount, explosionSpeed)

      // Rare extra explosions only on very strong beats
      if (bass > 0.8) { // Increased threshold from 0.6 to 0.8
        const randomPos = new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          Math.random() * 30,
          (Math.random() - 0.5) * 40
        )
        spawnExplosion(randomPos, Math.floor(bass * 10), explosionSpeed * 0.7) // Reduced count
      }
    }

    // Update particles
    let activeCount = 0
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i]

      // Update physics
      particle.velocity.y -= 9.8 * delta // Gravity
      particle.velocity.multiplyScalar(0.98) // Air resistance
      particle.position.add(particle.velocity.clone().multiplyScalar(delta))
      particle.life -= delta

      // Remove dead particles
      if (particle.life <= 0) {
        particlesRef.current.splice(i, 1)
        continue
      }

      // Update instance matrix
      const scale = particle.size * (particle.life / particle.maxLife) // Fade out
      matrixRef.current.makeScale(scale, scale, scale)
      matrixRef.current.setPosition(particle.position)
      instancedMeshRef.current.setMatrixAt(activeCount, matrixRef.current)

      // Update color with fade
      const alpha = particle.life / particle.maxLife
      colorRef.current.copy(particle.color).multiplyScalar(alpha)
      instancedMeshRef.current.setColorAt(activeCount, colorRef.current)

      activeCount++
    }

    // Update instance count
    instancedMeshRef.current.count = activeCount
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, maxParticles]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color="white"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
