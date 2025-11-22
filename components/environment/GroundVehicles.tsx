'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface GroundVehiclesProps {
  bass: number
  mids: number
  beatDetected: boolean
  theme?: ColorTheme
}

interface VehicleRefs {
  groupRef: React.RefObject<THREE.Group>
  headlightsRef: React.RefObject<THREE.Mesh>
  brakelightsRef: React.RefObject<THREE.Mesh>
  pathRadius: number
  pathAngle: number
  speed: number
  isBraking: boolean
  brakeTimer: number
}

function GroundVehicle({
  pathRadius,
  pathAngle,
  speed,
  color,
  size,
  vehicleType,
  onMount
}: {
  pathRadius: number
  pathAngle: number
  speed: number
  color: THREE.Color
  size: number
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'sports-car' | 'hovercar' | 'bus' | 'police-car' | 'van' | 'luxury-sedan' | 'cyberpunk-racer' | 'armored-transport' | 'street-food-cart' | 'emergency-vehicle' | 'tank' | 'bulldozer' | 'crane-truck' | 'cement-mixer' | 'limousine' | 'taxi' | 'fire-truck' | 'tow-truck' | 'delivery-robot' | 'garbage-truck'
  onMount: (refs: VehicleRefs) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const headlightsRef = useRef<THREE.Mesh>(null)
  const brakelightsRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (groupRef.current && headlightsRef.current && brakelightsRef.current) {
      onMount({
        groupRef,
        headlightsRef,
        brakelightsRef,
        pathRadius,
        pathAngle,
        speed,
        isBraking: false,
        brakeTimer: 0
      })
    }
  }, [])

  // Different vehicle shapes
  const renderVehicle = () => {
    switch (vehicleType) {
      case 'motorcycle':
        return (
          <>
            {/* Main body - thin and sleek */}
            <mesh castShadow>
              <boxGeometry args={[size * 1.5, size * 0.4, size * 0.6]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Rider */}
            <mesh position={[0, size * 0.6, 0]}>
              <capsuleGeometry args={[size * 0.15, size * 0.3, 4, 4]} />
              <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
            </mesh>
          </>
        )
      case 'truck':
        return (
          <>
            {/* Cab - disabled shadows for performance */}
            <mesh position={[size * 0.8, size * 0.3, 0]}>
              <boxGeometry args={[size * 1.2, size * 0.8, size * 1.2]} />
              <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Cargo container */}
            <mesh position={[-size * 0.8, size * 0.4, 0]}>
              <boxGeometry args={[size * 2, size, size * 1.2]} />
              <meshStandardMaterial color="#2a2a3e" metalness={0.5} roughness={0.6} />
            </mesh>
          </>
        )
      case 'sports-car':
        return (
          <>
            {/* Low-profile wedge body */}
            <mesh>
              <boxGeometry args={[size * 2.2, size * 0.35, size * 1.1]} />
              <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Sleek cockpit */}
            <mesh position={[size * 0.3, size * 0.3, 0]}>
              <boxGeometry args={[size * 0.9, size * 0.2, size * 1.0]} />
              <meshStandardMaterial color="#000000" transparent opacity={0.3} metalness={1.0} roughness={0.0} />
            </mesh>
            {/* Rear spoiler */}
            <mesh position={[-size * 1.0, size * 0.5, 0]}>
              <boxGeometry args={[size * 0.3, size * 0.15, size * 1.3]} />
              <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Racing stripes */}
            <mesh position={[0, size * 0.19, 0]}>
              <boxGeometry args={[size * 2.25, size * 0.02, size * 0.3]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>
            {/* Neon underglow */}
            <mesh position={[0, -size * 0.2, 0]}>
              <boxGeometry args={[size * 2.0, size * 0.05, size * 0.4]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
            </mesh>
          </>
        )
      case 'hovercar':
        return (
          <>
            {/* Main floating body */}
            <mesh position={[0, size * 0.3, 0]}>
              <boxGeometry args={[size * 2.0, size * 0.6, size * 1.2]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Bubble cockpit */}
            <mesh position={[size * 0.4, size * 0.7, 0]}>
              <sphereGeometry args={[size * 0.5, 8, 8]} />
              <meshStandardMaterial color="#1a1a2e" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Repulsor pods (no wheels!) */}
            {[[-0.7, -0.5], [-0.7, 0.5], [0.7, -0.5], [0.7, 0.5]].map(([x, z], i) => (
              <group key={i}>
                <mesh position={[x * size, 0, z * size]}>
                  <cylinderGeometry args={[0.25, 0.3, 0.4, 8]} />
                  <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
                </mesh>
                {/* Repulsor glow */}
                <mesh position={[x * size, -0.25, z * size]}>
                  <cylinderGeometry args={[0.3, 0.35, 0.1, 8]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1.5}
                    transparent
                    opacity={0.7}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            ))}
          </>
        )
      case 'bus':
        return (
          <>
            {/* Long articulated body */}
            <mesh>
              <boxGeometry args={[size * 4, size * 1.2, size * 1.3]} />
              <meshStandardMaterial color={color} metalness={0.4} roughness={0.6} />
            </mesh>
            {/* Roof */}
            <mesh position={[0, size * 0.65, 0]}>
              <boxGeometry args={[size * 4.05, size * 0.1, size * 1.35]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.7} />
            </mesh>
            {/* Multiple windows - passenger silhouettes */}
            {[-1.5, -0.5, 0.5, 1.5].map((xOffset, i) => (
              <mesh key={i} position={[xOffset * size, size * 0.3, size * 0.67]}>
                <boxGeometry args={[size * 0.6, size * 0.5, size * 0.05]} />
                <meshStandardMaterial
                  color="#ffff80"
                  emissive="#ffff80"
                  emissiveIntensity={0.6}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            ))}
            {/* Destination sign */}
            <mesh position={[size * 2.1, size * 0.7, 0]}>
              <boxGeometry args={[size * 0.1, size * 0.3, size * 0.8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
            </mesh>
          </>
        )
      case 'police-car':
        return (
          <>
            {/* Main body - black and white scheme */}
            <mesh>
              <boxGeometry args={[size * 2, size * 0.5, size]} />
              <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[0, size * 0.28, 0]}>
              <boxGeometry args={[size * 2.05, size * 0.05, size * 1.05]} />
              <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Windshield */}
            <mesh position={[size * 0.2, size * 0.4, 0]}>
              <boxGeometry args={[size * 0.8, size * 0.3, size * 0.9]} />
              <meshStandardMaterial color="#1a1a2e" transparent opacity={0.5} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Light bar on top - sirens! */}
            <mesh position={[0, size * 0.7, 0]}>
              <boxGeometry args={[size * 1.2, size * 0.1, size * 0.3]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Red/Blue alternating lights */}
            <mesh position={[-size * 0.3, size * 0.75, 0]}>
              <boxGeometry args={[size * 0.3, size * 0.08, size * 0.25]} />
              <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} toneMapped={false} />
            </mesh>
            <mesh position={[size * 0.3, size * 0.75, 0]}>
              <boxGeometry args={[size * 0.3, size * 0.08, size * 0.25]} />
              <meshStandardMaterial color="#0000ff" emissive="#0000ff" emissiveIntensity={1.5} toneMapped={false} />
            </mesh>
          </>
        )
      case 'van':
        return (
          <>
            {/* Box-shaped cargo area */}
            <mesh position={[-size * 0.3, size * 0.4, 0]}>
              <boxGeometry args={[size * 2.5, size * 1.0, size * 1.2]} />
              <meshStandardMaterial color={color} metalness={0.5} roughness={0.6} />
            </mesh>
            {/* Cab section */}
            <mesh position={[size * 1.0, size * 0.3, 0]}>
              <boxGeometry args={[size * 0.8, size * 0.8, size * 1.2]} />
              <meshStandardMaterial color={color} metalness={0.5} roughness={0.6} />
            </mesh>
            {/* Side door */}
            <mesh position={[-size * 0.5, size * 0.3, size * 0.62]}>
              <boxGeometry args={[size * 0.8, size * 0.7, size * 0.05]} />
              <meshStandardMaterial color="#2a2a3e" metalness={0.6} roughness={0.7} />
            </mesh>
            {/* Delivery company markings */}
            <mesh position={[0, size * 0.7, size * 0.63]}>
              <boxGeometry args={[size * 1.5, size * 0.4, size * 0.02]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
            </mesh>
            {/* Roof rack */}
            <mesh position={[-size * 0.3, size * 0.95, 0]}>
              <boxGeometry args={[size * 2.3, size * 0.05, size * 0.9]} />
              <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.5} />
            </mesh>
          </>
        )
      case 'luxury-sedan':
        return (
          <>
            {/* Elegant elongated body */}
            <mesh>
              <boxGeometry args={[size * 2.5, size * 0.5, size * 1.1]} />
              <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Sophisticated cabin */}
            <mesh position={[size * 0.2, size * 0.5, 0]}>
              <boxGeometry args={[size * 1.3, size * 0.4, size * 1.0]} />
              <meshStandardMaterial color="#000000" transparent opacity={0.4} metalness={1.0} roughness={0.0} />
            </mesh>
            {/* Chrome accents */}
            <mesh position={[size * 1.3, size * 0.15, 0]}>
              <boxGeometry args={[size * 0.15, size * 0.2, size * 1.15]} />
              <meshStandardMaterial color="#cccccc" metalness={1.0} roughness={0.1} />
            </mesh>
            {/* Hood ornament */}
            <mesh position={[size * 1.3, size * 0.3, 0]}>
              <sphereGeometry args={[0.08, 6, 6]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.8} metalness={1.0} />
            </mesh>
            {/* Ambient lighting strip */}
            <mesh position={[0, size * 0.1, size * 0.56]}>
              <boxGeometry args={[size * 2.4, size * 0.05, size * 0.05]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} toneMapped={false} />
            </mesh>
          </>
        )
      case 'cyberpunk-racer':
        return (
          <>
            {/* Extreme aero body */}
            <mesh position={[0, size * 0.15, 0]}>
              <boxGeometry args={[size * 2.3, size * 0.3, size * 1.3]} />
              <meshStandardMaterial color={color} metalness={1.0} roughness={0.0} />
            </mesh>
            {/* Exposed engine */}
            <mesh position={[-size * 1.0, size * 0.4, 0]}>
              <cylinderGeometry args={[0.3, 0.35, 0.6, 6]} />
              <meshStandardMaterial
                color="#ff6600"
                emissive="#ff6600"
                emissiveIntensity={1.0}
                metalness={0.8}
                toneMapped={false}
              />
            </mesh>
            {/* Aggressive front splitter */}
            <mesh position={[size * 1.2, -size * 0.05, 0]}>
              <boxGeometry args={[size * 0.3, size * 0.05, size * 1.5]} />
              <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Massive rear wing */}
            <mesh position={[-size * 1.0, size * 0.8, 0]}>
              <boxGeometry args={[size * 0.4, size * 0.1, size * 1.6]} />
              <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Neon underglow - extreme */}
            <mesh position={[0, -size * 0.2, 0]}>
              <boxGeometry args={[size * 2.2, size * 0.08, size * 0.6]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.0} toneMapped={false} />
            </mesh>
            {/* Holographic number plates */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[0, size * 0.2, side * size * 0.67]}>
                <boxGeometry args={[size * 0.5, size * 0.15, size * 0.02]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={1.0}
                  transparent
                  opacity={0.7}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </>
        )
      case 'armored-transport':
        return (
          <>
            {/* Heavy angular armor */}
            <mesh>
              <boxGeometry args={[size * 2.2, size * 0.9, size * 1.4]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.8} />
            </mesh>
            {/* Reinforced cab */}
            <mesh position={[size * 0.8, size * 0.6, 0]}>
              <boxGeometry args={[size * 0.9, size * 0.6, size * 1.3]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.9} />
            </mesh>
            {/* Small armored windows */}
            <mesh position={[size * 0.9, size * 0.7, size * 0.68]}>
              <boxGeometry args={[size * 0.4, size * 0.2, size * 0.05]} />
              <meshStandardMaterial color="#000000" transparent opacity={0.8} metalness={0.9} />
            </mesh>
            {/* Roof turret */}
            <mesh position={[0, size * 0.9, 0]}>
              <cylinderGeometry args={[0.3, 0.35, 0.4, 8]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.8} />
            </mesh>
            {/* Warning lights */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[side * size * 0.6, size * 0.55, 0]}>
                <boxGeometry args={[size * 0.1, size * 0.08, size * 0.1]} />
                <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={1.0} toneMapped={false} />
              </mesh>
            ))}
            {/* Armor plating detail */}
            {[-0.5, 0, 0.5].map((offset, i) => (
              <mesh key={i} position={[offset * size, size * 0.5, size * 0.71]}>
                <boxGeometry args={[size * 0.3, size * 0.7, size * 0.02]} />
                <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.9} />
              </mesh>
            ))}
          </>
        )
      case 'street-food-cart':
        return (
          <>
            {/* Small wheeled cart base */}
            <mesh position={[0, size * 0.2, 0]}>
              <boxGeometry args={[size * 1.2, size * 0.4, size * 0.9]} />
              <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Vendor booth top */}
            <mesh position={[0, size * 0.6, 0]}>
              <boxGeometry args={[size * 1.3, size * 0.5, size * 1.0]} />
              <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.8} />
            </mesh>
            {/* Awning */}
            <mesh position={[0, size * 0.9, size * 0.3]}>
              <boxGeometry args={[size * 1.4, size * 0.05, size * 0.6]} />
              <meshStandardMaterial color={color} metalness={0.1} roughness={0.9} />
            </mesh>
            {/* Menu board */}
            <mesh position={[0, size * 0.6, size * 0.52]}>
              <boxGeometry args={[size * 0.8, size * 0.4, size * 0.02]} />
              <meshStandardMaterial
                color="#ffff00"
                emissive="#ffff00"
                emissiveIntensity={0.8}
              />
            </mesh>
            {/* Steam/heat effect (glowing) */}
            <mesh position={[size * 0.4, size * 1.0, 0]}>
              <cylinderGeometry args={[0.1, 0.15, 0.3, 6]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffaa00"
                emissiveIntensity={0.6}
                transparent
                opacity={0.5}
              />
            </mesh>
            {/* Hanging lights */}
            {[-0.5, 0, 0.5].map((offset, i) => (
              <mesh key={i} position={[offset * size, size * 0.88, size * 0.45]}>
                <sphereGeometry args={[0.08, 6, 6]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
              </mesh>
            ))}
          </>
        )
      case 'emergency-vehicle':
        return (
          <>
            {/* Ambulance-style body */}
            <mesh>
              <boxGeometry args={[size * 2.3, size * 0.9, size * 1.3]} />
              <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.5} />
            </mesh>
            {/* Orange/Red stripe */}
            <mesh position={[0, size * 0.5, size * 0.66]}>
              <boxGeometry args={[size * 2.35, size * 0.2, size * 0.02]} />
              <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.6} />
            </mesh>
            {/* Cab */}
            <mesh position={[size * 0.9, size * 0.3, 0]}>
              <boxGeometry args={[size * 0.8, size * 0.7, size * 1.25]} />
              <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.5} />
            </mesh>
            {/* Emergency light bar */}
            <mesh position={[0, size * 0.95, 0]}>
              <boxGeometry args={[size * 1.5, size * 0.1, size * 0.4]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Flashing lights */}
            {[-0.6, -0.2, 0.2, 0.6].map((offset, i) => (
              <mesh key={i} position={[offset * size, size * 1.0, 0]}>
                <boxGeometry args={[size * 0.15, size * 0.08, size * 0.35]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? "#ff0000" : "#ffffff"}
                  emissive={i % 2 === 0 ? "#ff0000" : "#ffffff"}
                  emissiveIntensity={1.5}
                  toneMapped={false}
                />
              </mesh>
            ))}
            {/* Medical cross symbol */}
            <mesh position={[-size * 0.5, size * 0.5, size * 0.67]}>
              <boxGeometry args={[size * 0.15, size * 0.4, size * 0.02]} />
              <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[-size * 0.5, size * 0.5, size * 0.67]}>
              <boxGeometry args={[size * 0.4, size * 0.15, size * 0.02]} />
              <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
            </mesh>
          </>
        )
      case 'tank':
        return (
          <>
            {/* Heavy armored body */}
            <mesh>
              <boxGeometry args={[size * 2.5, size * 0.8, size * 1.6]} />
              <meshStandardMaterial color="#3a4a2a" metalness={0.7} roughness={0.9} />
            </mesh>
            {/* Turret */}
            <mesh position={[0, size * 0.7, 0]}>
              <cylinderGeometry args={[size * 0.7, size * 0.7, size * 0.6, 8]} />
              <meshStandardMaterial color="#2a3a1a" metalness={0.8} roughness={0.9} />
            </mesh>
            {/* Tank barrel */}
            <mesh position={[size * 1.5, size * 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, size * 2, 8]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.8} />
            </mesh>
            {/* Tracks (simplified) */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[0, -size * 0.2, side * size * 0.85]}>
                <boxGeometry args={[size * 2.3, size * 0.4, size * 0.3]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.95} />
              </mesh>
            ))}
            {/* Armored plates */}
            {[-0.8, 0, 0.8].map((offset, i) => (
              <mesh key={i} position={[offset * size, size * 0.45, size * 0.82]}>
                <boxGeometry args={[size * 0.6, size * 0.7, size * 0.05]} />
                <meshStandardMaterial color="#4a4a3a" metalness={0.6} roughness={0.9} />
              </mesh>
            ))}
          </>
        )
      case 'bulldozer':
        return (
          <>
            {/* Main cab - elevated */}
            <mesh position={[0, size * 0.5, 0]}>
              <boxGeometry args={[size * 1.5, size * 1.0, size * 1.2]} />
              <meshStandardMaterial color="#ffaa00" metalness={0.5} roughness={0.7} />
            </mesh>
            {/* Engine compartment */}
            <mesh position={[-size * 0.9, size * 0.2, 0]}>
              <boxGeometry args={[size * 0.8, size * 0.6, size * 1.1]} />
              <meshStandardMaterial color="#ff8800" metalness={0.4} roughness={0.8} />
            </mesh>
            {/* Large blade at front */}
            <mesh position={[size * 1.3, size * 0.3, 0]}>
              <boxGeometry args={[size * 0.15, size * 1.0, size * 2.0]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.8} />
            </mesh>
            {/* Hydraulic arms for blade */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[size * 0.8, 0, side * size * 0.9]} rotation={[0, 0, Math.PI / 6]}>
                <cylinderGeometry args={[0.1, 0.12, size * 1.2, 6]} />
                <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.7} />
              </mesh>
            ))}
            {/* Tracks */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[0, -size * 0.3, side * size * 0.7]}>
                <boxGeometry args={[size * 2.2, size * 0.6, size * 0.4]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.95} />
              </mesh>
            ))}
            {/* Exhaust stack */}
            <mesh position={[-size * 1.2, size * 1.2, size * 0.4]}>
              <cylinderGeometry args={[0.15, 0.15, 0.8, 6]} />
              <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.6} />
            </mesh>
          </>
        )
      case 'crane-truck':
        return (
          <>
            {/* Truck cab */}
            <mesh position={[size * 1.0, size * 0.4, 0]}>
              <boxGeometry args={[size * 1.0, size * 0.9, size * 1.2]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.6} />
            </mesh>
            {/* Flatbed */}
            <mesh position={[-size * 0.5, size * 0.1, 0]}>
              <boxGeometry args={[size * 2.5, size * 0.3, size * 1.3]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.7} />
            </mesh>
            {/* Crane base */}
            <mesh position={[-size * 1.2, size * 0.6, 0]}>
              <cylinderGeometry args={[0.35, 0.4, 0.8, 8]} />
              <meshStandardMaterial color="#ffaa00" metalness={0.6} roughness={0.7} />
            </mesh>
            {/* Crane arm (angled up) */}
            <mesh position={[-size * 1.2, size * 1.5, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[size * 0.2, size * 2.5, size * 0.2]} />
              <meshStandardMaterial color="#ffaa00" metalness={0.7} roughness={0.6} />
            </mesh>
            {/* Crane hook */}
            <mesh position={[-size * 2.8, size * 0.8, 0]}>
              <boxGeometry args={[size * 0.15, size * 0.3, size * 0.15]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.3} />
            </mesh>
            {/* Support struts */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[-size * 0.8, -size * 0.2, side * size * 0.8]} rotation={[0, 0, side * Math.PI / 6]}>
                <boxGeometry args={[size * 0.1, size * 0.6, size * 0.1]} />
                <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.7} />
              </mesh>
            ))}
            {/* Warning lights */}
            <mesh position={[-size * 1.2, size * 1.0, 0]}>
              <sphereGeometry args={[0.12, 6, 6]} />
              <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={1.2} toneMapped={false} />
            </mesh>
          </>
        )
      case 'cement-mixer':
        return (
          <>
            {/* Truck cab */}
            <mesh position={[size * 1.1, size * 0.4, 0]}>
              <boxGeometry args={[size * 1.0, size * 0.9, size * 1.2]} />
              <meshStandardMaterial color={color} metalness={0.5} roughness={0.7} />
            </mesh>
            {/* Rotating drum (large cylinder) */}
            <mesh position={[-size * 0.3, size * 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[size * 0.75, size * 0.75, size * 2.5, 12]} />
              <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.5} />
            </mesh>
            {/* Spiral ridges on drum */}
            {[0, 1, 2].map((i) => (
              <mesh
                key={i}
                position={[-size * 0.3, size * 0.6, 0]}
                rotation={[0, (i / 3) * Math.PI * 2, Math.PI / 2]}
              >
                <boxGeometry args={[size * 0.15, size * 2.6, size * 0.1]} />
                <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.6} />
              </mesh>
            ))}
            {/* Chute at back */}
            <mesh position={[-size * 1.7, size * 0.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <boxGeometry args={[size * 0.3, size * 0.8, size * 0.5]} />
              <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.6} />
            </mesh>
            {/* Support frame */}
            <mesh position={[-size * 0.3, 0, 0]}>
              <boxGeometry args={[size * 2.0, size * 0.4, size * 1.0]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.8} />
            </mesh>
          </>
        )
      case 'limousine':
        return (
          <>
            {/* Extra-long elegant body */}
            <mesh>
              <boxGeometry args={[size * 4.0, size * 0.6, size * 1.1]} />
              <meshStandardMaterial color="#000000" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Extended passenger cabin */}
            <mesh position={[0, size * 0.5, 0]}>
              <boxGeometry args={[size * 3.0, size * 0.45, size * 1.0]} />
              <meshStandardMaterial color="#000000" transparent opacity={0.3} metalness={1.0} roughness={0.0} />
            </mesh>
            {/* Tinted windows - multiple sections */}
            {[-1.2, -0.4, 0.4, 1.2].map((offset, i) => (
              <mesh key={i} position={[offset * size, size * 0.5, size * 0.56]}>
                <boxGeometry args={[size * 0.6, size * 0.4, size * 0.02]} />
                <meshStandardMaterial color="#1a1a2e" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
              </mesh>
            ))}
            {/* Chrome trim */}
            <mesh position={[0, size * 0.28, 0]}>
              <boxGeometry args={[size * 4.05, size * 0.05, size * 1.15]} />
              <meshStandardMaterial color="#cccccc" metalness={1.0} roughness={0.05} />
            </mesh>
            {/* Luxury ambient lighting strip */}
            <mesh position={[0, size * 0.15, size * 0.56]}>
              <boxGeometry args={[size * 3.8, size * 0.03, size * 0.02]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
            </mesh>
            {/* Antenna */}
            <mesh position={[size * 1.8, size * 0.8, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
              <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.5} />
            </mesh>
          </>
        )
      case 'taxi':
        return (
          <>
            {/* Standard sedan body */}
            <mesh>
              <boxGeometry args={[size * 2.2, size * 0.5, size * 1.0]} />
              <meshStandardMaterial color="#ffff00" metalness={0.7} roughness={0.4} />
            </mesh>
            {/* Cab */}
            <mesh position={[size * 0.3, size * 0.4, 0]}>
              <boxGeometry args={[size * 1.0, size * 0.35, size * 0.95]} />
              <meshStandardMaterial color="#1a1a2e" transparent opacity={0.5} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Roof sign - iconic taxi feature */}
            <mesh position={[0, size * 0.75, 0]}>
              <boxGeometry args={[size * 0.8, size * 0.2, size * 0.4]} />
              <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} metalness={0.6} />
            </mesh>
            {/* "TAXI" text box */}
            <mesh position={[0, size * 0.77, size * 0.21]}>
              <boxGeometry args={[size * 0.6, size * 0.12, size * 0.02]} />
              <meshStandardMaterial color="#000000" emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>
            {/* Checkerboard pattern on door */}
            {[-0.4, 0, 0.4].map((offset, i) => (
              <mesh key={i} position={[-size * 0.5, size * 0.25, size * 0.51]}>
                <boxGeometry args={[size * 0.15, size * 0.15, size * 0.01]} />
                <meshStandardMaterial color={i % 2 === 0 ? "#000000" : "#ffffff"} />
              </mesh>
            ))}
            {/* Meter light on roof */}
            <mesh position={[0, size * 0.88, 0]}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1.0} toneMapped={false} />
            </mesh>
          </>
        )
      case 'fire-truck':
        return (
          <>
            {/* Long fire truck body */}
            <mesh>
              <boxGeometry args={[size * 3.5, size * 1.1, size * 1.4]} />
              <meshStandardMaterial color="#cc0000" metalness={0.7} roughness={0.5} />
            </mesh>
            {/* Chrome stripe */}
            <mesh position={[0, size * 0.6, size * 0.71]}>
              <boxGeometry args={[size * 3.55, size * 0.15, size * 0.02]} />
              <meshStandardMaterial color="#cccccc" metalness={1.0} roughness={0.1} />
            </mesh>
            {/* Cab */}
            <mesh position={[size * 1.4, size * 0.4, 0]}>
              <boxGeometry args={[size * 1.0, size * 0.9, size * 1.35]} />
              <meshStandardMaterial color="#cc0000" metalness={0.7} roughness={0.5} />
            </mesh>
            {/* Equipment compartments */}
            {[-0.8, -0.2, 0.4].map((offset, i) => (
              <mesh key={i} position={[offset * size, size * 0.4, size * 0.72]}>
                <boxGeometry args={[size * 0.5, size * 0.6, size * 0.02]} />
                <meshStandardMaterial color="#880000" metalness={0.5} roughness={0.7} />
              </mesh>
            ))}
            {/* Ladder on top */}
            <mesh position={[0, size * 1.0, 0]}>
              <boxGeometry args={[size * 2.5, size * 0.1, size * 0.3]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.4} />
            </mesh>
            {/* Emergency light bar */}
            <mesh position={[size * 1.4, size * 1.0, 0]}>
              <boxGeometry args={[size * 0.9, size * 0.12, size * 0.5]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Red flashing lights */}
            {[-0.3, 0, 0.3].map((offset, i) => (
              <mesh key={i} position={[size * 1.4 + offset * size, size * 1.07, 0]}>
                <sphereGeometry args={[0.08, 6, 6]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.8} toneMapped={false} />
              </mesh>
            ))}
            {/* Water hose reel */}
            <mesh position={[-size * 1.2, size * 0.6, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.4, 12]} />
              <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.6} />
            </mesh>
          </>
        )
      case 'tow-truck':
        return (
          <>
            {/* Truck cab */}
            <mesh position={[size * 0.9, size * 0.4, 0]}>
              <boxGeometry args={[size * 1.2, size * 0.9, size * 1.2]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.6} />
            </mesh>
            {/* Flatbed base */}
            <mesh position={[-size * 0.6, size * 0.1, 0]}>
              <boxGeometry args={[size * 2.5, size * 0.3, size * 1.3]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.7} />
            </mesh>
            {/* Tow boom (crane arm) */}
            <mesh position={[-size * 1.2, size * 0.8, 0]} rotation={[0, 0, Math.PI / 3]}>
              <boxGeometry args={[size * 0.25, size * 2.0, size * 0.25]} />
              <meshStandardMaterial color="#ffaa00" metalness={0.7} roughness={0.6} />
            </mesh>
            {/* Winch mechanism */}
            <mesh position={[-size * 1.8, size * 0.3, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 0.5, 8]} />
              <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.5} />
            </mesh>
            {/* Tow hook and cable */}
            <mesh position={[-size * 2.2, size * 0.1, 0]}>
              <boxGeometry args={[size * 0.15, size * 0.25, size * 0.15]} />
              <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.4} />
            </mesh>
            {/* Hydraulic pistons */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[-size * 0.8, size * 0.4, side * size * 0.5]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.08, 0.08, size * 1.0, 6]} />
                <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.6} />
              </mesh>
            ))}
            {/* Warning beacon */}
            <mesh position={[size * 0.9, size * 1.0, 0]}>
              <sphereGeometry args={[0.15, 6, 6]} />
              <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={1.5} toneMapped={false} />
            </mesh>
          </>
        )
      case 'delivery-robot':
        return (
          <>
            {/* Compact robotic body */}
            <mesh position={[0, size * 0.4, 0]}>
              <boxGeometry args={[size * 0.9, size * 0.8, size * 0.8]} />
              <meshStandardMaterial color="#f0f0f0" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Package compartment with lid */}
            <mesh position={[0, size * 0.85, 0]}>
              <boxGeometry args={[size * 0.85, size * 0.15, size * 0.75]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.4} />
            </mesh>
            {/* Display screen/face */}
            <mesh position={[size * 0.46, size * 0.5, 0]}>
              <boxGeometry args={[size * 0.02, size * 0.3, size * 0.4]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} toneMapped={false} />
            </mesh>
            {/* Small wheels (more like rollers) */}
            {[[-0.3, -0.3], [-0.3, 0.3], [0.3, -0.3], [0.3, 0.3]].map(([x, z], i) => (
              <mesh key={i} position={[x * size, -size * 0.05, z * size]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.12, 0.12, 0.15, 8]} />
                <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.7} />
              </mesh>
            ))}
            {/* Sensor/camera on top */}
            <mesh position={[0, size * 1.0, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Camera lens */}
            <mesh position={[size * 0.12, size * 1.0, 0]}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <meshStandardMaterial color="#0000ff" emissive="#0000ff" emissiveIntensity={0.8} toneMapped={false} />
            </mesh>
            {/* Company logo plate */}
            <mesh position={[0, size * 0.45, size * 0.42]}>
              <boxGeometry args={[size * 0.4, size * 0.2, size * 0.01]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
            </mesh>
          </>
        )
      case 'garbage-truck':
        return (
          <>
            {/* Large boxy cargo body */}
            <mesh position={[-size * 0.3, size * 0.6, 0]}>
              <boxGeometry args={[size * 3.0, size * 1.3, size * 1.4]} />
              <meshStandardMaterial color="#2a4a2a" metalness={0.5} roughness={0.8} />
            </mesh>
            {/* Cab */}
            <mesh position={[size * 1.5, size * 0.4, 0]}>
              <boxGeometry args={[size * 1.0, size * 0.9, size * 1.35]} />
              <meshStandardMaterial color="#2a4a2a" metalness={0.5} roughness={0.7} />
            </mesh>
            {/* Rear compactor */}
            <mesh position={[-size * 1.9, size * 0.5, 0]}>
              <boxGeometry args={[size * 0.4, size * 1.0, size * 1.45]} />
              <meshStandardMaterial color="#1a3a1a" metalness={0.6} roughness={0.8} />
            </mesh>
            {/* Hydraulic arm */}
            <mesh position={[-size * 1.9, size * 0.3, size * 0.8]} rotation={[-Math.PI / 6, 0, 0]}>
              <boxGeometry args={[size * 0.2, size * 1.0, size * 0.2]} />
              <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.6} />
            </mesh>
            {/* Gripper claw */}
            <mesh position={[-size * 1.9, size * 0.9, size * 1.4]}>
              <boxGeometry args={[size * 0.3, size * 0.15, size * 0.3]} />
              <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.5} />
            </mesh>
            {/* Warning stripes */}
            {[-0.8, -0.2, 0.4, 1.0].map((offset, i) => (
              <mesh key={i} position={[offset * size, size * 1.25, size * 0.71]}>
                <boxGeometry args={[size * 0.4, size * 0.15, size * 0.02]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? "#ffff00" : "#000000"}
                  emissive={i % 2 === 0 ? "#ffff00" : "#000000"}
                  emissiveIntensity={0.5}
                />
              </mesh>
            ))}
            {/* Backup lights/beeper */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[-size * 2.1, size * 0.6, side * size * 0.6]}>
                <sphereGeometry args={[0.1, 6, 6]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} toneMapped={false} />
              </mesh>
            ))}
          </>
        )
      default: // car
        return (
          <>
            {/* Main body - disabled shadows for performance */}
            <mesh>
              <boxGeometry args={[size * 2, size * 0.5, size]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Windshield/cabin */}
            <mesh position={[size * 0.2, size * 0.4, 0]}>
              <boxGeometry args={[size * 0.8, size * 0.3, size * 0.9]} />
              <meshStandardMaterial
                color="#1a1a2e"
                transparent
                opacity={0.6}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </>
        )
    }
  }

  return (
    <group ref={groupRef}>
      {renderVehicle()}

      {/* WHEELS - for most vehicles (not hovercars, tanks with tracks, or delivery robots) */}
      {vehicleType !== 'hovercar' && vehicleType !== 'tank' && vehicleType !== 'bulldozer' && vehicleType !== 'delivery-robot' && (
        <>
          {vehicleType === 'motorcycle' ? (
            /* 2 wheels for motorcycle */
            <>
              {/* Front wheel */}
              <mesh position={[size * 0.9, -size * 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.18, 0.18, 0.12, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.7} />
              </mesh>
              {/* Rear wheel */}
              <mesh position={[-size * 0.8, -size * 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.18, 0.18, 0.14, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.7} />
              </mesh>
            </>
          ) : (
            /* 4 wheels for standard vehicles */
            <>
              {[[-0.8, -0.5], [-0.8, 0.5], [0.8, -0.5], [0.8, 0.5]].map(([x, z], i) => (
                <group key={i}>
                  {/* Wheel */}
                  <mesh position={[x * size, -size * 0.25, z * size]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.8} />
                  </mesh>
                  {/* Tire tread detail */}
                  <mesh position={[x * size, -size * 0.25, z * size]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.21, 0.21, 0.12, 12]} />
                    <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.9} />
                  </mesh>
                  {/* Hub cap */}
                  <mesh position={[x * size, -size * 0.25, z * size]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.02, 6]} />
                    <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.3} />
                  </mesh>
                </group>
              ))}
            </>
          )}
        </>
      )}

      {/* EXHAUST PIPE - for gas-powered vehicles */}
      {vehicleType !== 'hovercar' && vehicleType !== 'delivery-robot' && (
        <>
          {/* Exhaust pipe */}
          <mesh position={[-size * 1.1, -size * 0.15, size * 0.4]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.6} />
          </mesh>
          {/* Exhaust glow (heat effect) */}
          <mesh position={[-size * 1.25, -size * 0.15, size * 0.4]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial
              color="#ff6600"
              emissive="#ff6600"
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
        </>
      )}

      {/* SIDE MIRRORS - for street vehicles */}
      {(vehicleType === 'car' || vehicleType === 'sports-car' || vehicleType === 'police-car' ||
        vehicleType === 'van' || vehicleType === 'luxury-sedan' || vehicleType === 'taxi' ||
        vehicleType === 'limousine' || vehicleType === 'bus') && (
        <>
          {/* Left mirror */}
          <mesh position={[size * 0.6, size * 0.35, size * 0.55]}>
            <boxGeometry args={[0.08, 0.06, 0.12]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Right mirror */}
          <mesh position={[size * 0.6, size * 0.35, -size * 0.55]}>
            <boxGeometry args={[0.08, 0.06, 0.12]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
          </mesh>
        </>
      )}

      {/* ANTENNA - for various vehicles */}
      {(vehicleType === 'police-car' || vehicleType === 'taxi' || vehicleType === 'emergency-vehicle' ||
        vehicleType === 'truck' || vehicleType === 'van') && (
        <mesh position={[-size * 0.5, size * 0.6, size * 0.45]}>
          <cylinderGeometry args={[0.01, 0.01, 0.4, 6]} />
          <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.5} />
        </mesh>
      )}

      {/* LICENSE PLATES - for street-legal vehicles */}
      {(vehicleType === 'car' || vehicleType === 'sports-car' || vehicleType === 'police-car' ||
        vehicleType === 'van' || vehicleType === 'luxury-sedan' || vehicleType === 'taxi' ||
        vehicleType === 'limousine' || vehicleType === 'truck' || vehicleType === 'bus' ||
        vehicleType === 'emergency-vehicle' || vehicleType === 'cyberpunk-racer') && (
        <>
          {/* Front license plate */}
          <mesh position={[size * 1.25, size * 0.05, 0]}>
            <boxGeometry args={[0.02, 0.12, 0.25]} />
            <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.6} />
          </mesh>
          {/* Rear license plate */}
          <mesh position={[-size * 1.25, size * 0.05, 0]}>
            <boxGeometry args={[0.02, 0.12, 0.25]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.2} metalness={0.4} roughness={0.6} />
          </mesh>
        </>
      )}

      {/* Headlights - removed point lights, using emissive meshes only for performance */}
      <mesh position={[size * 1.2, size * 0.2, size * 0.3]} ref={headlightsRef}>
        <sphereGeometry args={[0.1, 4, 4]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[size * 1.2, size * 0.2, -size * 0.3]}>
        <sphereGeometry args={[0.1, 4, 4]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* Brake lights - removed point lights, using emissive meshes only */}
      <mesh position={[-size * 1.2, size * 0.2, size * 0.3]} ref={brakelightsRef}>
        <sphereGeometry args={[0.08, 4, 4]} />
        <meshBasicMaterial color="#660000" />
      </mesh>
      <mesh position={[-size * 1.2, size * 0.2, -size * 0.3]}>
        <sphereGeometry args={[0.08, 4, 4]} />
        <meshBasicMaterial color="#660000" />
      </mesh>

      {/* Underbody neon (cyberpunk style) */}
      <mesh position={[0, -size * 0.3, 0]}>
        <boxGeometry args={[size * 1.8, size * 0.05, size * 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function GroundVehicles({
  bass,
  mids,
  beatDetected,
  theme
}: GroundVehiclesProps) {
  const vehicleRefsArray = useRef<VehicleRefs[]>([])

  const vehicleData = useMemo(() => {
    const vehicles = []
    const count = 12 // Optimized for performance

    const types: Array<'car' | 'motorcycle' | 'truck' | 'sports-car' | 'hovercar' | 'bus' | 'police-car' | 'van' | 'luxury-sedan' | 'cyberpunk-racer' | 'armored-transport' | 'street-food-cart' | 'emergency-vehicle' | 'tank' | 'bulldozer' | 'crane-truck' | 'cement-mixer' | 'limousine' | 'taxi' | 'fire-truck' | 'tow-truck' | 'delivery-robot' | 'garbage-truck'> = [
      'car', 'motorcycle', 'truck', 'sports-car', 'hovercar', 'bus',
      'police-car', 'van', 'luxury-sedan', 'cyberpunk-racer',
      'armored-transport', 'street-food-cart', 'emergency-vehicle',
      'tank', 'bulldozer', 'crane-truck', 'cement-mixer',
      'limousine', 'taxi', 'fire-truck', 'tow-truck',
      'delivery-robot', 'garbage-truck'
    ]

    for (let i = 0; i < count; i++) {
      const lane = Math.floor(i / 8) // 3 lanes
      const pathRadius = 38 + lane * 5
      const speed = 0.05 + Math.random() * 0.03
      const vehicleType = types[Math.floor(Math.random() * types.length)]

      let size = 0.6 // default car size
      if (vehicleType === 'motorcycle') size = 0.4
      if (vehicleType === 'truck') size = 0.8
      if (vehicleType === 'sports-car') size = 0.55
      if (vehicleType === 'hovercar') size = 0.65
      if (vehicleType === 'bus') size = 0.7
      if (vehicleType === 'police-car') size = 0.62
      if (vehicleType === 'van') size = 0.7
      if (vehicleType === 'luxury-sedan') size = 0.65
      if (vehicleType === 'cyberpunk-racer') size = 0.58
      if (vehicleType === 'armored-transport') size = 0.75
      if (vehicleType === 'street-food-cart') size = 0.5
      if (vehicleType === 'emergency-vehicle') size = 0.7
      if (vehicleType === 'tank') size = 0.85
      if (vehicleType === 'bulldozer') size = 0.75
      if (vehicleType === 'crane-truck') size = 0.8
      if (vehicleType === 'cement-mixer') size = 0.75
      if (vehicleType === 'limousine') size = 0.6
      if (vehicleType === 'taxi') size = 0.62
      if (vehicleType === 'fire-truck') size = 0.8
      if (vehicleType === 'tow-truck') size = 0.72
      if (vehicleType === 'delivery-robot') size = 0.35
      if (vehicleType === 'garbage-truck') size = 0.8

      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary),
          new THREE.Color(theme.colors.tertiary),
          new THREE.Color('#ff0000'),
          new THREE.Color('#0000ff'),
          new THREE.Color('#ffff00')
        ]
        color = colors[Math.floor(Math.random() * colors.length)]
      } else {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ff0000', '#00ff00', '#0000ff']
        color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      }

      vehicles.push({
        pathRadius,
        pathAngle: (i / count) * Math.PI * 2,
        speed: lane % 2 === 0 ? speed : -speed, // Opposite directions per lane
        color,
        size,
        vehicleType
      })
    }

    return vehicles
  }, [theme])

  const handleVehicleMount = (index: number) => (refs: VehicleRefs) => {
    vehicleRefsArray.current[index] = refs
  }

  // Single useFrame for all vehicles
  useFrame((state) => {
    const time = state.clock.elapsedTime

    vehicleRefsArray.current.forEach((refs, index) => {
      if (!refs?.groupRef.current || !refs.headlightsRef.current || !refs.brakelightsRef.current) return

      // Speed up on beats (but don't permanently modify the speed!)
      const beatBoost = beatDetected ? 1.3 : 1.0
      const currentSpeed = refs.speed * beatBoost

      // Move along circular path
      refs.pathAngle += currentSpeed * 0.016 // ~60fps normalized

      const x = Math.cos(refs.pathAngle) * refs.pathRadius
      const z = Math.sin(refs.pathAngle) * refs.pathRadius

      refs.groupRef.current.position.set(x, 0.3, z)

      // Face direction of travel
      refs.groupRef.current.rotation.y = refs.pathAngle + (refs.speed > 0 ? Math.PI / 2 : -Math.PI / 2)

      // Random braking
      refs.brakeTimer -= 0.016
      if (refs.brakeTimer <= 0 && Math.random() > 0.98) {
        refs.isBraking = true
        refs.brakeTimer = 0.5 + Math.random() * 1.0
      }
      if (refs.brakeTimer <= 0) {
        refs.isBraking = false
        refs.brakeTimer = 2 + Math.random() * 3
      }

      // Brake lights - update material color instead of intensity
      if (refs.isBraking) {
        const brakeMat = refs.brakelightsRef.current.material as THREE.MeshBasicMaterial
        brakeMat.color.setHex(0xff0000)
      } else {
        const brakeMat = refs.brakelightsRef.current.material as THREE.MeshBasicMaterial
        brakeMat.color.setHex(0x660000)
      }

      // Headlights are always on (meshBasicMaterial)

      // Slight bounce with bass
      refs.groupRef.current.position.y = 0.3 + bass * 0.1
    })
  })

  return (
    <group>
      {vehicleData.map((vehicle, i) => (
        <GroundVehicle
          key={i}
          pathRadius={vehicle.pathRadius}
          pathAngle={vehicle.pathAngle}
          speed={vehicle.speed}
          color={vehicle.color}
          size={vehicle.size}
          vehicleType={vehicle.vehicleType}
          onMount={handleVehicleMount(i)}
        />
      ))}
    </group>
  )
}
