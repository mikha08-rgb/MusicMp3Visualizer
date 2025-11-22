'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Simple easing functions
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t)
const smoothLerp = (a: number, b: number, alpha: number, easingFn: (t: number) => number) => a + (b - a) * easingFn(alpha)

interface OrbitalElementsProps {
  mids: number
  highs: number
  beatDetected: boolean
  isPlaying: boolean
  color?: string
}

// Formation patterns for particles to morph between
const FORMATIONS = {
  sphere: (i: number, total: number, radius: number) => {
    const phi = Math.acos(-1 + (2 * i) / total)
    const theta = Math.sqrt(total * Math.PI) * phi
    return new THREE.Vector3(
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi)
    )
  },
  torus: (i: number, total: number, radius: number) => {
    const angle1 = (i / total) * Math.PI * 2
    const angle2 = ((i * 17) / total) * Math.PI * 2
    const majorRadius = radius
    const minorRadius = radius * 0.3
    return new THREE.Vector3(
      (majorRadius + minorRadius * Math.cos(angle2)) * Math.cos(angle1),
      minorRadius * Math.sin(angle2),
      (majorRadius + minorRadius * Math.cos(angle2)) * Math.sin(angle1)
    )
  },
  helix: (i: number, total: number, radius: number) => {
    const t = i / total
    const angle = t * Math.PI * 8
    const height = (t - 0.5) * radius * 2
    return new THREE.Vector3(
      Math.cos(angle) * radius * 0.7,
      height,
      Math.sin(angle) * radius * 0.7
    )
  },
  cube: (i: number, total: number, radius: number) => {
    const side = Math.floor(i / (total / 6))
    const localI = i % Math.floor(total / 6)
    const localTotal = Math.floor(total / 6)
    const u = (localI % Math.sqrt(localTotal)) / Math.sqrt(localTotal)
    const v = Math.floor(localI / Math.sqrt(localTotal)) / Math.sqrt(localTotal)
    const s = radius * 0.8

    const positions = [
      new THREE.Vector3(s, (u - 0.5) * 2 * s, (v - 0.5) * 2 * s),
      new THREE.Vector3(-s, (u - 0.5) * 2 * s, (v - 0.5) * 2 * s),
      new THREE.Vector3((u - 0.5) * 2 * s, s, (v - 0.5) * 2 * s),
      new THREE.Vector3((u - 0.5) * 2 * s, -s, (v - 0.5) * 2 * s),
      new THREE.Vector3((u - 0.5) * 2 * s, (v - 0.5) * 2 * s, s),
      new THREE.Vector3((u - 0.5) * 2 * s, (v - 0.5) * 2 * s, -s),
    ]

    return positions[side] || positions[0]
  },
}

