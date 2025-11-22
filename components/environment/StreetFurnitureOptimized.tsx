'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface StreetFurnitureProps {
  bass: number
  theme?: ColorTheme
}

export default function StreetFurniture({ bass, theme }: StreetFurnitureProps) {
  const primaryColor = theme ? new THREE.Color(theme.colors.primary) : new THREE.Color('#00ffff')
  const secondaryColor = theme ? new THREE.Color(theme.colors.secondary) : new THREE.Color('#ff00ff')
  const tertiaryColor = theme ? new THREE.Color(theme.colors.tertiary) : new THREE.Color('#ffaa00')

  // Refs for instanced meshes
  const lampsRef = useRef<THREE.Group>(null)
  const lampLightsRef = useRef<THREE.InstancedMesh>(null)
  const trashBinsRef = useRef<THREE.InstancedMesh>(null)
  const benchesRef = useRef<THREE.InstancedMesh>(null)
  const vendingMachinesRef = useRef<THREE.Group>(null)
  const vendingScreensRef = useRef<THREE.InstancedMesh>(null)
  const adPillarsRef = useRef<THREE.Group>(null)
  const adHologramsRef = useRef<THREE.InstancedMesh>(null)
  const barriersRef = useRef<THREE.InstancedMesh>(null)

  // Reusable objects
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Generate furniture positions
  const furnitureData = useMemo(() => {
    const innerRadius = 32
    const outerRadius = 65

    // Street lamps - 24 total
    const lamps = []
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2
      const radius = innerRadius + 3
      lamps.push({
        position: new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
        color: i % 2 === 0 ? primaryColor.clone() : secondaryColor.clone(),
        phase: Math.random() * Math.PI * 2
      })
    }

    // Trash bins - 16 total
    const trash = []
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16 + 0.05) * Math.PI * 2
      const radius = innerRadius + 1 + Math.random() * 2
      trash.push({
        position: new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
        rotation: Math.random() * Math.PI * 2
      })
    }

    // Benches - 12 total
    const benches = []
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12 + 0.03) * Math.PI * 2
      const radius = innerRadius + 2
      benches.push({
        position: new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
        rotation: angle + Math.PI
      })
    }

    // Vending machines - 8 total
    const vending = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = innerRadius - 1
      vending.push({
        position: new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
        rotation: angle,
        color: i % 3 === 0 ? primaryColor.clone() : i % 3 === 1 ? secondaryColor.clone() : tertiaryColor.clone(),
        phase: Math.random() * Math.PI * 2
      })
    }

    // Ad pillars - 6 total
    const ads = []
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6 + 0.08) * Math.PI * 2
      const radius = outerRadius - 5
      ads.push({
        position: new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
        color: i % 2 === 0 ? primaryColor.clone() : secondaryColor.clone()
      })
    }

    // Traffic barriers - 8 total
    const barriers = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = 28
      barriers.push({
        position: new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
        rotation: angle + Math.PI / 2
      })
    }

    return { lamps, trash, benches, vending, ads, barriers }
  }, [primaryColor, secondaryColor, tertiaryColor])

  // Initialize lamp lights (instanced)
  useEffect(() => {
    if (!lampLightsRef.current) return

    furnitureData.lamps.forEach((lamp, i) => {
      tempObject.position.copy(lamp.position)
      tempObject.position.y = 4.9
      tempObject.scale.set(0.35, 0.1, 0.35)
      tempObject.updateMatrix()
      lampLightsRef.current!.setMatrixAt(i, tempObject.matrix)
      lampLightsRef.current!.setColorAt(i, lamp.color)
    })

    lampLightsRef.current.instanceMatrix.needsUpdate = true
    if (lampLightsRef.current.instanceColor) {
      lampLightsRef.current.instanceColor.needsUpdate = true
    }
  }, [furnitureData.lamps, tempObject])

  // Initialize trash bins (instanced)
  useEffect(() => {
    if (!trashBinsRef.current) return

    furnitureData.trash.forEach((bin, i) => {
      tempObject.position.copy(bin.position)
      tempObject.position.y = 0.5
      tempObject.rotation.set(0, bin.rotation, 0)
      tempObject.scale.set(0.3, 1, 0.3)
      tempObject.updateMatrix()
      trashBinsRef.current!.setMatrixAt(i, tempObject.matrix)
    })

    trashBinsRef.current.instanceMatrix.needsUpdate = true
  }, [furnitureData.trash, tempObject])

  // Initialize benches (instanced)
  useEffect(() => {
    if (!benchesRef.current) return

    furnitureData.benches.forEach((bench, i) => {
      tempObject.position.copy(bench.position)
      tempObject.position.y = 0.4
      tempObject.rotation.set(0, bench.rotation, 0)
      tempObject.scale.set(1.5, 0.08, 0.5)
      tempObject.updateMatrix()
      benchesRef.current!.setMatrixAt(i, tempObject.matrix)
    })

    benchesRef.current.instanceMatrix.needsUpdate = true
  }, [furnitureData.benches, tempObject])

  // Initialize vending machine screens (instanced)
  useEffect(() => {
    if (!vendingScreensRef.current) return

    furnitureData.vending.forEach((machine, i) => {
      tempObject.position.copy(machine.position)
      tempObject.position.y = 1.3
      tempObject.position.x += Math.cos(machine.rotation) * 0.41
      tempObject.position.z += Math.sin(machine.rotation) * 0.41
      tempObject.rotation.set(0, machine.rotation, 0)
      tempObject.scale.set(0.9, 0.7, 0.05)
      tempObject.updateMatrix()
      vendingScreensRef.current!.setMatrixAt(i, tempObject.matrix)
      vendingScreensRef.current!.setColorAt(i, machine.color)
    })

    vendingScreensRef.current.instanceMatrix.needsUpdate = true
    if (vendingScreensRef.current.instanceColor) {
      vendingScreensRef.current.instanceColor.needsUpdate = true
    }
  }, [furnitureData.vending, tempObject])

  // Initialize ad holograms (instanced)
  useEffect(() => {
    if (!adHologramsRef.current) return

    furnitureData.ads.forEach((ad, i) => {
      tempObject.position.copy(ad.position)
      tempObject.position.y = 2
      tempObject.scale.set(1.2, 1.8, 1)
      tempObject.updateMatrix()
      adHologramsRef.current!.setMatrixAt(i, tempObject.matrix)
      adHologramsRef.current!.setColorAt(i, ad.color)
    })

    adHologramsRef.current.instanceMatrix.needsUpdate = true
    if (adHologramsRef.current.instanceColor) {
      adHologramsRef.current.instanceColor.needsUpdate = true
    }
  }, [furnitureData.ads, tempObject])

  // Initialize barriers (instanced)
  useEffect(() => {
    if (!barriersRef.current) return

    furnitureData.barriers.forEach((barrier, i) => {
      tempObject.position.copy(barrier.position)
      tempObject.position.y = 0.5
      tempObject.rotation.set(0, barrier.rotation, 0)
      tempObject.scale.set(1.3, 0.8, 0.15)
      tempObject.updateMatrix()
      barriersRef.current!.setMatrixAt(i, tempObject.matrix)
    })

    barriersRef.current.instanceMatrix.needsUpdate = true
  }, [furnitureData.barriers, tempObject])

  // Animate lamp lights (flicker)
  useFrame((state) => {
    if (!lampLightsRef.current) return
    const time = state.clock.elapsedTime

    furnitureData.lamps.forEach((lamp, i) => {
      const material = lampLightsRef.current!.material as THREE.MeshStandardMaterial
      // Gentle flicker using instance color
      const flicker = 1.2 + Math.sin(time * 2 + lamp.phase) * 0.1
      tempColor.copy(lamp.color).multiplyScalar(flicker)
      lampLightsRef.current!.setColorAt(i, tempColor)
    })

    if (lampLightsRef.current.instanceColor) {
      lampLightsRef.current.instanceColor.needsUpdate = true
    }
  })

  // Animate vending screens (flicker)
  useFrame((state) => {
    if (!vendingScreensRef.current) return
    const time = state.clock.elapsedTime

    furnitureData.vending.forEach((machine, i) => {
      const flicker = 0.8 + Math.sin(time * 5 + machine.phase) * 0.2
      tempColor.copy(machine.color).multiplyScalar(flicker)
      vendingScreensRef.current!.setColorAt(i, tempColor)
    })

    if (vendingScreensRef.current.instanceColor) {
      vendingScreensRef.current.instanceColor.needsUpdate = true
    }
  })

  // Animate ad holograms (rotation + bass reactivity)
  useFrame((state) => {
    if (!adHologramsRef.current) return
    const time = state.clock.elapsedTime

    furnitureData.ads.forEach((ad, i) => {
      tempObject.position.copy(ad.position)
      tempObject.position.y = 2
      tempObject.rotation.y = time * 0.5 + i
      tempObject.scale.set(1.2, 1.8, 1)
      tempObject.updateMatrix()
      adHologramsRef.current!.setMatrixAt(i, tempObject.matrix)

      // Bass reactivity
      const intensity = 0.7 + bass * 0.5
      tempColor.copy(ad.color).multiplyScalar(intensity)
      adHologramsRef.current!.setColorAt(i, tempColor)
    })

    adHologramsRef.current.instanceMatrix.needsUpdate = true
    if (adHologramsRef.current.instanceColor) {
      adHologramsRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Street Lamps - Instanced */}
      <group ref={lampsRef}>
        {/* Lamp poles - individual meshes (only 24) */}
        {furnitureData.lamps.map((lamp, i) => (
          <mesh key={i} position={lamp.position}>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 5, 8]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 5.2, 0]}>
              <boxGeometry args={[0.4, 0.6, 0.4]} />
              <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.3} />
            </mesh>
          </mesh>
        ))}
        {/* Lamp lights - instanced */}
        <instancedMesh ref={lampLightsRef} args={[undefined, undefined, furnitureData.lamps.length]}>
          <boxGeometry />
          <meshStandardMaterial
            emissive="#ffffff"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </instancedMesh>
      </group>

      {/* Trash Bins - Instanced */}
      <instancedMesh ref={trashBinsRef} args={[undefined, undefined, furnitureData.trash.length]}>
        <cylinderGeometry args={[1, 1.2, 1, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.4} roughness={0.8} />
      </instancedMesh>

      {/* Benches - Instanced */}
      <instancedMesh ref={benchesRef} args={[undefined, undefined, furnitureData.benches.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#1a2a3a" metalness={0.6} roughness={0.5} />
      </instancedMesh>

      {/* Vending Machines - Bodies (individual, only 8) + Screens (instanced) */}
      <group ref={vendingMachinesRef}>
        {furnitureData.vending.map((machine, i) => (
          <mesh
            key={i}
            position={machine.position}
            rotation={[0, machine.rotation, 0]}
          >
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[1.2, 2, 0.8]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
            </mesh>
          </mesh>
        ))}
        {/* Screens - instanced */}
        <instancedMesh ref={vendingScreensRef} args={[undefined, undefined, furnitureData.vending.length]}>
          <boxGeometry />
          <meshStandardMaterial
            emissive="#ffffff"
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        </instancedMesh>
      </group>

      {/* Ad Pillars - Bases (individual, only 6) + Holograms (instanced) */}
      <group ref={adPillarsRef}>
        {furnitureData.ads.map((ad, i) => (
          <mesh key={i} position={ad.position}>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.15, 0.2, 3, 8]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.7, 0.03, 8, 16]} />
              <meshStandardMaterial
                color={ad.color}
                emissive={ad.color}
                emissiveIntensity={1}
                toneMapped={false}
              />
            </mesh>
          </mesh>
        ))}
        {/* Holograms - instanced */}
        <instancedMesh ref={adHologramsRef} args={[undefined, undefined, furnitureData.ads.length]}>
          <planeGeometry />
          <meshStandardMaterial
            emissive="#ffffff"
            emissiveIntensity={0.7}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </instancedMesh>
      </group>

      {/* Traffic Barriers - Instanced */}
      <instancedMesh ref={barriersRef} args={[undefined, undefined, furnitureData.barriers.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.4} />
      </instancedMesh>
    </group>
  )
}
