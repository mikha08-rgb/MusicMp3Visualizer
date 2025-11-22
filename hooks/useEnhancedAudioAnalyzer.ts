import { useState, useEffect, useRef, useCallback } from 'react'

interface EnhancedAudioData {
  frequencyData: Uint8Array
  bass: number // 0-1
  mids: number // 0-1
  highs: number // 0-1
  overall: number // 0-1
  beatDetected: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  audioFile: File | null
}

interface AudioAnalyzerControls {
  loadAudio: (source: File | string) => Promise<void>
  play: () => void
  pause: () => void
  togglePlayPause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
}

export function useEnhancedAudioAnalyzer(fftSize: number = 2048) {
  const [state, setState] = useState<EnhancedAudioData>({
    frequencyData: new Uint8Array(fftSize / 2),
    bass: 0,
    mids: 0,
    highs: 0,
    overall: 0,
    beatDetected: false,
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

  // Beat detection state - optimized history size
  const beatHistoryRef = useRef<Float32Array>(new Float32Array(30)) // Reduced from 60 to 30 frames
  const beatHistoryIndex = useRef<number>(0)
  const beatThresholdRef = useRef<number>(0)
  const lastBeatTimeRef = useRef<number>(0)

  // Calculate frequency band ranges based on FFT size
  const getFrequencyRanges = useCallback(() => {
    const sampleRate = audioContextRef.current?.sampleRate || 44100
    const nyquist = sampleRate / 2
    const binCount = fftSize / 2

    // Convert Hz to bin indices
    const hzToBin = (hz: number) => Math.floor((hz / nyquist) * binCount)

    return {
      bassStart: 0,
      bassEnd: hzToBin(250),      // 20-250 Hz
      midsStart: hzToBin(250),
      midsEnd: hzToBin(4000),     // 250-4000 Hz
      highsStart: hzToBin(4000),
      highsEnd: binCount,         // 4000 Hz - Nyquist
    }
  }, [fftSize])

  // Calculate average amplitude for a frequency range
  const getAverageFrequency = useCallback((dataArray: Uint8Array, startIndex: number, endIndex: number) => {
    let sum = 0
    const count = endIndex - startIndex

    for (let i = startIndex; i < endIndex; i++) {
      sum += dataArray[i]
    }

    return sum / count / 255 // Normalize to 0-1
  }, [])

  // Simple beat detection algorithm - optimized with typed arrays
  const detectBeat = useCallback((bassLevel: number) => {
    const now = performance.now()
    const minTimeBetweenBeats = 100 // ms (prevents detecting same beat multiple times)

    // Add to circular buffer (30 frames ~0.5 second at 60fps)
    const historySize = beatHistoryRef.current.length
    beatHistoryRef.current[beatHistoryIndex.current] = bassLevel
    beatHistoryIndex.current = (beatHistoryIndex.current + 1) % historySize

    // Calculate average and threshold - optimized loop
    let sum = 0
    for (let i = 0; i < historySize; i++) {
      sum += beatHistoryRef.current[i]
    }
    const average = sum / historySize
    beatThresholdRef.current = average * 1.4 // Beat must be 40% above average

    // Detect beat
    const isBeat = bassLevel > beatThresholdRef.current &&
                   bassLevel > 0.3 && // Minimum threshold
                   (now - lastBeatTimeRef.current) > minTimeBetweenBeats

    if (isBeat) {
      lastBeatTimeRef.current = now
    }

    return isBeat
  }, [])

  // Update frequency data and analyze bands
  const updateFrequencyData = useCallback(() => {
    if (!analyzerRef.current || !audioElementRef.current) return

    const bufferLength = analyzerRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyzerRef.current.getByteFrequencyData(dataArray)

    // Get frequency ranges
    const ranges = getFrequencyRanges()

    // Calculate band levels
    const bassLevel = getAverageFrequency(dataArray, ranges.bassStart, ranges.bassEnd)
    const midsLevel = getAverageFrequency(dataArray, ranges.midsStart, ranges.midsEnd)
    const highsLevel = getAverageFrequency(dataArray, ranges.highsStart, ranges.highsEnd)
    const overallLevel = getAverageFrequency(dataArray, 0, bufferLength)

    // Detect beats
    const beatDetected = detectBeat(bassLevel)

    setState(prev => ({
      ...prev,
      frequencyData: dataArray,
      bass: bassLevel,
      mids: midsLevel,
      highs: highsLevel,
      overall: overallLevel,
      beatDetected,
      currentTime: audioElementRef.current?.currentTime || 0,
    }))

    animationFrameRef.current = requestAnimationFrame(updateFrequencyData)
  }, [getFrequencyRanges, getAverageFrequency, detectBeat])

  // Initialize audio context and analyzer
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
      analyzerRef.current = audioContextRef.current.createAnalyser()
      analyzerRef.current.fftSize = fftSize
      analyzerRef.current.smoothingTimeConstant = 0.75
    }
  }, [fftSize])

  // Load audio file or URL
  const loadAudio = useCallback(async (source: File | string) => {
    try {
      initializeAudioContext()

      // Create or reuse audio element
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio()
        audioElementRef.current.crossOrigin = 'anonymous'
      }

      let audioUrl: string
      let fileName: string

      // Handle File object or URL string
      if (typeof source === 'string') {
        // URL string - use directly
        audioUrl = source
        fileName = source.split('/').pop() || 'Demo Track'
      } else {
        // File object - create blob URL
        audioUrl = URL.createObjectURL(source)
        fileName = source.name
      }

      audioElementRef.current.src = audioUrl

      // Wait for metadata to load
      await new Promise<void>((resolve, reject) => {
        if (!audioElementRef.current) return reject()

        audioElementRef.current.onloadedmetadata = () => {
          setState(prev => ({
            ...prev,
            duration: audioElementRef.current?.duration || 0,
            // Create a fake File object for URL sources to maintain compatibility
            audioFile: typeof source === 'string'
              ? new File([], fileName, { type: 'audio/mpeg' })
              : source,
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

      console.log('Audio loaded successfully:', fileName)
    } catch (error) {
      console.error('Error loading audio:', error)
      throw error
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

  // Set volume (0-1)
  const setVolume = useCallback((volume: number) => {
    if (!audioElementRef.current) return
    audioElementRef.current.volume = Math.max(0, Math.min(1, volume))
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
    setVolume,
  }

  return [state, controls] as const
}
