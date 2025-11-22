import { useState, useEffect, useRef, useCallback } from 'react'

interface AudioAnalyzerState {
  frequencyData: Uint8Array
  isPlaying: boolean
  currentTime: number
  duration: number
  audioFile: File | null
}

interface AudioAnalyzerControls {
  loadAudio: (file: File) => Promise<void>
  play: () => void
  pause: () => void
  togglePlayPause: () => void
  seek: (time: number) => void
}

export function useAudioAnalyzer(fftSize: number = 128) {
  const [state, setState] = useState<AudioAnalyzerState>({
    frequencyData: new Uint8Array(fftSize / 2),
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    audioFile: null,
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Initialize audio context and analyzer
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
      analyzerRef.current = audioContextRef.current.createAnalyser()
      analyzerRef.current.fftSize = fftSize
      analyzerRef.current.smoothingTimeConstant = 0.8
    }
  }, [fftSize])

  // Update frequency data on every animation frame
  const updateFrequencyData = useCallback(() => {
    if (!analyzerRef.current || !audioElementRef.current) return

    const bufferLength = analyzerRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyzerRef.current.getByteFrequencyData(dataArray)

    setState(prev => ({
      ...prev,
      frequencyData: dataArray,
      currentTime: audioElementRef.current?.currentTime || 0,
    }))

    animationFrameRef.current = requestAnimationFrame(updateFrequencyData)
  }, [])

  // Load audio file
  const loadAudio = useCallback(async (file: File) => {
    try {
      initializeAudioContext()

      // Create or reuse audio element
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio()
        audioElementRef.current.crossOrigin = 'anonymous'
      }

      const audioUrl = URL.createObjectURL(file)
      audioElementRef.current.src = audioUrl

      // Wait for metadata to load
      await new Promise<void>((resolve, reject) => {
        if (!audioElementRef.current) return reject()

        audioElementRef.current.onloadedmetadata = () => {
          setState(prev => ({
            ...prev,
            duration: audioElementRef.current?.duration || 0,
            audioFile: file,
          }))
          resolve()
        }
        audioElementRef.current.onerror = reject
      })

      // Connect audio element to analyzer
      if (!sourceNodeRef.current && audioContextRef.current && audioElementRef.current) {
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current)
        sourceNodeRef.current.connect(analyzerRef.current!)
        analyzerRef.current!.connect(audioContextRef.current.destination)
      }

      console.log('Audio loaded successfully:', file.name)
    } catch (error) {
      console.error('Error loading audio:', error)
    }
  }, [initializeAudioContext])

  // Play audio
  const play = useCallback(async () => {
    if (!audioElementRef.current || !audioContextRef.current) return

    try {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      await audioElementRef.current.play()
      setState(prev => ({ ...prev, isPlaying: true }))
      updateFrequencyData()
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }, [updateFrequencyData])

  // Pause audio
  const pause = useCallback(() => {
    if (!audioElementRef.current) return

    audioElementRef.current.pause()
    setState(prev => ({ ...prev, isPlaying: false }))

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause()
    } else {
      play()
    }
  }, [state.isPlaying, play, pause])

  // Seek to specific time
  const seek = useCallback((time: number) => {
    if (!audioElementRef.current) return
    audioElementRef.current.currentTime = time
    setState(prev => ({ ...prev, currentTime: time }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.src = ''
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const controls: AudioAnalyzerControls = {
    loadAudio,
    play,
    pause,
    togglePlayPause,
    seek,
  }

  return [state, controls] as const
}
