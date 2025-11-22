/**
 * Shared Geometry Library
 *
 * CRITICAL OPTIMIZATION: Reuse geometries across all instances instead of
 * creating new ones. This saves massive amounts of memory and GPU overhead.
 *
 * Usage:
 * - Import { geometries } from '@/lib/geometry-library'
 * - Use geometries.box.small, geometries.sphere.medium, etc.
 * - DO NOT create new geometries in components
 */

import * as THREE from 'three'

// Box geometries - various sizes
const boxSmall = new THREE.BoxGeometry(0.3, 0.3, 0.3)
const boxMedium = new THREE.BoxGeometry(1, 1, 1)
const boxLarge = new THREE.BoxGeometry(2, 2, 2)
const boxWide = new THREE.BoxGeometry(2, 0.5, 1)
const boxTall = new THREE.BoxGeometry(1, 3, 1)
const boxFlat = new THREE.BoxGeometry(1, 0.1, 1)

// Sphere geometries - low poly for performance
const sphereTiny = new THREE.SphereGeometry(0.1, 4, 4)
const sphereSmall = new THREE.SphereGeometry(0.5, 6, 6)
const sphereMedium = new THREE.SphereGeometry(1, 8, 8)
const sphereLarge = new THREE.SphereGeometry(2, 12, 12)

// Cylinder geometries - low poly
const cylinderSmall = new THREE.CylinderGeometry(0.3, 0.3, 1, 6)
const cylinderMedium = new THREE.CylinderGeometry(0.5, 0.5, 1, 8)
const cylinderLarge = new THREE.CylinderGeometry(1, 1, 2, 12)
const cylinderThin = new THREE.CylinderGeometry(0.1, 0.1, 2, 6)

// Capsule geometries - for characters/drones
const capsuleSmall = new THREE.CapsuleGeometry(0.3, 0.5, 4, 4)
const capsuleMedium = new THREE.CapsuleGeometry(0.5, 1, 4, 4)

// Cone geometries - for effects, buildings
const coneSmall = new THREE.ConeGeometry(0.5, 1, 6)
const coneMedium = new THREE.ConeGeometry(1, 2, 8)

// Plane geometries - for trails, effects
const planeSmall = new THREE.PlaneGeometry(1, 1)
const planeMedium = new THREE.PlaneGeometry(2, 2)
const planeLarge = new THREE.PlaneGeometry(5, 5)

// Ring geometries - for effects
const ringSmall = new THREE.RingGeometry(0.5, 0.8, 16)
const ringMedium = new THREE.RingGeometry(1, 1.5, 24)
const ringLarge = new THREE.RingGeometry(5, 6, 32)

// Torus geometries - for tracks, effects
const torusSmall = new THREE.TorusGeometry(1, 0.15, 8, 16)
const torusMedium = new THREE.TorusGeometry(2, 0.3, 8, 24)

// Circle geometries - for markers, effects
const circleSmall = new THREE.CircleGeometry(0.5, 16)
const circleMedium = new THREE.CircleGeometry(1, 24)

// Octahedron geometries - for crystals, special effects
const octahedronSmall = new THREE.OctahedronGeometry(0.5, 1)
const octahedronMedium = new THREE.OctahedronGeometry(1, 2)

/**
 * Geometry Library - Organized by type and size
 * All geometries are pre-created and ready to use
 */
export const geometries = {
  box: {
    small: boxSmall,
    medium: boxMedium,
    large: boxLarge,
    wide: boxWide,
    tall: boxTall,
    flat: boxFlat,
  },
  sphere: {
    tiny: sphereTiny,
    small: sphereSmall,
    medium: sphereMedium,
    large: sphereLarge,
  },
  cylinder: {
    small: cylinderSmall,
    medium: cylinderMedium,
    large: cylinderLarge,
    thin: cylinderThin,
  },
  capsule: {
    small: capsuleSmall,
    medium: capsuleMedium,
  },
  cone: {
    small: coneSmall,
    medium: coneMedium,
  },
  plane: {
    small: planeSmall,
    medium: planeMedium,
    large: planeLarge,
  },
  ring: {
    small: ringSmall,
    medium: ringMedium,
    large: ringLarge,
  },
  torus: {
    small: torusSmall,
    medium: torusMedium,
  },
  circle: {
    small: circleSmall,
    medium: circleMedium,
  },
  octahedron: {
    small: octahedronSmall,
    medium: octahedronMedium,
  },
}

/**
 * Get a geometry by path string (for dynamic access)
 * @example getGeometry('box.small') // returns boxSmall
 */
export function getGeometry(path: string): THREE.BufferGeometry {
  const [type, size] = path.split('.')
  const geometry = (geometries as any)[type]?.[size]

  if (!geometry) {
    console.warn(`Geometry not found: ${path}, falling back to box.small`)
    return geometries.box.small
  }

  return geometry
}

/**
 * Dispose all geometries (call on app unmount if needed)
 */
export function disposeAllGeometries() {
  Object.values(geometries).forEach((typeGroup) => {
    Object.values(typeGroup).forEach((geometry) => {
      geometry.dispose()
    })
  })
}
