'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense, useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, GodRays } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import * as THREE from 'three'
import LayeredRings from './visualizations/LayeredRings'
import CircularSpectrum from './visualizations/CircularSpectrum'
import EnhancedCyberpunkCity from './environment/EnhancedCyberpunkCity'
import CyberpunkGrid from './environment/CyberpunkGrid'
import HolographicBillboards from './environment/HolographicBillboards'
import FlyingVehicles from './environment/FlyingVehicles'
import StreetDetails from './environment/StreetDetails'
import AtmosphericEffects from './environment/AtmosphericEffects'
import GroundCrowd from './environment/GroundCrowd'
import GroundVehicles from './environment/GroundVehicles'
import MarketStalls from './environment/MarketStalls'
import DroneSwarm from './environment/DroneSwarm'
import CargoShips from './environment/CargoShips'
import SkyPlatforms from './environment/SkyPlatforms'
import ReflectivePuddles from './environment/ReflectivePuddles'
import type { ColorTheme } from '@/lib/themes'
import { getPostProcessingQuality, type PerformancePreset } from '@/lib/performance-helper'

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
  showBloom?: boolean
  showVignette?: boolean
  showGodRays?: boolean
  showParticles?: boolean
  showFPS?: boolean
  onFPSUpdate?: (fps: number) => void
  theme?: ColorTheme
  visualizationMode?: 'rings' | 'spectrum'
  performancePreset?: PerformancePreset
}

function Lights({ theme, bass, mainLightRef }: { theme?: ColorTheme; bass: number; mainLightRef?: React.RefObject<THREE.PointLight | null> }) {
  const light1Ref = mainLightRef || useRef<THREE.PointLight>(null)
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

function EnhancedPostProcessing({
  bass,
  lightRef,
  showBloom = true,
  showVignette = true,
  showGodRays = false,
  preset = 'high'
}: {
  bass: number
  lightRef: React.RefObject<THREE.PointLight | null>
  showBloom?: boolean
  showVignette?: boolean
  showGodRays?: boolean
  preset?: PerformancePreset
}) {
  const quality = useMemo(() => getPostProcessingQuality(preset), [preset])

  return (
    <EffectComposer multisampling={0}>
      <>
        {/* Enhanced bloom for neon glow with bass reactivity - adaptive quality */}
        {showBloom && (
          <Bloom
            intensity={quality.bloomIntensity + bass * 0.3}
            luminanceThreshold={quality.bloomLuminanceThreshold}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        )}

        {/* God rays disabled - requires mesh object, not compatible with point light */}

        {/* Vignette for cinematic focus - subtle and optional */}
        {showVignette && quality.vignetteEnabled && (
          <Vignette
            offset={0.2}
            darkness={quality.vignetteDarkness}
            eskil={false}
            blendFunction={BlendFunction.NORMAL}
          />
        )}
      </>
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
  showBloom = true,
  showVignette = true,
  showGodRays = false,
  showParticles = true,
  showFPS = false,
  onFPSUpdate,
  theme,
  visualizationMode = 'rings',
  performancePreset = 'high'
}: MusicVisualizerSceneProps) {
  const mainLightRef = useRef<THREE.PointLight>(null)

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
        dpr={1.5}
        flat
      >
        <Suspense fallback={null}>
          {/* Atmospheric fog - darker and more purple/cyan for cyberpunk feel */}
          <fog attach="fog" args={['#0a0a1e', 40, 180]} />

          <Lights theme={theme} bass={bass} mainLightRef={mainLightRef} />

          {/* FPS Counter */}
          {showFPS && <FPSCounter onFPSUpdate={onFPSUpdate} />}

          {/* Ground Layer - Foundation */}
          <CyberpunkGrid bass={bass} theme={theme} />
          <ReflectivePuddles bass={bass} mids={mids} theme={theme} />

          {/* City Buildings */}
          <EnhancedCyberpunkCity
            bass={bass}
            mids={mids}
            highs={highs}
            beatDetected={beatDetected}
            theme={theme}
          />

          {/* Ground Level Activity */}
          <GroundCrowd
            bass={bass}
            mids={mids}
            highs={highs}
            beatDetected={beatDetected}
            theme={theme}
          />
          <GroundVehicles
            bass={bass}
            mids={mids}
            beatDetected={beatDetected}
            theme={theme}
          />
          <MarketStalls
            bass={bass}
            mids={mids}
            highs={highs}
            beatDetected={beatDetected}
            theme={theme}
          />
          <StreetDetails bass={bass} theme={theme} />

          {/* Mid-Level Elements */}
          <HolographicBillboards
            bass={bass}
            mids={mids}
            highs={highs}
            beatDetected={beatDetected}
            theme={theme}
          />
          <AtmosphericEffects bass={bass} theme={theme} showRain={true} />

          {/* Sky Level Activity */}
          <DroneSwarm
            bass={bass}
            mids={mids}
            highs={highs}
            beatDetected={beatDetected}
            theme={theme}
          />
          <FlyingVehicles bass={bass} theme={theme} />
          <CargoShips
            bass={bass}
            mids={mids}
            beatDetected={beatDetected}
            theme={theme}
          />
          <SkyPlatforms
            bass={bass}
            mids={mids}
            highs={highs}
            beatDetected={beatDetected}
            theme={theme}
          />

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

          {/* Post-processing effects - individual control for each effect */}
          {(showBloom || showVignette || showGodRays) && (
            <EnhancedPostProcessing
              bass={bass}
              lightRef={mainLightRef}
              showBloom={showBloom}
              showVignette={showVignette}
              showGodRays={showGodRays}
              preset={performancePreset}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
