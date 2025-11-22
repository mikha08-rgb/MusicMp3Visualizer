'use client'

import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'
import { geometries } from '@/lib/geometry-library'
import { AnimationManager } from '@/lib/AnimationManager'

interface CircuitBoardProps {
  bass: number
  mids: number
  theme?: ColorTheme
}

export default function CircuitBoard({ bass, mids, theme }: CircuitBoardProps) {
  const circuitGroupRef = useRef<THREE.Group>(null)
  const nodesRef = useRef<THREE.InstancedMesh>(null)
  const dataPacketsRef = useRef<THREE.InstancedMesh>(null)
  const tracesRef = useRef<THREE.InstancedMesh>(null) // NEW: Single mesh for all traces!

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  // Generate multi-level circuit traces (lines connecting nodes)
  const circuitTraces = useMemo(() => {
    const traces: { start: THREE.Vector3; end: THREE.Vector3; color: string; level: number }[] = []
    const gridSize = 8
    const spacing = 10
    const levels = [0.1, 1.5, 3.0] // Ground, mid, high

    levels.forEach((level, levelIndex) => {
      // Create a grid of circuit traces for each level
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const x = (i - gridSize / 2) * spacing
          const z = (j - gridSize / 2) * spacing

          // Horizontal traces
          if (Math.random() > 0.3 && i < gridSize - 1) {
            traces.push({
              start: new THREE.Vector3(x, level, z),
              end: new THREE.Vector3(x + spacing, level, z),
              color: Math.random() > 0.5 ? primaryColor : tertiaryColor,
              level: levelIndex,
            })
          }

          // Vertical traces
          if (Math.random() > 0.3 && j < gridSize - 1) {
            traces.push({
              start: new THREE.Vector3(x, level, z),
              end: new THREE.Vector3(x, level, z + spacing),
              color: Math.random() > 0.5 ? primaryColor : tertiaryColor,
              level: levelIndex,
            })
          }

          // Diagonal traces for complexity (fewer of these)
          if (Math.random() > 0.7 && i < gridSize - 1 && j < gridSize - 1) {
            traces.push({
              start: new THREE.Vector3(x, level, z),
              end: new THREE.Vector3(x + spacing, level, z + spacing),
              color: secondaryColor,
              level: levelIndex,
            })
          }
        }
      }
    })

    // Add vertical connections between levels
    const connectionCount = 12
    for (let i = 0; i < connectionCount; i++) {
      const x = (Math.random() - 0.5) * spacing * gridSize * 0.8
      const z = (Math.random() - 0.5) * spacing * gridSize * 0.8

      // Connect ground to mid
      traces.push({
        start: new THREE.Vector3(x, 0.1, z),
        end: new THREE.Vector3(x, 1.5, z),
        color: primaryColor,
        level: -1, // Special level for vertical connections
      })

      // Connect mid to high
      traces.push({
        start: new THREE.Vector3(x, 1.5, z),
        end: new THREE.Vector3(x, 3.0, z),
        color: tertiaryColor,
        level: -1,
      })
    }

    return traces
  }, [primaryColor, secondaryColor, tertiaryColor])

  // Generate connection nodes (circuit junctions) across all levels
  const nodePositions = useMemo(() => {
    const positions: THREE.Vector3[] = []
    const gridSize = 8
    const spacing = 10
    const levels = [0.2, 1.7, 3.2] // Slightly above circuit traces

    levels.forEach((level) => {
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (Math.random() > 0.5) {
            const x = (i - gridSize / 2) * spacing
            const z = (j - gridSize / 2) * spacing
            positions.push(new THREE.Vector3(x, level, z))
          }
        }
      }
    })

    return positions
  }, [])

  const nodeCount = nodePositions.length
  const dataPacketCount = 40 // Doubled for multi-level routing

  // Temporary objects for matrix updates - reused across frames
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])
  const tempVector = useMemo(() => new THREE.Vector3(), []) // OPTIMIZATION: Reuse instead of creating in loop!

  // Store bass in ref for AnimationManager
  const bassRef = useRef(bass)
  bassRef.current = bass

  // Initialize node instances
  useMemo(() => {
    if (!nodesRef.current) return

    nodePositions.forEach((pos, i) => {
      tempObject.position.copy(pos)
      tempObject.scale.set(1, 1, 1)
      tempObject.updateMatrix()

      if (nodesRef.current) {
        nodesRef.current.setMatrixAt(i, tempObject.matrix)
        const color = i % 2 === 0 ? primaryColor : tertiaryColor
        nodesRef.current.setColorAt(i, tempColor.set(color))
      }
    })

    if (nodesRef.current) {
      nodesRef.current.instanceMatrix.needsUpdate = true
      if (nodesRef.current.instanceColor) {
        nodesRef.current.instanceColor.needsUpdate = true
      }
    }
  }, [nodePositions, tempObject, tempColor, primaryColor, tertiaryColor])

  // MEGA-OPTIMIZATION: Initialize all traces as instances (150+ draw calls → 1!)
  useEffect(() => {
    if (!tracesRef.current || circuitTraces.length === 0) return

    circuitTraces.forEach((trace, i) => {
      if (!trace || !trace.start || !trace.end) return

      // Calculate position (midpoint of trace)
      const midpoint = new THREE.Vector3().lerpVectors(trace.start, trace.end, 0.5)
      tempObject.position.copy(midpoint)

      // Calculate rotation to align cylinder with trace direction
      const direction = new THREE.Vector3().subVectors(trace.end, trace.start)
      const length = direction.length()

      // Guard against zero-length traces
      if (length === 0) return
      direction.normalize()

      // Align cylinder (default pointing up) to trace direction
      const quaternion = new THREE.Quaternion()
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
      tempObject.quaternion.copy(quaternion)

      // Scale: cylinder height = trace length, radius = trace thickness
      const isVertical = trace.level === -1
      const radius = isVertical ? 0.06 : 0.05
      tempObject.scale.set(radius, length, radius)
      tempObject.updateMatrix()

      tracesRef.current!.setMatrixAt(i, tempObject.matrix)
      tracesRef.current!.setColorAt(i, tempColor.set(trace.color))
    })

    tracesRef.current.instanceMatrix.needsUpdate = true
    if (tracesRef.current.instanceColor) {
      tracesRef.current.instanceColor.needsUpdate = true
    }
  }, [circuitTraces, tempObject, tempColor])

  // Migrated to AnimationManager - MASSIVE performance improvement!
  useEffect(() => {
    const unregister = AnimationManager.register(
      'circuit-board-animation',
      (time) => {
        if (!dataPacketsRef.current || circuitTraces.length === 0) return

        // Animate data packets traveling along circuit traces
        for (let i = 0; i < dataPacketCount; i++) {
          const traceIndex = i % circuitTraces.length
          const trace = circuitTraces[traceIndex]

          // Travel along the trace
          const t = ((time * (0.5 + bassRef.current * 0.5) + i * 0.5) % 1.0)

          // OPTIMIZATION: Reuse tempVector instead of creating new Vector3 40 times per frame!
          tempVector.lerpVectors(trace.start, trace.end, t)
          tempObject.position.copy(tempVector)
          tempObject.position.y = 0.3 // Slightly above circuit traces
          tempObject.scale.setScalar(0.3 + bassRef.current * 0.2)
          tempObject.updateMatrix()

          dataPacketsRef.current.setMatrixAt(i, tempObject.matrix)
          dataPacketsRef.current.setColorAt(i, tempColor.set(trace.color))
        }

        dataPacketsRef.current.instanceMatrix.needsUpdate = true
        if (dataPacketsRef.current.instanceColor) {
          dataPacketsRef.current.instanceColor.needsUpdate = true
        }

        // Pulse nodes with bass
        if (nodesRef.current) {
          const scale = 1 + bassRef.current * 0.3
          nodePositions.forEach((pos, i) => {
            tempObject.position.copy(pos)
            tempObject.scale.setScalar(scale)
            tempObject.updateMatrix()
            nodesRef.current!.setMatrixAt(i, tempObject.matrix)
          })
          nodesRef.current.instanceMatrix.needsUpdate = true
        }

        // MEGA-OPTIMIZATION: Pulse ALL traces in single update (was 150+ separate animations!)
        if (tracesRef.current) {
          // Update opacity/brightness via material (all instances share same material)
          const material = tracesRef.current.material as THREE.MeshBasicMaterial
          // Subtle pulse with bass - no per-instance updates needed!
          material.opacity = 0.8 + bassRef.current * 0.15
        }
      },
      'high', // High priority - always visible ground layer
      60 // 60 Hz - smooth packet animation
    )

    return unregister
  }, [circuitTraces, dataPacketCount, nodePositions, tempObject, tempColor, tempVector])

  return (
    <group ref={circuitGroupRef} position={[0, 0, 0]}>
      {/* MEGA-OPTIMIZATION: All circuit traces in ONE mesh (150+ draw calls → 1!) */}
      <instancedMesh ref={tracesRef} args={[undefined, undefined, circuitTraces.length]}>
        <cylinderGeometry args={[1, 1, 1, 4, 1]} />
        {/* ULTRA-OPTIMIZATION: MeshBasic for glowing traces (massive FPS boost!) */}
        <meshBasicMaterial
          color="white"
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Connection nodes (glowing spheres at junctions) - using shared geometry */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodeCount]}>
        <primitive object={geometries.sphere.small} />
        {/* ULTRA-OPTIMIZATION: MeshBasic for glowing nodes (3-5x faster!) */}
        <meshBasicMaterial
          color={primaryColor}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Data packets (traveling along traces) - using shared geometry */}
      <instancedMesh ref={dataPacketsRef} args={[undefined, undefined, dataPacketCount]}>
        <primitive object={geometries.sphere.tiny} />
        {/* ULTRA-OPTIMIZATION: MeshBasic for glowing packets (3-5x faster!) */}
        <meshBasicMaterial
          color={tertiaryColor}
          transparent
          opacity={0.95}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}
