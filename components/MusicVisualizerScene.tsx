'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import LayeredRings from './visualizations/LayeredRings'
import type { ColorTheme } from '@/lib/themes'

function FPSCounter({ onFPSUpdate }: { onFPSUpdate?: (fps: number) => void }) {
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  useFrame(() => {
    frameCountRef.current++

    const now = performance.now()
    const delta = now - lastTimeRef.current

    // Update FPS every second
    if (delta >= 1000 && onFPSUpdate) {
      onFPSUpdate(Math.round((frameCountRef.current * 1000) / delta))
      frameCountRef.current = 0
      lastTimeRef.current = now
    }
  })

  return null
}

interface MusicVisualizerSceneProps {
  frequencyData: Uint8Array
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  isPlaying: boolean
  showPostProcessing?: boolean
  showParticles?: boolean
  showFPS?: boolean
  onFPSUpdate?: (fps: number) => void
  theme?: ColorTheme
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={1} color="#ffffff" />
      <pointLight position={[10, 5, 10]} intensity={0.5} color="#ff0000" />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#0000ff" />
    </>
  )
}

export default function MusicVisualizerScene({
  frequencyData,
  bass,
  mids,
  highs,
  beatDetected,
  isPlaying,
  showPostProcessing = true,
  showParticles = true,
  showFPS = false,
  onFPSUpdate,
  theme
}: MusicVisualizerSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 15, 20], fov: 60 }}
        className="bg-gradient-to-b from-black via-slate-900 to-black"
        gl={{
          antialias: true,
          alpha: true
        }}
      >
        <Suspense fallback={null}>
          <Lights />

          {/* FPS Counter */}
          {showFPS && <FPSCounter onFPSUpdate={onFPSUpdate} />}

          {/* Layered Rings Visualization */}
          <LayeredRings
            bass={bass}
            mids={mids}
            highs={highs}
            frequencyData={frequencyData}
            beatDetected={beatDetected}
            isPlaying={isPlaying}
            showParticles={showParticles}
            theme={theme}
          />

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={10}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2}
          />

          <Environment preset="night" />

          {/* Ground plane for reference */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#111111" transparent opacity={0.3} />
          </mesh>

          {/* Post-processing effects */}
          {showPostProcessing && (
            <EffectComposer>
              <Bloom
                intensity={0.3}
                luminanceThreshold={0.4}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
              <Vignette
                offset={0.5}
                darkness={0.3}
                eskil={false}
                blendFunction={BlendFunction.NORMAL}
              />
              <ChromaticAberration
                offset={[0.0001, 0.0001]}
                blendFunction={BlendFunction.NORMAL}
              />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
