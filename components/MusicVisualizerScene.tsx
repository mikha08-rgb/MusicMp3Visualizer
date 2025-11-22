'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import LayeredRings from './visualizations/LayeredRings'

interface MusicVisualizerSceneProps {
  frequencyData: Uint8Array
  bass: number
  mids: number
  highs: number
  beatDetected: boolean
  isPlaying: boolean
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
  isPlaying
}: MusicVisualizerSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 15, 20], fov: 60 }}
        className="bg-gradient-to-b from-black via-slate-900 to-black"
      >
        <Suspense fallback={null}>
          <Lights />

          {/* Layered Rings Visualization */}
          <LayeredRings
            bass={bass}
            mids={mids}
            highs={highs}
            frequencyData={frequencyData}
            beatDetected={beatDetected}
            isPlaying={isPlaying}
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
        </Suspense>
      </Canvas>
    </div>
  )
}
