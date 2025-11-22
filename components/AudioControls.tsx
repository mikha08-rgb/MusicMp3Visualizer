'use client'

import { Play, Pause, Upload } from 'lucide-react'
import { useCallback } from 'react'

interface AudioControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  audioFileName: string | null
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onFileSelect?: (file: File) => void
  className?: string
}

export default function AudioControls({
  isPlaying,
  currentTime,
  duration,
  audioFileName,
  onTogglePlay,
  onSeek,
  onFileSelect,
  className = ''
}: AudioControlsProps) {
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    onSeek(newTime)
  }, [duration, onSeek])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && onFileSelect) {
      const file = files[0]
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        alert('Please upload an audio file')
        return
      }
      onFileSelect(file)
    }
  }, [onFileSelect])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 ${className}`}>
      {/* Compact song info with inline controls */}
      {audioFileName && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Now Playing</p>
              <p className="text-sm font-medium text-white truncate">
                {audioFileName}
              </p>
            </div>
            {onFileSelect && (
              <>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="change-audio-file-input"
                />
                <label
                  htmlFor="change-audio-file-input"
                  className="
                    flex items-center justify-center
                    w-7 h-7
                    bg-white/10 hover:bg-white/15
                    border border-white/20 hover:border-white/30
                    rounded-md cursor-pointer
                    transition-all duration-200
                    text-white/60 hover:text-white
                    flex-shrink-0
                  "
                  title="Change song"
                >
                  <Upload className="w-3.5 h-3.5" />
                </label>
              </>
            )}
          </div>

          {/* Compact progress bar with inline time and play button */}
          <div className="flex items-center gap-3">
            {/* Play/Pause button - inline */}
            <button
              onClick={onTogglePlay}
              className="
                w-9 h-9 rounded-full flex-shrink-0
                bg-white/10 hover:bg-white/15
                border border-white/30 hover:border-white/40
                flex items-center justify-center
                transition-all duration-200
                hover:scale-105 active:scale-95
              "
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" fill="white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
              )}
            </button>

            {/* Progress and time */}
            <div className="flex-1 min-w-0">
              <div
                className="h-1 bg-white/10 rounded-full cursor-pointer overflow-hidden mb-1.5"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/40">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
