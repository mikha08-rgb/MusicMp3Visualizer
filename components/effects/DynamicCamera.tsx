'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface DynamicCameraProps {
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  isPlaying: boolean
  intensity?: number // 0-1, how dramatic the effects are
}

export default function DynamicCamera({
  bass,
  mids,
  highs,
  beatDetected,
  isPlaying,
  intensity = 0.7
}: DynamicCameraProps) {
  const { camera } = useThree()
  const shakeOffsetRef = useRef(new THREE.Vector3())
  const targetPositionRef = useRef(new THREE.Vector3(0, 35, 60))
  const currentRotationRef = useRef(0)
  const lastBeatTimeRef = useRef(0)
  const zoomPhaseRef = useRef(0)

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 35, 60)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame((state, delta) => {
    if (!isPlaying) return

    const time = state.clock.elapsedTime

    // 1. BASS SHAKE - Intense shake on bass hits
    if (beatDetected) {
      lastBeatTimeRef.current = time
      // Big shake on beat
      shakeOffsetRef.current.set(
        (Math.random() - 0.5) * bass * 8 * intensity,
        (Math.random() - 0.5) * bass * 6 * intensity,
        (Math.random() - 0.5) * bass * 8 * intensity
      )
    } else {
      // Decay shake over time
      shakeOffsetRef.current.multiplyScalar(0.85)
    }

    // 2. CONTINUOUS BASS WOBBLE - Camera wobbles with bass
    const bassWobble = new THREE.Vector3(
      Math.sin(time * 2 + bass * 10) * bass * 3 * intensity,
      Math.cos(time * 1.5 + bass * 8) * bass * 2 * intensity,
      Math.sin(time * 1.8 + bass * 12) * bass * 3 * intensity
    )

    // 3. MIDS CIRCULAR MOTION - Camera orbits smoothly
    const orbitRadius = 60 + mids * 20 * intensity
    const orbitSpeed = 0.1 + mids * 0.3 * intensity
    currentRotationRef.current += orbitSpeed * delta

    targetPositionRef.current.set(
      Math.sin(currentRotationRef.current) * orbitRadius,
      35 + mids * 15 * intensity, // Height varies with mids
      Math.cos(currentRotationRef.current) * orbitRadius
    )

    // 4. HIGHS ZOOM - Zoom in and out with high frequencies
    zoomPhaseRef.current += delta * (1 + highs * 3)
    const zoomFactor = 1 + Math.sin(zoomPhaseRef.current) * highs * 0.3 * intensity
    const zoomedPosition = targetPositionRef.current.clone().multiplyScalar(zoomFactor)

    // 5. COMBINE ALL MOVEMENTS
    const finalPosition = zoomedPosition
      .clone()
      .add(bassWobble)
      .add(shakeOffsetRef.current)

    // Smooth camera movement (lerp)
    camera.position.lerp(finalPosition, 0.1)

    // 6. DYNAMIC LOOK-AT with slight offset based on music
    const lookAtTarget = new THREE.Vector3(
      Math.sin(time * 0.5) * mids * 10,
      bass * 5,
      Math.cos(time * 0.5) * highs * 10
    )
    camera.lookAt(lookAtTarget)

    // 7. FOV PULSE - Field of view pulses with bass
    const targetFov = 65 + bass * 25 * intensity
    const currentFov = (camera as THREE.PerspectiveCamera).fov
    ;(camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(currentFov, targetFov, 0.1)
    ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
  })

  return null
}
