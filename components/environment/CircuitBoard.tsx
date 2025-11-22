'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface CircuitBoardProps {
  bass: number
  mids: number
  theme?: ColorTheme
}

export default function CircuitBoard({ bass, mids, theme }: CircuitBoardProps) {
  const circuitGroupRef = useRef<THREE.Group>(null)
  const nodesRef = useRef<THREE.InstancedMesh>(null)
  const dataPacketsRef = useRef<THREE.InstancedMesh>(null)

  const primaryColor = theme?.colors.primary || '#00D9FF'
  const secondaryColor = theme?.colors.secondary || '#FF6C00'
  const tertiaryColor = theme?.colors.tertiary || '#0AFDFF'

  // Generate multi-level circuit traces (lines connecting nodes)
  const circuitTraces = useMemo(() => {
    const traces: { start: THREE.Vector3; end: THREE.Vector3; color: string; layer: number }[] = []
    const gridSize = 8
    const spacing = 10
    const layers = [
      { height: 0.1, density: 0.3, color1: primaryColor, color2: tertiaryColor },
      { height: 1.5, density: 0.5, color1: tertiaryColor, color2: secondaryColor },
      { height: 3.0, density: 0.6, color1: secondaryColor, color2: primaryColor },
    ]

    // Create circuit traces for each layer
    layers.forEach((layer, layerIndex) => {
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const x = (i - gridSize / 2) * spacing
          const z = (j - gridSize / 2) * spacing

          // Horizontal traces
          if (Math.random() > layer.density && i < gridSize - 1) {
            traces.push({
              start: new THREE.Vector3(x, layer.height, z),
              end: new THREE.Vector3(x + spacing, layer.height, z),
              color: Math.random() > 0.5 ? layer.color1 : layer.color2,
              layer: layerIndex,
            })
          }

          // Vertical traces
          if (Math.random() > layer.density && j < gridSize - 1) {
            traces.push({
              start: new THREE.Vector3(x, layer.height, z),
              end: new THREE.Vector3(x, layer.height, z + spacing),
              color: Math.random() > 0.5 ? layer.color1 : layer.color2,
              layer: layerIndex,
            })
          }

          // Diagonal traces (for complexity)
          if (Math.random() > 0.7 && i < gridSize - 1 && j < gridSize - 1) {
            traces.push({
              start: new THREE.Vector3(x, layer.height, z),
              end: new THREE.Vector3(x + spacing, layer.height, z + spacing),
              color: layer.color2,
              layer: layerIndex,
            })
          }

          // Vertical connections between layers
          if (layerIndex < layers.length - 1 && Math.random() > 0.8) {
            traces.push({
              start: new THREE.Vector3(x, layer.height, z),
              end: new THREE.Vector3(x, layers[layerIndex + 1].height, z),
              color: tertiaryColor,
              layer: layerIndex,
            })
          }
        }
      }
    })

    return traces
  }, [primaryColor, secondaryColor, tertiaryColor])

  // Generate connection nodes (circuit junctions) - multi-level
  const nodePositions = useMemo(() => {
    const positions: THREE.Vector3[] = []
    const gridSize = 8
    const spacing = 10
    const heights = [0.2, 1.6, 3.1] // Slightly above each trace layer

    heights.forEach((height) => {
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (Math.random() > 0.5) {
            const x = (i - gridSize / 2) * spacing
            const z = (j - gridSize / 2) * spacing
            positions.push(new THREE.Vector3(x, height, z))
          }
        }
      }
    })

    return positions
  }, [])

  const nodeCount = nodePositions.length
  const dataPacketCount = 40 // Increased for multi-layer circuits

  // Temporary objects for matrix updates
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

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

  // Animate data packets traveling along circuit traces
  useFrame((state) => {
    if (!dataPacketsRef.current || circuitTraces.length === 0) return

    const time = state.clock.elapsedTime

    for (let i = 0; i < dataPacketCount; i++) {
      const traceIndex = i % circuitTraces.length
      const trace = circuitTraces[traceIndex]

      // Travel along the trace
      const t = ((time * (0.5 + bass * 0.5) + i * 0.5) % 1.0)
      const pos = new THREE.Vector3().lerpVectors(trace.start, trace.end, t)

      tempObject.position.copy(pos)
      tempObject.position.y += 0.15 // Slightly above circuit traces
      tempObject.scale.setScalar(0.3 + bass * 0.2)
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
      const scale = 1 + bass * 0.3
      nodePositions.forEach((pos, i) => {
        tempObject.position.copy(pos)
        tempObject.scale.setScalar(scale)
        tempObject.updateMatrix()
        nodesRef.current!.setMatrixAt(i, tempObject.matrix)
      })
      nodesRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={circuitGroupRef} position={[0, 0, 0]}>
      {/* Circuit traces (lines) */}
      {circuitTraces.map((trace, index) => (
        <CircuitTrace
          key={`trace-${index}`}
          start={trace.start}
          end={trace.end}
          color={trace.color}
          bass={bass}
        />
      ))}

      {/* Connection nodes (glowing spheres at junctions) */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodeCount]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </instancedMesh>

      {/* Data packets (traveling along traces) */}
      <instancedMesh ref={dataPacketsRef} args={[undefined, undefined, dataPacketCount]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial
          color={tertiaryColor}
          emissive={tertiaryColor}
          emissiveIntensity={1}
          transparent
          opacity={0.7}
        />
      </instancedMesh>
    </group>
  )
}

// Individual circuit trace (glowing line)
function CircuitTrace({
  start,
  end,
  color,
  bass,
}: {
  start: THREE.Vector3
  end: THREE.Vector3
  color: string
  bass: number
}) {
  const traceRef = useRef<THREE.Mesh>(null)

  const tracePath = useMemo(() => {
    return new THREE.LineCurve3(start, end)
  }, [start, end])

  useFrame(() => {
    if (!traceRef.current) return

    // Pulse with bass
    const material = traceRef.current.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = 2 + bass * 2
  })

  return (
    <mesh ref={traceRef}>
      <tubeGeometry args={[tracePath, 2, 0.05, 4, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}
