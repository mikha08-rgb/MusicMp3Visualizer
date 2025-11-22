'use client'

import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useEnhancedAudioAnalyzer } from '@/hooks/useEnhancedAudioAnalyzer'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import FileUpload from '@/components/FileUpload'
import MusicVisualizerScene from '@/components/MusicVisualizerScene'
import AudioControls from '@/components/AudioControls'
import ControlsPanel from '@/components/ControlsPanel'
import ThemePicker from '@/components/ThemePicker'
import VisualizationModePicker from '@/components/VisualizationModePicker'
import { FPSDisplay } from '@/components/FPSCounter'
import { themes, type ColorTheme } from '@/lib/themes'
import { FPSMonitor, getAutoPreset, type PerformancePreset } from '@/lib/performance-helper'

export default function Home() {
  const [audioState, audioControls] = useEnhancedAudioAnalyzer(2048)

  // UI state with localStorage persistence
  const [volume, setVolume] = useLocalStorage('visualizer-volume', 0.7)
  const [showFPS, setShowFPS] = useLocalStorage('visualizer-showFPS', true)
  const [showPostProcessing, setShowPostProcessing] = useLocalStorage('visualizer-postProcessing', false) // Disabled by default for max FPS
  const [showParticles, setShowParticles] = useLocalStorage('visualizer-particles', true)
  const [savedThemeName, setSavedThemeName] = useLocalStorage('visualizer-theme', 'cyberpunk')
  const [visualizationMode, setVisualizationMode] = useLocalStorage<'rings' | 'spectrum'>('visualizer-mode', 'rings')
  const [autoAdaptiveQuality, setAutoAdaptiveQuality] = useLocalStorage('visualizer-autoAdaptive', true)
  const [manualPreset, setManualPreset] = useLocalStorage<PerformancePreset>('visualizer-preset', 'high')

  // Non-persisted state
  const [fps, setFps] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentPreset, setCurrentPreset] = useState<PerformancePreset>(manualPreset)

  // Load theme from saved name
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(() => {
    return themes.find(t => t.name.toLowerCase().replace(' ', '') === savedThemeName) || themes[1]
  })

  // FPS monitoring for auto-adaptive quality
  const fpsMonitor = useMemo(() => new FPSMonitor(), [])
  const lastPresetChangeRef = useRef<number>(0)

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

  // Auto-adaptive quality based on FPS
  const handleFPSUpdate = useCallback((newFPS: number) => {
    setFps(newFPS)

    if (autoAdaptiveQuality && showPostProcessing) {
      fpsMonitor.addSample(newFPS)
      const avgFPS = fpsMonitor.getAverageFPS()

      // Only change preset if enough time has passed (prevent thrashing)
      const now = Date.now()
      if (now - lastPresetChangeRef.current > 3000) { // 3 second cooldown
        const autoPreset = getAutoPreset(avgFPS)

        if (autoPreset !== currentPreset) {
          setCurrentPreset(autoPreset)
          lastPresetChangeRef.current = now
          console.log(`[Auto-Adaptive] FPS: ${avgFPS} → Preset: ${autoPreset}`)
        }
      }
    } else if (!autoAdaptiveQuality) {
      // Use manual preset
      if (currentPreset !== manualPreset) {
        setCurrentPreset(manualPreset)
      }
    }
  }, [autoAdaptiveQuality, showPostProcessing, fpsMonitor, currentPreset, manualPreset])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Handle theme changes and save to localStorage
  const handleThemeChange = useCallback((theme: ColorTheme) => {
    setCurrentTheme(theme)
    setSavedThemeName(theme.name.toLowerCase().replace(' ', ''))
  }, [setSavedThemeName])

  const hasAudio = audioState.audioFile !== null

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Play/pause with space
      if (e.code === 'Space' && audioState.audioFile) {
        e.preventDefault()
        audioControls.togglePlayPause()
      }
      // Fullscreen with F key
      if (e.code === 'KeyF') {
        e.preventDefault()
        toggleFullscreen()
      }
      // Exit fullscreen with Escape (handled by browser, but we track it)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [audioState.audioFile, audioControls, toggleFullscreen])

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
          onFPSUpdate={handleFPSUpdate}
          theme={currentTheme}
          visualizationMode={visualizationMode}
          performancePreset={currentPreset}
        />
      )}

      {/* FPS Display */}
      {hasAudio && showFPS && <FPSDisplay fps={fps} />}

      {/* Theme Picker, Mode Picker & Controls Panel */}
      {hasAudio && (
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
          <VisualizationModePicker
            currentMode={visualizationMode}
            onModeChange={setVisualizationMode}
          />
          <ThemePicker
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
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
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
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
              <li>• F: Fullscreen</li>
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
