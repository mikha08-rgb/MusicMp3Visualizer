'use client'

import { Volume2, VolumeX, Maximize, Minimize, Settings, X } from 'lucide-react'
import { useState, useCallback } from 'react'

interface ControlsPanelProps {
  volume: number
  onVolumeChange: (volume: number) => void
  showFPS?: boolean
  onToggleFPS?: () => void
  showPostProcessing?: boolean
  onTogglePostProcessing?: () => void
  showParticles?: boolean
  onToggleParticles?: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export default function ControlsPanel({
  volume,
  onVolumeChange,
  showFPS = false,
  onToggleFPS,
  showPostProcessing = true,
  onTogglePostProcessing,
  showParticles = true,
  onToggleParticles,
  isFullscreen = false,
  onToggleFullscreen,
}: ControlsPanelProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(volume)

  const toggleMute = useCallback(() => {
    if (isMuted) {
      onVolumeChange(previousVolume)
      setIsMuted(false)
    } else {
      setPreviousVolume(volume)
      onVolumeChange(0)
      setIsMuted(true)
    }
  }, [isMuted, volume, previousVolume, onVolumeChange])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    onVolumeChange(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }, [onVolumeChange, isMuted])

  return (
    <>
      {/* Volume Control */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="text-white/60 hover:text-white transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
          />
          <span className="text-xs text-white/50 w-10 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Fullscreen & Settings Buttons */}
      <div className="flex gap-2">
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-3
              text-white/60 hover:text-white hover:bg-white/5 transition-all"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        )}

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-3
            transition-all ${showSettings ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          aria-label="Settings"
        >
          {showSettings ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 min-w-[200px]">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Settings</p>

          <div className="space-y-3">
            {onTogglePostProcessing && (
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">
                  Post-processing
                </span>
                <input
                  type="checkbox"
                  checked={showPostProcessing}
                  onChange={onTogglePostProcessing}
                  className="w-4 h-4 rounded bg-white/10 border border-white/20
                    checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                />
              </label>
            )}

            {onToggleParticles && (
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">
                  Particles
                </span>
                <input
                  type="checkbox"
                  checked={showParticles}
                  onChange={onToggleParticles}
                  className="w-4 h-4 rounded bg-white/10 border border-white/20
                    checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                />
              </label>
            )}

            {onToggleFPS && (
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">
                  Show FPS
                </span>
                <input
                  type="checkbox"
                  checked={showFPS}
                  onChange={onToggleFPS}
                  className="w-4 h-4 rounded bg-white/10 border border-white/20
                    checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                />
              </label>
            )}
          </div>
        </div>
      )}
    </>
  )
}
