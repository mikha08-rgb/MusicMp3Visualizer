/**
 * Shared Material Library
 *
 * CRITICAL OPTIMIZATION: Reuse materials across instances instead of creating
 * new ones. Materials are expensive to create and switching between materials
 * causes GPU state changes.
 *
 * Usage:
 * - Import { materials } from '@/lib/material-library'
 * - Use materials.standard.metallic, materials.basic.emissive, etc.
 * - Clone only when you need instance-specific properties (color, etc.)
 * - For varying colors, use instancedMesh.setColorAt() instead of cloning
 */

import * as THREE from 'three'

// Standard materials - PBR rendering
const standardMetallic = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  metalness: 0.9,
  roughness: 0.2,
})

const standardMatte = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  metalness: 0.1,
  roughness: 0.9,
})

const standardGlossy = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  metalness: 0.7,
  roughness: 0.3,
})

const standardDark = new THREE.MeshStandardMaterial({
  color: '#1a1a1a',
  metalness: 0.5,
  roughness: 0.6,
})

// Basic materials - unlit, for emissive objects and UI
const basicWhite = new THREE.MeshBasicMaterial({
  color: '#ffffff',
  toneMapped: false,
})

const basicEmissive = new THREE.MeshBasicMaterial({
  color: '#ffffff',
  toneMapped: false,
})

const basicTransparent = new THREE.MeshBasicMaterial({
  color: '#ffffff',
  transparent: true,
  opacity: 0.5,
  toneMapped: false,
})

// Glass/transparent materials
const glass = new THREE.MeshStandardMaterial({
  color: '#88ccff',
  metalness: 0.9,
  roughness: 0.1,
  transparent: true,
  opacity: 0.3,
})

const glassThick = new THREE.MeshStandardMaterial({
  color: '#004466',
  metalness: 0.9,
  roughness: 0.1,
  transparent: true,
  opacity: 0.6,
})

// Emissive standard materials - for neon/glowing objects
const emissiveStandard = new THREE.MeshStandardMaterial({
  color: '#00ffff',
  emissive: '#00ffff',
  emissiveIntensity: 0.8,
  metalness: 0.8,
  roughness: 0.2,
  toneMapped: false,
})

const emissiveBright = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  emissive: '#ffffff',
  emissiveIntensity: 1.5,
  metalness: 0.9,
  roughness: 0.1,
  toneMapped: false,
})

// Particle materials
const particleAdditive = new THREE.PointsMaterial({
  size: 0.2,
  color: '#ffffff',
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true,
  depthWrite: false,
})

const particleNormal = new THREE.PointsMaterial({
  size: 0.3,
  color: '#ffffff',
  transparent: true,
  opacity: 0.7,
  sizeAttenuation: true,
})

// Flat shaded materials - lower performance cost
const flatShadedDark = new THREE.MeshStandardMaterial({
  color: '#1a1a2e',
  metalness: 0.5,
  roughness: 0.7,
  flatShading: true,
})

const flatShadedMetallic = new THREE.MeshStandardMaterial({
  color: '#888888',
  metalness: 0.9,
  roughness: 0.3,
  flatShading: true,
})

/**
 * Material Library - Organized by type and purpose
 * All materials are pre-created and ready to use
 */
export const materials = {
  standard: {
    metallic: standardMetallic,
    matte: standardMatte,
    glossy: standardGlossy,
    dark: standardDark,
  },
  basic: {
    white: basicWhite,
    emissive: basicEmissive,
    transparent: basicTransparent,
  },
  glass: {
    thin: glass,
    thick: glassThick,
  },
  emissive: {
    standard: emissiveStandard,
    bright: emissiveBright,
  },
  particles: {
    additive: particleAdditive,
    normal: particleNormal,
  },
  flatShaded: {
    dark: flatShadedDark,
    metallic: flatShadedMetallic,
  },
}

/**
 * Clone a material with custom properties
 * Use this when you need instance-specific values
 *
 * @example
 * const redMetal = cloneMaterial(materials.standard.metallic, { color: '#ff0000' })
 */
export function cloneMaterial<T extends THREE.Material>(
  baseMaterial: T,
  overrides: Partial<T> = {}
): T {
  const cloned = baseMaterial.clone() as T
  Object.assign(cloned, overrides)
  return cloned
}

/**
 * Create an emissive material with custom color
 * Common use case helper
 */
export function createEmissiveMaterial(color: string | THREE.Color, intensity = 1.0): THREE.MeshStandardMaterial {
  const colorObj = typeof color === 'string' ? new THREE.Color(color) : color
  return cloneMaterial(materials.emissive.standard, {
    color: colorObj,
    emissive: colorObj,
    emissiveIntensity: intensity,
  })
}

/**
 * Create a basic emissive material (no lighting, better performance)
 */
export function createBasicEmissive(color: string | THREE.Color): THREE.MeshBasicMaterial {
  const colorObj = typeof color === 'string' ? new THREE.Color(color) : color
  return cloneMaterial(materials.basic.emissive, {
    color: colorObj,
  })
}

/**
 * Get a material by path string (for dynamic access)
 * @example getMaterial('standard.metallic')
 */
export function getMaterial(path: string): THREE.Material {
  const [type, variant] = path.split('.')
  const material = (materials as any)[type]?.[variant]

  if (!material) {
    console.warn(`Material not found: ${path}, falling back to standard.metallic`)
    return materials.standard.metallic
  }

  return material
}

/**
 * Dispose all materials (call on app unmount if needed)
 */
export function disposeAllMaterials() {
  Object.values(materials).forEach((typeGroup) => {
    Object.values(typeGroup).forEach((material) => {
      material.dispose()
    })
  })
}
