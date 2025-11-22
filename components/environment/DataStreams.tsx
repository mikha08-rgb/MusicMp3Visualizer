'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface DataStreamsProps {
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  theme?: ColorTheme
}

// Individual data stream column
function DataStream({
  position,
  color,
  speed,
  bass,
  highs
}: {
  position: THREE.Vector3
  color: THREE.Color
  speed: number
  bass: number
  highs: number
}) {
  const streamRef = useRef<THREE.InstancedMesh>(null)
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  const streamData = useMemo(() => {
    const count = 20
    const offsets = new Float32Array(count)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      offsets[i] = Math.random() * 30
      speeds[i] = speed * (0.5 + Math.random() * 0.5)
    }

    return { count, offsets, speeds }
  }, [speed])

  useEffect(() => {
    if (!streamRef.current) return

    // Initialize positions and colors
    for (let i = 0; i < streamData.count; i++) {
      tempObject.position.set(
        position.x,
        position.y - i * 1.5 - streamData.offsets[i],
        position.z
      )
      tempObject.scale.set(0.3, 1, 0.3)
      tempObject.updateMatrix()
      streamRef.current.setMatrixAt(i, tempObject.matrix)

      const brightness = 1 - i / streamData.count
      tempColor.copy(color).multiplyScalar(brightness)
      streamRef.current.setColorAt(i, tempColor)
    }

    streamRef.current.instanceMatrix.needsUpdate = true
    if (streamRef.current.instanceColor) {
      streamRef.current.instanceColor.needsUpdate = true
    }
  }, [position, color, streamData, tempObject, tempColor])

  useFrame(() => {
    if (!streamRef.current) return

    const speedMultiplier = 1 + bass * 0.5 + highs * 0.3

    for (let i = 0; i < streamData.count; i++) {
      streamRef.current.getMatrixAt(i, tempObject.matrix)
      tempObject.matrix.decompose(tempObject.position, tempObject.quaternion, tempObject.scale)

      // Move down
      tempObject.position.y -= streamData.speeds[i] * speedMultiplier * 0.3

      // Reset to top when reaching bottom
      if (tempObject.position.y < -20) {
        tempObject.position.y = position.y + Math.random() * 10
      }

      tempObject.updateMatrix()
      streamRef.current.setMatrixAt(i, tempObject.matrix)
    }

    streamRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={streamRef}
      args={[undefined, undefined, streamData.count]}
      castShadow={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="white"
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.7}
        toneMapped={false}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

export default function DataStreams({
  bass,
  mids,
  highs,
  beatDetected,
  theme
}: DataStreamsProps) {
  const streamColumns = useMemo(() => {
    const columns = []
    const count = 30 // Number of data stream columns

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 55 + Math.random() * 30
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = 20 + Math.random() * 20

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
        const colors = ['#00ff00', '#00ffff', '#00ff80', '#80ff00']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      columns.push({
        position: new THREE.Vector3(x, y, z),
        color,
        speed: 0.1 + Math.random() * 0.2
      })
    }

    return columns
  }, [theme])

  return (
    <group>
      {streamColumns.map((column, i) => (
        <DataStream
          key={i}
          position={column.position}
          color={column.color}
          speed={column.speed}
          bass={bass}
          highs={highs}
        />
      ))}
    </group>
  )
}