export default function OrbitalElements({
  mids,
  highs,
  beatDetected,
  isPlaying,
  color = '#ff00ff'
}: OrbitalElementsProps) {
  const particlesRef = useRef<THREE.InstancedMesh>(null)
  const trailsRef = useRef<THREE.InstancedMesh>(null)
  const connectionsRef = useRef<THREE.LineSegments>(null)

  const particleCount = 400
  const trailLength = 8
  const baseColor = useMemo(() => new THREE.Color(color), [color])

  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Particle data
  const particleDataRef = useRef<Array<{
    currentPos: THREE.Vector3
    targetPos: THREE.Vector3
    velocity: THREE.Vector3
    trailPositions: THREE.Vector3[]
    energy: number
    orbitSpeed: number
    orbitPhase: number
  }>>([])

  // Formation morphing state
  const formationStateRef = useRef({
    current: 'sphere' as keyof typeof FORMATIONS,
    next: 'torus' as keyof typeof FORMATIONS,
    morphProgress: 0,
    baseRadius: 8,
  })

  const beatIntensityRef = useRef(0)
  const burstParticlesRef = useRef<Array<{
    pos: THREE.Vector3
    vel: THREE.Vector3
    life: number
  }>>([])

  // Initialize particles
  useEffect(() => {
    particleDataRef.current = Array.from({ length: particleCount }, (_, i) => {
      const pos = FORMATIONS.sphere(i, particleCount, formationStateRef.current.baseRadius)
      return {
        currentPos: pos.clone(),
        targetPos: pos.clone(),
        velocity: new THREE.Vector3(),
        trailPositions: Array(trailLength).fill(null).map(() => pos.clone()),
        energy: Math.random(),
        orbitSpeed: 0.5 + Math.random() * 0.5,
        orbitPhase: Math.random() * Math.PI * 2,
      }
    })
  }, [])

  useFrame((state, delta) => {
    if (!particlesRef.current || !isPlaying) return

    const time = state.clock.getElapsedTime()

    // Beat reaction
    if (beatDetected) {
      beatIntensityRef.current = 1

      // Change formation on beat
      if (Math.random() > 0.7) {
        const formations = Object.keys(FORMATIONS) as Array<keyof typeof FORMATIONS>
        formationStateRef.current.next = formations[Math.floor(Math.random() * formations.length)]
      }

      // Create burst particles
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 3
        burstParticlesRef.current.push({
          pos: new THREE.Vector3(0, 0, 0),
          vel: new THREE.Vector3(
            Math.cos(angle) * speed,
            (Math.random() - 0.5) * speed * 0.5,
            Math.sin(angle) * speed
          ),
          life: 1,
        })
      }
    } else {
      beatIntensityRef.current *= 0.92
    }

    // Morph formations
    const morphSpeed = 0.3
    if (formationStateRef.current.current !== formationStateRef.current.next) {
      formationStateRef.current.morphProgress += delta * morphSpeed

      if (formationStateRef.current.morphProgress >= 1) {
        formationStateRef.current.current = formationStateRef.current.next
        formationStateRef.current.morphProgress = 0
      }
    }

    // Audio-reactive radius
    const targetRadius = formationStateRef.current.baseRadius * (1 + mids * 0.4 + beatIntensityRef.current * 0.3)

    // Update particles
    for (let i = 0; i < particleCount; i++) {
      const particle = particleDataRef.current[i]

      // Calculate target position (morph between formations)
      const currentFormation = FORMATIONS[formationStateRef.current.current]
      const nextFormation = FORMATIONS[formationStateRef.current.next]

      const pos1 = currentFormation(i, particleCount, targetRadius)
      const pos2 = nextFormation(i, particleCount, targetRadius)

      particle.targetPos.lerpVectors(pos1, pos2, easeInOutCubic(formationStateRef.current.morphProgress))

      // Add orbital motion
      const orbitAngle = time * particle.orbitSpeed + particle.orbitPhase
      const orbitOffset = new THREE.Vector3(
        Math.cos(orbitAngle) * 0.3,
        Math.sin(orbitAngle * 1.3) * 0.3,
        Math.sin(orbitAngle) * 0.3
      )

      particle.targetPos.add(orbitOffset)

      // Smooth movement to target
      particle.velocity.lerp(
        particle.targetPos.clone().sub(particle.currentPos).multiplyScalar(2),
        0.1
      )

      particle.currentPos.add(particle.velocity.clone().multiplyScalar(delta))

      // Update trail
      particle.trailPositions.pop()
      particle.trailPositions.unshift(particle.currentPos.clone())

      // Update energy based on audio
      particle.energy = smoothLerp(particle.energy, highs * 0.8 + beatIntensityRef.current * 0.2, 0.15, easeOutQuad)

      // Set particle transform
      tempObject.position.copy(particle.currentPos)
      tempObject.scale.setScalar(0.08 + particle.energy * 0.12 + beatIntensityRef.current * 0.05)
      tempObject.updateMatrix()
      particlesRef.current.setMatrixAt(i, tempObject.matrix)

      // Color based on energy
      const hsl = { h: 0, s: 0, l: 0 }
      baseColor.getHSL(hsl)
      tempColor.setHSL(
        (hsl.h + particle.energy * 0.1) % 1,
        hsl.s,
        hsl.l * (0.8 + particle.energy * 0.4)
      )
      particlesRef.current.setColorAt(i, tempColor)
    }

    particlesRef.current.instanceMatrix.needsUpdate = true
    if (particlesRef.current.instanceColor) {
      particlesRef.current.instanceColor.needsUpdate = true
    }

    // Update burst particles
    burstParticlesRef.current = burstParticlesRef.current.filter(burst => {
      burst.pos.add(burst.vel.clone().multiplyScalar(delta))
      burst.vel.multiplyScalar(0.95)
      burst.life -= delta * 2
      return burst.life > 0
    })

    // Update trails
    if (trailsRef.current) {
      let trailIndex = 0
      particleDataRef.current.forEach((particle) => {
        particle.trailPositions.forEach((pos, j) => {
          if (trailIndex >= particleCount * trailLength) return

          const alpha = 1 - (j / trailLength)
          const scale = 0.04 * alpha

          tempObject.position.copy(pos)
          tempObject.scale.setScalar(scale)
          tempObject.updateMatrix()

          trailsRef.current!.setMatrixAt(trailIndex, tempObject.matrix)

          tempColor.copy(baseColor).multiplyScalar(alpha * 0.6)
          trailsRef.current!.setColorAt(trailIndex, tempColor)

          trailIndex++
        })
      })

      trailsRef.current.instanceMatrix.needsUpdate = true
      if (trailsRef.current.instanceColor) {
        trailsRef.current.instanceColor.needsUpdate = true
      }
    }

    // Draw connections between nearby particles
    if (connectionsRef.current && highs > 0.3) {
      const positions: number[] = []
      const connectionRadius = 1.5 + highs * 1.5

      for (let i = 0; i < Math.min(particleCount, 100); i++) {
        const p1 = particleDataRef.current[i]

        for (let j = i + 1; j < Math.min(particleCount, 100); j++) {
          const p2 = particleDataRef.current[j]
          const dist = p1.currentPos.distanceTo(p2.currentPos)

          if (dist < connectionRadius) {
            positions.push(p1.currentPos.x, p1.currentPos.y, p1.currentPos.z)
            positions.push(p2.currentPos.x, p2.currentPos.y, p2.currentPos.z)
          }
        }
      }

      const geometry = connectionsRef.current.geometry
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Main particles */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          metalness={0.8}
          roughness={0.2}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Trails */}
      <instancedMesh ref={trailsRef} args={[undefined, undefined, particleCount * trailLength]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </instancedMesh>

      {/* Connections between particles */}
      <lineSegments ref={connectionsRef}>
        <bufferGeometry />
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  )
}
