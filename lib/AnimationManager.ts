/**
 * Centralized Animation Manager
 *
 * Replaces multiple useFrame hooks with a single batched update system.
 * Massive performance improvement by reducing React overhead and enabling
 * smart update scheduling.
 */

import * as THREE from 'three'

export type AnimationPriority = 'high' | 'medium' | 'low'
export type AnimationCallback = (time: number, delta: number, camera: THREE.Camera) => void

interface AnimationEntry {
  id: string
  callback: AnimationCallback
  priority: AnimationPriority
  updateRate: number // Hz (60 = every frame, 30 = every other frame, etc.)
  lastUpdate: number
  enabled: boolean
}

class AnimationManagerClass {
  private animations: Map<string, AnimationEntry> = new Map()
  private frameCount = 0

  /**
   * Register an animation callback
   */
  register(
    id: string,
    callback: AnimationCallback,
    priority: AnimationPriority = 'medium',
    updateRate: number = 60
  ): () => void {
    this.animations.set(id, {
      id,
      callback,
      priority,
      updateRate,
      lastUpdate: 0,
      enabled: true
    })

    // Return unregister function
    return () => this.unregister(id)
  }

  /**
   * Unregister an animation
   */
  unregister(id: string): void {
    this.animations.delete(id)
  }

  /**
   * Enable/disable an animation
   */
  setEnabled(id: string, enabled: boolean): void {
    const entry = this.animations.get(id)
    if (entry) {
      entry.enabled = enabled
    }
  }

  /**
   * Update all animations (called once per frame)
   */
  update(time: number, delta: number, camera: THREE.Camera): void {
    this.frameCount++

    // Sort by priority: high > medium > low
    const entries = Array.from(this.animations.values())

    for (const entry of entries) {
      if (!entry.enabled) continue

      // Check if enough time has passed based on update rate
      const frameInterval = 60 / entry.updateRate

      if (this.frameCount % Math.round(frameInterval) === 0) {
        try {
          entry.callback(time, delta, camera)
          entry.lastUpdate = time
        } catch (error) {
          console.error(`Animation error in ${entry.id}:`, error)
        }
      }
    }
  }

  /**
   * Adjust update rates based on FPS for automatic quality scaling
   */
  adjustForFPS(currentFPS: number): void {
    if (currentFPS >= 55) {
      // High FPS - full quality
      this.setUpdateRates({
        high: 60,
        medium: 60,
        low: 30
      })
    } else if (currentFPS >= 45) {
      // Medium FPS - slight reduction
      this.setUpdateRates({
        high: 60,
        medium: 30,
        low: 15
      })
    } else if (currentFPS >= 35) {
      // Low FPS - significant reduction
      this.setUpdateRates({
        high: 30,
        medium: 15,
        low: 10
      })
    } else {
      // Very low FPS - minimal updates
      this.setUpdateRates({
        high: 30,
        medium: 10,
        low: 5
      })
    }
  }

  private setUpdateRates(rates: { high: number; medium: number; low: number }): void {
    for (const entry of this.animations.values()) {
      entry.updateRate = rates[entry.priority]
    }
  }

  /**
   * Get stats for debugging
   */
  getStats(): { total: number; enabled: number; disabled: number } {
    const enabled = Array.from(this.animations.values()).filter(e => e.enabled).length
    return {
      total: this.animations.size,
      enabled,
      disabled: this.animations.size - enabled
    }
  }

  /**
   * Clear all animations
   */
  clear(): void {
    this.animations.clear()
  }
}

// Singleton instance
export const AnimationManager = new AnimationManagerClass()

/**
 * Hook to use in React components
 */
export function useAnimationManager(
  id: string,
  callback: AnimationCallback,
  priority: AnimationPriority = 'medium',
  updateRate: number = 60,
  enabled: boolean = true
): void {
  // Register on mount, unregister on unmount
  const callbackRef = React.useRef(callback)
  callbackRef.current = callback

  React.useEffect(() => {
    const wrappedCallback: AnimationCallback = (time, delta, camera) => {
      callbackRef.current(time, delta, camera)
    }

    const unregister = AnimationManager.register(id, wrappedCallback, priority, updateRate)
    AnimationManager.setEnabled(id, enabled)

    return () => {
      unregister()
    }
  }, [id, priority, updateRate])

  React.useEffect(() => {
    AnimationManager.setEnabled(id, enabled)
  }, [id, enabled])
}

// Need React import for hooks
import React from 'react'
