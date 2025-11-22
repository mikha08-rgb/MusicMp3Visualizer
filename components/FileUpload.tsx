'use client'

import { useCallback, useState } from 'react'
import { Upload, Music, Play } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onDemoSelect?: () => void
  className?: string
}

export default function FileUpload({ onFileSelect, onDemoSelect, className = '' }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file')
      return
    }

    onFileSelect(file)
  }, [onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  return (
    <div className={`relative ${className}`}>
      {/* Try Demo Button - Only show if onDemoSelect is provided */}
      {onDemoSelect && (
        <>
          <button
            onClick={onDemoSelect}
            className="group w-full mb-6 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3
              hover:bg-black/60 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4 text-white/60 group-hover:text-white transition-colors fill-current" />
              <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                Try Demo Track
              </p>
            </div>
          </button>

          {/* Divider with "OR" */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-b from-black via-slate-900 to-black text-white/40">
                OR
              </span>
            </div>
          </div>
        </>
      )}

      {/* File Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileInput}
          className="hidden"
          id="audio-file-input"
        />

        <label
          htmlFor="audio-file-input"
          className={`
            flex flex-col items-center justify-center
            w-full ${onDemoSelect ? 'h-64' : 'h-72'} px-8 ${onDemoSelect ? 'py-10' : 'py-12'}
            border-2 border-dashed rounded-3xl
            cursor-pointer transition-all duration-300
            backdrop-blur-xl
            ${isDragging
              ? 'border-purple-400/60 bg-purple-500/10 scale-[1.01] shadow-lg shadow-purple-500/20'
              : 'border-white/20 bg-black/30 hover:border-white/30 hover:bg-black/40 hover:shadow-lg'
            }
          `}
        >
          <div className="flex flex-col items-center space-y-4">
            {isDragging ? (
              <div className="relative">
                <Music className="w-16 h-16 text-purple-400 animate-bounce" />
                <div className="absolute inset-0 blur-xl bg-purple-400/30 animate-pulse" />
              </div>
            ) : (
              <div className="relative">
                <Upload className="w-16 h-16 text-white/60" />
                <div className="absolute inset-0 blur-2xl bg-white/10" />
              </div>
            )}

            <div className="text-center">
              <p className="text-lg font-semibold text-white mb-2">
                {isDragging ? 'Drop your audio file here' : onDemoSelect ? 'Upload Your Own' : 'Upload Audio File'}
              </p>
              <p className="text-sm text-white/60 mb-3">
                Drag & drop or click to browse
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <p className="text-xs text-white/50">
                  MP3, WAV, OGG, FLAC, and more
                </p>
              </div>
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}
