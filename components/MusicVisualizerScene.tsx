'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Fog } from '@react-three/drei'
import { Suspense, useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import LayeredRings from './visualizations/LayeredRings'
import CircularSpectrum from './visualizations/CircularSpectrum'
import EnhancedCyberpunkCity from './environment/EnhancedCyberpunkCity'
import CyberpunkGrid from './environment/CyberpunkGrid'
import HolographicBillboards from './environment/HolographicBillboards'
import FlyingVehicles from './environment/FlyingVehicles'
import StreetDetails from './environment/StreetDetails'
import AtmosphericEffects from './environment/AtmosphericEffects'
import LaserSearchlights from './environment/LaserSearchlights'
import EnergyShield from './environment/EnergyShield'
import DataStreams from './environment/DataStreams'
import NeonTrails from './environment/NeonTrails'
import VolumetricLights from './environment/VolumetricLights'
import type { ColorTheme } from '@/lib/themes'

function FPSCounter({ onFPSUpdate }: { onFPSUpdate?: (fps: number) => void }) {
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const lastFrameTimeRef = useRef(performance.now())

  useFrame(() => {
    const now = performance.now()
    const deltaTime = now - lastFrameTimeRef.current

    // Cap at 120 FPS (8.33ms per frame)
    if (deltaTime < 8.33) {
      return
    }

    lastFrameTimeRef.current = now
    frameCountRef.current++

    const elapsed = now - lastTimeRef.current

    // Update FPS every second
    if (elapsed >= 1000 && onFPSUpdate) {
      const fps = Math.round((frameCountRef.current * 1000) / elapsed)
      onFPSUpdate(Math.min(fps, 120)) // Cap display at 120
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
  visualizationMode?: 'rings' | 'spectrum'
}

function Lights({ theme, bass }: { theme?: ColorTheme; bass: number }) {
  const light1Ref = useRef<THREE.PointLight>(null)
  const light2Ref = useRef<THREE.PointLight>(null)
  const light3Ref = useRef<THREE.PointLight>(null)

  useFrame(() => {
    if (light1Ref.current && light2Ref.current && light3Ref.current) {
      // Lights pulse with bass
      const intensity = 1 + bass * 2
      light1Ref.current.intensity = intensity
      light2Ref.current.intensity = intensity * 0.7
      light3Ref.current.intensity = intensity * 0.7
    }
  })

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight
        ref={light1Ref}
        position={[0, 25, 0]}
        intensity={1}
        color={theme?.colors.orb || '#ffffff'}
        distance={100}
        decay={2}
      />
      <pointLight
        ref={light2Ref}
        position={[30, 15, 30]}
        intensity={0.7}
        color={theme?.colors.primary || '#00ffff'}
        distance={80}
        decay={2}
      />
      <pointLight
        ref={light3Ref}
        position={[-30, 15, -30]}
        intensity={0.7}
        color={theme?.colors.secondary || '#ff00ff'}
        distance={80}
        decay={2}
      />
    </>
  )
}

function StaticPostProcessing() {
  return (
    <EffectComposer>
      {/* Enhanced bloom for neon glow */}
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* Vignette for cinematic focus */}
      <Vignette
        offset={0.2}
        darkness={0.7}
        eskil={false}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Subtle chromatic aberration for cyberpunk feel */}
      <ChromaticAberration
        offset={[0.0015, 0.0015]}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
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
  theme,
  visualizationMode = 'rings'
}: MusicVisualizerSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 35, 60], fov: 65 }}
        className="bg-gradient-to-b from-black via-purple-950 to-black"
        frameloop="always"
        legacy={false}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={1}
        flat
      >
        <Suspense fallback={null}>
          {/* Atmospheric fog - darker and more purple/cyan for cyberpunk feel */}
          <fog attach="fog" args={['#0a0a1e', 40, 180]} />

          <Lights theme={theme} bass={bass} />

          {/* FPS Counter */}
          {showFPS && <FPSCounter onFPSUpdate={onFPSUpdate} />}

          {/* Enhanced Cyberpunk City with varied architecture */}
          <EnhancedCyberpunkCity
            bass={bass}
            mids={mids}
            highs={highs}
            beatDetected={beatDetected}
            theme={theme}
          />
          <CyberpunkGrid bass={bass} theme={theme} />
          <HolographicBillboards
            bass={bass}
            mids={mids}
            highs={highs}
            beatDetected={beatDetected}
            theme={theme}
          />
          <FlyingVehicles bass={bass} theme={theme} />
          <StreetDetails bass={bass} theme={theme} />
          <AtmosphericEffects bass={bass} theme={theme} showRain={true} />

          {/* Removed heavy effects - focusing on buildings instead */}

          {/* Visualization - switch based on mode */}
          {visualizationMode === 'rings' ? (
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
          ) : (
            <CircularSpectrum
              bass={bass}
              mids={mids}
              highs={highs}
              frequencyData={frequencyData}
              beatDetected={beatDetected}
              isPlaying={isPlaying}
              showParticles={showParticles}
              theme={theme}
            />
          )}

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={20}
            maxDistance={100}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate={isPlaying}
            autoRotateSpeed={0.5}
          />

          <Environment preset="night" />

          {/* Post-processing effects */}
          {showPostProcessing && <StaticPostProcessing />}
        </Suspense>
      </Canvas>
    </div>
  )
}
