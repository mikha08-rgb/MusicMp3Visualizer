'use client'

import { useCallback, useEffect } from 'react'
import { useEnhancedAudioAnalyzer } from '@/hooks/useEnhancedAudioAnalyzer'
import FileUpload from '@/components/FileUpload'
import MusicVisualizerScene from '@/components/MusicVisualizerScene'
import AudioControls from '@/components/AudioControls'

export default function Home() {
  const [audioState, audioControls] = useEnhancedAudioAnalyzer(2048)

  const handleFileSelect = useCallback(async (file: File) => {
    await audioControls.loadAudio(file)
    // Auto-play after loading
    setTimeout(() => {
      audioControls.play()
    }, 100)
  }, [audioControls])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Play/pause with space
      if (e.code === 'Space' && audioState.audioFile) {
        e.preventDefault()
        audioControls.togglePlayPause()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [audioState.audioFile, audioControls])

  const hasAudio = audioState.audioFile !== null

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
      {/* Header - cleaner, more subtle */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold text-white/90 tracking-tight">
          Music Visualizer
        </h1>
        {!hasAudio && (
          <p className="text-sm text-white/50 mt-1">
            Upload an audio file to begin
          </p>
        )}
      </div>

      {/* 3D Scene */}
      {hasAudio && (
        <MusicVisualizerScene
          frequencyData={audioState.frequencyData}
          bass={audioState.bass}
          mids={audioState.mids}
          highs={audioState.highs}
          beatDetected={audioState.beatDetected}
          isPlaying={audioState.isPlaying}
        />
      )}

      {/* File Upload (centered when no audio loaded) */}
      {!hasAudio && (
        <div className="absolute inset-0 flex items-center justify-center p-8 z-20">
          <div className="w-full max-w-lg">
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        </div>
      )}

      {/* Top right control panel - help */}
      {hasAudio && (
        <div className="absolute top-6 right-6 z-20">
          {/* Instructions */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 max-w-[200px]">
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2">Controls</p>
            <ul className="text-xs text-white/70 space-y-1.5 leading-relaxed">
              <li>• Drag: Rotate view</li>
              <li>• Scroll: Zoom</li>
              <li>• Space: Play/pause</li>
            </ul>
          </div>
        </div>
      )}

      {/* Bottom controls panel - audio controls */}
      {hasAudio && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
          <AudioControls
            isPlaying={audioState.isPlaying}
            currentTime={audioState.currentTime}
            duration={audioState.duration}
            audioFileName={audioState.audioFile?.name || null}
            onTogglePlay={audioControls.togglePlayPause}
            onSeek={audioControls.seek}
            onFileSelect={handleFileSelect}
          />
        </div>
      )}
    </main>
  )
}
