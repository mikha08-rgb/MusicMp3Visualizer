'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEnhancedAudioAnalyzer } from '@/hooks/useEnhancedAudioAnalyzer'
import FileUpload from '@/components/FileUpload'
import MusicVisualizerScene from '@/components/MusicVisualizerScene'
import AudioControls from '@/components/AudioControls'
import ControlsPanel from '@/components/ControlsPanel'
import ThemePicker from '@/components/ThemePicker'
import { FPSDisplay } from '@/components/FPSCounter'
import { themes, type ColorTheme } from '@/lib/themes'

export default function Home() {
  const [audioState, audioControls] = useEnhancedAudioAnalyzer(2048)

  // UI state
  const [volume, setVolume] = useState(0.7)
  const [showFPS, setShowFPS] = useState(false)
  const [fps, setFps] = useState(0)
  const [showPostProcessing, setShowPostProcessing] = useState(false) // Disabled by default - cleaner visuals
  const [showParticles, setShowParticles] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(themes[1]) // Cyberpunk - more vibrant

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true)
    try {
      await audioControls.loadAudio(file)
      // Auto-play after loading
      setTimeout(() => {
        audioControls.play()
        setIsLoading(false)
      }, 100)
    } catch (error) {
      console.error('Error loading audio:', error)
      setIsLoading(false)
    }
  }, [audioControls])

  // Handle volume changes
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume)
    audioControls.setVolume(newVolume)
  }, [audioControls])

  // Initialize volume on load
  useEffect(() => {
    audioControls.setVolume(volume)
  }, [audioControls, volume])

  const hasAudio = audioState.audioFile !== null

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

  // Global drag and drop
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      if (hasAudio && e.dataTransfer?.types.includes('Files')) {
        setIsDraggingGlobal(true)
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      if (e.target === document.body || e.target === document.documentElement) {
        setIsDraggingGlobal(false)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDraggingGlobal(false)

      if (hasAudio && e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]
        if (file.type.startsWith('audio/')) {
          handleFileSelect(file)
        }
      }
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [hasAudio, handleFileSelect])

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
      {/* Global drag overlay */}
      {isDraggingGlobal && hasAudio && (
        <div className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm border-4 border-dashed border-blue-400 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-200 mb-2">Drop to change track</p>
            <p className="text-sm text-blue-300/70">Release to load new audio file</p>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4 mx-auto" />
            <p className="text-white/70">Loading audio...</p>
          </div>
        </div>
      )}

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
          showPostProcessing={showPostProcessing}
          showParticles={showParticles}
          showFPS={showFPS}
          onFPSUpdate={setFps}
          theme={currentTheme}
        />
      )}

      {/* FPS Display */}
      {hasAudio && showFPS && <FPSDisplay fps={fps} />}

      {/* Theme Picker & Controls Panel */}
      {hasAudio && (
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
          <ThemePicker
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
          />
          <ControlsPanel
            volume={volume}
            onVolumeChange={handleVolumeChange}
            showFPS={showFPS}
            onToggleFPS={() => setShowFPS(!showFPS)}
            showPostProcessing={showPostProcessing}
            onTogglePostProcessing={() => setShowPostProcessing(!showPostProcessing)}
            showParticles={showParticles}
            onToggleParticles={() => setShowParticles(!showParticles)}
          />
        </div>
      )}

      {/* File Upload (centered when no audio loaded) */}
      {!hasAudio && (
        <div className="absolute inset-0 flex items-center justify-center p-8 z-20">
          <div className="w-full max-w-lg">
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        </div>
      )}

      {/* Help panel - bottom left */}
      {hasAudio && (
        <div className="absolute bottom-6 left-6 z-20">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 max-w-[180px]">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Controls</p>
            <ul className="text-xs text-white/60 space-y-1.5 leading-relaxed">
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
