'use client'

import { useCallback, useState } from 'react'
import { Upload, Music } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  className?: string
}

export default function FileUpload({ onFileSelect, className = '' }: FileUploadProps) {
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
    <div
      className={`relative ${className}`}
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
          w-full h-72 px-8 py-12
          border-2 border-dashed rounded-3xl
          cursor-pointer transition-all duration-300
          backdrop-blur-xl
          ${isDragging
            ? 'border-purple-400/60 bg-purple-500/10 scale-[1.01] shadow-lg shadow-purple-500/20'
            : 'border-white/20 bg-black/30 hover:border-white/30 hover:bg-black/40 hover:shadow-lg'
          }
        `}
      >
        <div className="flex flex-col items-center space-y-5">
          {isDragging ? (
            <div className="relative">
              <Music className="w-20 h-20 text-purple-400 animate-bounce" />
              <div className="absolute inset-0 blur-xl bg-purple-400/30 animate-pulse" />
            </div>
          ) : (
            <div className="relative">
              <Upload className="w-20 h-20 text-white/60" />
              <div className="absolute inset-0 blur-2xl bg-white/10" />
            </div>
          )}

          <div className="text-center">
            <p className="text-xl font-semibold text-white mb-2">
              {isDragging ? 'Drop your audio file here' : 'Upload Audio File'}
            </p>
            <p className="text-sm text-white/60 mb-3">
              Drag & drop or click to browse
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <p className="text-xs text-white/50">
                Supports MP3, WAV, OGG, FLAC, and more
              </p>
            </div>
          </div>
        </div>
      </label>
    </div>
  )
}
