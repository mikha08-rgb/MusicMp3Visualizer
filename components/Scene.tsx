'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Environment } from '@react-three/drei'
import { Suspense } from 'react'

function RotatingBox() {
  return (
    <Box args={[2, 2, 2]} position={[0, 0, 0]}>
      <meshStandardMaterial color="hotpink" />
    </Box>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
    </>
  )
}

export default function Scene() {
  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 75 }}
        className="bg-gradient-to-b from-slate-900 to-slate-700"
      >
        <Suspense fallback={null}>
          <Lights />
          <RotatingBox />
          <OrbitControls enableDamping dampingFactor={0.05} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  )
}
