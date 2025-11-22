'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'

export function FPSCounter() {
  const [fps, setFps] = useState(0)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  useFrame(() => {
    frameCountRef.current++

    const now = performance.now()
    const delta = now - lastTimeRef.current

    // Update FPS every second
    if (delta >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / delta))
      frameCountRef.current = 0
      lastTimeRef.current = now
    }
  })

  return null
}

export function FPSDisplay({ fps }: { fps: number }) {
  const getColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400'
    if (fps >= 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">FPS</span>
          <span className={`text-sm font-mono font-bold ${getColor(fps)}`}>
            {fps}
          </span>
        </div>
      </div>
    </div>
  )
}
