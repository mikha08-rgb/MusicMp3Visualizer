/**
 * Performance presets for post-processing effects
 */

export type PerformancePreset = 'ultra' | 'high' | 'medium' | 'low' | 'potato'

export interface PostProcessingQuality {
  bloomIntensity: number
  bloomLuminanceThreshold: number
  bloomSamples: number
  godRaysEnabled: boolean
  godRaysSamples: number
  vignetteEnabled: boolean
  chromaticAberrationEnabled: boolean
  chromaticAberrationIntensity: number
}

/**
 * Get post-processing quality settings based on preset
 */
export function getPostProcessingQuality(preset: PerformancePreset): PostProcessingQuality {
  switch (preset) {
    case 'ultra':
      return {
        bloomIntensity: 1.5,
        bloomLuminanceThreshold: 0.15,
        bloomSamples: 5,
        godRaysEnabled: true,
        godRaysSamples: 60,
        vignetteEnabled: true,
        chromaticAberrationEnabled: true,
        chromaticAberrationIntensity: 1.0
      }

    case 'high':
      return {
        bloomIntensity: 1.2,
        bloomLuminanceThreshold: 0.2,
        bloomSamples: 4,
        godRaysEnabled: false, // God rays are expensive
        godRaysSamples: 40,
        vignetteEnabled: true,
        chromaticAberrationEnabled: true,
        chromaticAberrationIntensity: 1.0
      }

    case 'medium':
      return {
        bloomIntensity: 1.0,
        bloomLuminanceThreshold: 0.25,
        bloomSamples: 3,
        godRaysEnabled: false,
        godRaysSamples: 30,
        vignetteEnabled: true,
        chromaticAberrationEnabled: true,
        chromaticAberrationIntensity: 0.7
      }

    case 'low':
      return {
        bloomIntensity: 0.8,
        bloomLuminanceThreshold: 0.3,
        bloomSamples: 2,
        godRaysEnabled: false,
        godRaysSamples: 20,
        vignetteEnabled: true,
        chromaticAberrationEnabled: false, // Disable chromatic aberration
        chromaticAberrationIntensity: 0.5
      }

    case 'potato':
      return {
        bloomIntensity: 0.6,
        bloomLuminanceThreshold: 0.4,
        bloomSamples: 1,
        godRaysEnabled: false,
        godRaysSamples: 10,
        vignetteEnabled: false, // Minimal effects
        chromaticAberrationEnabled: false,
        chromaticAberrationIntensity: 0
      }
  }
}

/**
 * Automatically determine performance preset based on FPS
 */
export function getAutoPreset(currentFPS: number): PerformancePreset {
  if (currentFPS >= 55) return 'high'
  if (currentFPS >= 45) return 'medium'
  if (currentFPS >= 35) return 'low'
  return 'potato'
}

/**
 * FPS monitoring with smoothing
 */
export class FPSMonitor {
  private fpsHistory: number[] = []
  private readonly historySize = 30 // ~0.5 seconds at 60fps

  addSample(fps: number) {
    this.fpsHistory.push(fps)
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift()
    }
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0)
    return Math.round(sum / this.fpsHistory.length)
  }

  reset() {
    this.fpsHistory = []
  }
}
