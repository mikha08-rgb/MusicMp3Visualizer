import * as THREE from 'three'

export interface LODLevel {
  level: 'high' | 'medium' | 'low' | 'hidden'
  distance: number
  shouldRender: boolean
  quality: number // 0-1, 1 being highest quality
}

/**
 * Calculate LOD level based on distance from camera
 * @param position - Position of the object in world space
 * @param camera - Three.js camera
 * @param thresholds - Distance thresholds for each LOD level
 * @returns LOD level information
 */
export function calculateLOD(
  position: THREE.Vector3,
  camera: THREE.Camera,
  thresholds: {
    high: number    // Close distance
    medium: number  // Medium distance
    low: number     // Far distance
    cull: number    // Beyond this, don't render
  } = {
    high: 30,
    medium: 60,
    low: 100,
    cull: 150
  }
): LODLevel {
  const distance = camera.position.distanceTo(position)

  if (distance > thresholds.cull) {
    return { level: 'hidden', distance, shouldRender: false, quality: 0 }
  }

  if (distance > thresholds.low) {
    return { level: 'low', distance, shouldRender: true, quality: 0.3 }
  }

  if (distance > thresholds.medium) {
    return { level: 'medium', distance, shouldRender: true, quality: 0.6 }
  }

  return { level: 'high', distance, shouldRender: true, quality: 1.0 }
}

/**
 * Check if object is within camera frustum
 * @param position - Position of the object
 * @param camera - Three.js camera
 * @param margin - Extra margin for culling (default 10)
 */
export function isInFrustum(
  position: THREE.Vector3,
  camera: THREE.Camera,
  margin: number = 10
): boolean {
  const frustum = new THREE.Frustum()
  const projScreenMatrix = new THREE.Matrix4()

  projScreenMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  )
  frustum.setFromProjectionMatrix(projScreenMatrix)

  // Create a sphere around the position with margin radius
  const sphere = new THREE.Sphere(position, margin)

  return frustum.intersectsSphere(sphere)
}

/**
 * Simplified distance check for performance
 * @param position - Position of the object
 * @param camera - Three.js camera
 * @param maxDistance - Maximum render distance
 */
export function shouldRenderByDistance(
  position: THREE.Vector3,
  camera: THREE.Camera,
  maxDistance: number
): boolean {
  const distanceSq = camera.position.distanceToSquared(position)
  return distanceSq < maxDistance * maxDistance
}

/**
 * Combined frustum + distance culling (OPTIMIZED - reuses frustum/matrix)
 * Use this for maximum performance when checking many objects
 *
 * @param position - Position of the object
 * @param camera - Three.js camera
 * @param maxDistance - Maximum render distance
 * @param frustum - Reusable frustum instance
 * @param projScreenMatrix - Reusable matrix instance
 * @param margin - Extra margin for culling (default 5)
 */
export function shouldRenderOptimized(
  position: THREE.Vector3,
  camera: THREE.Camera,
  maxDistance: number,
  frustum: THREE.Frustum,
  projScreenMatrix: THREE.Matrix4,
  margin: number = 5
): boolean {
  // First check distance (fast)
  const distanceSq = camera.position.distanceToSquared(position)
  if (distanceSq > maxDistance * maxDistance) {
    return false
  }

  // Then check frustum (more expensive, but necessary)
  projScreenMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  )
  frustum.setFromProjectionMatrix(projScreenMatrix)

  // Create a sphere around the position with margin radius
  const sphere = new THREE.Sphere(position, margin)

  return frustum.intersectsSphere(sphere)
}

/**
 * Get quality multiplier for instance counts based on distance
 * @param distance - Distance from camera
 * @param maxDistance - Maximum distance for rendering
 * @returns Quality multiplier (0-1)
 */
export function getQualityMultiplier(distance: number, maxDistance: number): number {
  if (distance > maxDistance) return 0
  return Math.max(0, 1 - (distance / maxDistance))
}
