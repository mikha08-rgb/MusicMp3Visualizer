/**
 * Performance presets for post-processing effects and component rendering
 */

export type PerformancePreset = 'ultra' | 'high' | 'medium' | 'low' | 'potato'

export interface PostProcessingQuality {
  bloomIntensity: number
  bloomLuminanceThreshold: number
  bloomSamples: number
  godRaysEnabled: boolean
  godRaysSamples: number
  vignetteEnabled: boolean
  vignetteDarkness: number
}

/**
 * Component-level performance settings
 * Determines which environment components should be enabled based on performance preset
 */
export interface ComponentQuality {
  // Core visualizations (always enabled)
  visualization: boolean
  grid: boolean

  // Environment layers (progressive)
  buildings: boolean
  buildingDetails: boolean // Window flicker, neon signs, etc.
  streetLevel: boolean // Crowd, vehicles, stalls
  midLevel: boolean // Billboards, atmospheric effects
  skyLevel: boolean // Drones, ships, platforms

  // Effects
  particles: boolean
  trails: boolean
  hud: boolean

  // Advanced effects
  reflections: boolean
  atmosphericEffects: boolean

  // Instance counts
  buildingCount: number
  crowdCount: number
  vehicleCount: number
  droneCount: number
  particleCount: number
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
        vignetteDarkness: 0.5
      }

    case 'high':
      return {
        bloomIntensity: 1.2,
        bloomLuminanceThreshold: 0.2,
        bloomSamples: 4,
        godRaysEnabled: false, // God rays are expensive
        godRaysSamples: 40,
        vignetteEnabled: true,
        vignetteDarkness: 0.4
      }

    case 'medium':
      return {
        bloomIntensity: 1.0,
        bloomLuminanceThreshold: 0.25,
        bloomSamples: 3,
        godRaysEnabled: false,
        godRaysSamples: 30,
        vignetteEnabled: true,
        vignetteDarkness: 0.3
      }

    case 'low':
      return {
        bloomIntensity: 0.8,
        bloomLuminanceThreshold: 0.3,
        bloomSamples: 2,
        godRaysEnabled: false,
        godRaysSamples: 20,
        vignetteEnabled: true,
        vignetteDarkness: 0.2
      }

    case 'potato':
      return {
        bloomIntensity: 0.6,
        bloomLuminanceThreshold: 0.4,
        bloomSamples: 1,
        godRaysEnabled: false,
        godRaysSamples: 10,
        vignetteEnabled: false, // Minimal effects
        vignetteDarkness: 0.1
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
 * Get component quality settings based on preset
 * This is the key to achieving 4x performance - aggressive component culling
 */
export function getComponentQuality(preset: PerformancePreset): ComponentQuality {
  switch (preset) {
    case 'ultra':
      return {
        visualization: true,
        grid: true,
        buildings: true,
        buildingDetails: true,
        streetLevel: true,
        midLevel: true,
        skyLevel: true,
        particles: true,
        trails: true,
        hud: true,
        reflections: true,
        atmosphericEffects: true,
        buildingCount: 16,
        crowdCount: 48,
        vehicleCount: 16,
        droneCount: 25,
        particleCount: 400
      }

    case 'high':
      return {
        visualization: true,
        grid: true,
        buildings: true,
        buildingDetails: true,
        streetLevel: true,
        midLevel: true,
        skyLevel: true, // Keep sky elements
        particles: true,
        trails: true,
        hud: true,
        reflections: false, // Disable reflections
        atmosphericEffects: false, // Disable rain/fog particles
        buildingCount: 12,
        crowdCount: 32,
        vehicleCount: 12,
        droneCount: 16,
        particleCount: 250
      }

    case 'medium':
      return {
        visualization: true,
        grid: true,
        buildings: true,
        buildingDetails: false, // Disable window flicker, neon pulse
        streetLevel: true,
        midLevel: false, // Disable billboards, atmospheric
        skyLevel: true, // Keep minimal sky
        particles: true,
        trails: false, // Disable light trails
        hud: false, // Disable HUD overlays
        reflections: false,
        atmosphericEffects: false,
        buildingCount: 8,
        crowdCount: 16,
        vehicleCount: 8,
        droneCount: 8,
        particleCount: 150
      }

    case 'low':
      return {
        visualization: true,
        grid: true,
        buildings: true,
        buildingDetails: false,
        streetLevel: false, // Disable ground activity
        midLevel: false,
        skyLevel: false, // Disable all sky elements
        particles: false, // Disable all particles
        trails: false,
        hud: false,
        reflections: false,
        atmosphericEffects: false,
        buildingCount: 6,
        crowdCount: 0,
        vehicleCount: 0,
        droneCount: 0,
        particleCount: 0
      }

    case 'potato':
      return {
        visualization: true, // Only visualization
        grid: true, // And grid
        buildings: false, // Everything else disabled
        buildingDetails: false,
        streetLevel: false,
        midLevel: false,
        skyLevel: false,
        particles: false,
        trails: false,
        hud: false,
        reflections: false,
        atmosphericEffects: false,
        buildingCount: 0,
        crowdCount: 0,
        vehicleCount: 0,
        droneCount: 0,
        particleCount: 0
      }
  }
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
