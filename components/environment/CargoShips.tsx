'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ColorTheme } from '@/lib/themes'

interface CargoShipsProps {
  bass: number
  mids: number
  beatDetected: boolean
  theme?: ColorTheme
}

interface ShipRefs {
  groupRef: React.RefObject<THREE.Group>
  thrustersRef: React.RefObject<THREE.Group>
  lightsRef: React.RefObject<THREE.Group>
  pathRadius: number
  pathAngle: number
  height: number
  speed: number
  hoverPhase: number
}

function CargoShip({
  pathRadius,
  pathAngle,
  height,
  speed,
  color,
  size,
  shipType,
  onMount
}: {
  pathRadius: number
  pathAngle: number
  height: number
  speed: number
  color: THREE.Color
  size: number
  shipType: 'cargo' | 'passenger-liner' | 'military-frigate' | 'shuttle' | 'yacht' | 'mining-barge' | 'research-vessel' | 'alien-cruiser' | 'stealth-fighter' | 'trade-freighter' | 'colony-transport'
  onMount: (refs: ShipRefs) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const thrustersRef = useRef<THREE.Group>(null)
  const lightsRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current && thrustersRef.current && lightsRef.current) {
      onMount({
        groupRef,
        thrustersRef,
        lightsRef,
        pathRadius,
        pathAngle,
        height,
        speed,
        hoverPhase: pathAngle
      })
    }
  }, [])

  // Render different ship designs based on type
  const renderShip = () => {
    switch (shipType) {
      case 'passenger-liner':
        return (
          <>
            {/* Streamlined hull */}
            <mesh>
              <cylinderGeometry args={[size * 1.2, size * 0.8, size * 5, 12]} />
              <meshStandardMaterial color="#e8e8ff" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Large observation windows */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = (i - 2) * size * 1.2
              return (
                <mesh key={i} position={[size * 0.6, y, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <ringGeometry args={[size * 0.3, size * 0.7, 16]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.7}
                    transparent
                    opacity={0.6}
                    toneMapped={false}
                  />
                </mesh>
              )
            })}
            {/* Observation decks */}
            <mesh position={[size * 0.8, 0, 0]}>
              <boxGeometry args={[size * 0.4, size * 4, size * 2]} />
              <meshStandardMaterial color="#1a1a2e" transparent opacity={0.5} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Luxury lighting */}
            <mesh position={[0, 0, 0]}>
              <torusGeometry args={[size * 1.1, size * 0.05, 8, 16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
            </mesh>
          </>
        )
      case 'military-frigate':
        return (
          <>
            {/* Angular armored hull */}
            <mesh>
              <boxGeometry args={[size * 5, size * 1.2, size * 2.5]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.6} />
            </mesh>
            {/* Weapons hardpoints */}
            {[-1, 0, 1].map((offset, i) => (
              <mesh key={i} position={[offset * size * 1.5, size * 0.8, 0]}>
                <cylinderGeometry args={[0.2, 0.25, 0.8, 6]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.4} />
              </mesh>
            ))}
            {/* Turrets */}
            {[-1.5, 1.5].map((offset, i) => (
              <group key={i} position={[offset * size, size * 0.6, 0]}>
                <mesh>
                  <sphereGeometry args={[0.4, 8, 8]} />
                  <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.1, 0.12, 1.2, 6]} />
                  <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            ))}
            {/* Armor plating */}
            {[-0.8, -0.3, 0.3, 0.8].map((offset, i) => (
              <mesh key={i} position={[0, offset * size, size * 1.3]}>
                <boxGeometry args={[size * 4.8, size * 0.3, size * 0.05]} />
                <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.7} />
              </mesh>
            ))}
            {/* Antenna arrays */}
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} position={[size * (i - 1.5), size * 1.0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
              </mesh>
            ))}
            {/* Red warning lights */}
            <mesh position={[size * 2.5, size * 0.7, 0]}>
              <sphereGeometry args={[0.15, 6, 6]} />
              <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} toneMapped={false} />
            </mesh>
          </>
        )
      case 'shuttle':
        return (
          <>
            {/* Compact agile body */}
            <mesh>
              <boxGeometry args={[size * 2.5, size * 0.8, size * 1.5]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Large cockpit bubble */}
            <mesh position={[size * 1.0, size * 0.5, 0]}>
              <sphereGeometry args={[size * 0.6, 8, 8]} />
              <meshStandardMaterial color="#1a1a2e" transparent opacity={0.3} metalness={1.0} roughness={0.0} />
            </mesh>
            {/* Compact wings */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[0, 0, side * size * 1.2]} rotation={[0, side * 0.2, 0]}>
                <boxGeometry args={[size * 1.5, size * 0.1, size * 0.8]} />
                <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
            {/* Small thrusters */}
            <mesh position={[-size * 1.3, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.35, 0.6, 8]} />
              <meshStandardMaterial
                color="#00aaff"
                emissive="#00aaff"
                emissiveIntensity={1.8}
                transparent
                opacity={0.7}
                toneMapped={false}
              />
            </mesh>
          </>
        )
      case 'yacht':
        return (
          <>
            {/* Elegant curved hull */}
            <mesh>
              <cylinderGeometry args={[size * 0.6, size * 0.9, size * 4, 12]} />
              <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Gold accents */}
            {[0, 1, 2].map((i) => {
              const y = (i - 1) * size * 1.3
              return (
                <mesh key={i} position={[0, y, 0]}>
                  <torusGeometry args={[size * 0.85, size * 0.03, 8, 16]} />
                  <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.8} metalness={1.0} />
                </mesh>
              )
            })}
            {/* Lounge area with large windows */}
            <mesh position={[size * 0.6, 0, 0]}>
              <boxGeometry args={[size * 0.5, size * 2.5, size * 1.5]} />
              <meshStandardMaterial color={color} transparent opacity={0.4} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Luxury deck lighting */}
            {[-1, 0, 1].map((offset, i) => (
              <mesh key={i} position={[size * 0.7, offset * size * 0.8, 0]}>
                <sphereGeometry args={[0.1, 6, 6]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
              </mesh>
            ))}
            {/* Sleek engine nacelles */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[-size * 1.8, 0, side * size * 0.7]}>
                <cylinderGeometry args={[0.25, 0.3, 0.8, 8]} />
                <meshStandardMaterial
                  color="#00ffff"
                  emissive="#00ffff"
                  emissiveIntensity={1.2}
                  transparent
                  opacity={0.8}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </>
        )
      case 'mining-barge':
        return (
          <>
            {/* Rugged industrial hull */}
            <mesh>
              <boxGeometry args={[size * 5, size * 1.5, size * 2]} />
              <meshStandardMaterial color="#4a3a2a" metalness={0.5} roughness={0.9} />
            </mesh>
            {/* Industrial drill arms */}
            {[-1, 1].map((side, i) => (
              <group key={i} position={[size * 2, 0, side * size * 1.2]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.2, 0.25, size * 2, 6]} />
                  <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.6} />
                </mesh>
                <mesh position={[size * 1.2, 0, 0]}>
                  <coneGeometry args={[0.35, 0.8, 8]} />
                  <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.6} metalness={0.8} />
                </mesh>
              </group>
            ))}
            {/* Ore containers */}
            {[-1, 0, 1].map((offset, i) => (
              <mesh key={i} position={[offset * size * 1.2, size * 1.0, 0]}>
                <boxGeometry args={[size * 1.0, size * 0.8, size * 1.8]} />
                <meshStandardMaterial color="#3a3a1a" metalness={0.4} roughness={0.8} />
              </mesh>
            ))}
            {/* Heavy spotlights */}
            {[-1.5, 1.5].map((offset, i) => (
              <mesh key={i} position={[size * 2.5, 0, offset * size * 0.5]}>
                <sphereGeometry args={[0.2, 6, 6]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.0} toneMapped={false} />
              </mesh>
            ))}
          </>
        )
      case 'research-vessel':
        return (
          <>
            {/* Modular scientific hull */}
            <mesh>
              <cylinderGeometry args={[size * 0.9, size * 0.9, size * 4, 8]} />
              <meshStandardMaterial color="#e8e8e8" metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Laboratory modules */}
            {[0, 1, 2].map((i) => {
              const angle = (i / 3) * Math.PI * 2
              return (
                <mesh key={i} position={[Math.cos(angle) * size * 1.1, 0, Math.sin(angle) * size * 1.1]}>
                  <boxGeometry args={[size * 0.8, size * 2, size * 0.8]} />
                  <meshStandardMaterial color="#d0d0ff" metalness={0.5} roughness={0.5} />
                </mesh>
              )
            })}
            {/* Sensor arrays and scanning dishes */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = (i - 2) * size * 0.9
              return (
                <group key={i} position={[size * 0.9, y, 0]}>
                  <mesh rotation={[0, Math.PI / 2, 0]}>
                    <cylinderGeometry args={[0.4, 0.3, 0.15, 12]} />
                    <meshStandardMaterial color="#2a2a3e" metalness={0.9} roughness={0.2} />
                  </mesh>
                  <mesh position={[0.1, 0, 0]}>
                    <sphereGeometry args={[0.15, 6, 6]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} toneMapped={false} />
                  </mesh>
                </group>
              )
            })}
            {/* Data transmission antenna */}
            <mesh position={[0, size * 2.3, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1.0, 6]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
            </mesh>
          </>
        )
      case 'alien-cruiser':
        return (
          <>
            {/* Asymmetric organic hull */}
            <mesh>
              <octahedronGeometry args={[size * 1.5, 1]} />
              <meshStandardMaterial color="#4a1a4a" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[size * 0.8, 0, size * 0.5]} rotation={[0, 0.5, 0.3]}>
              <boxGeometry args={[size * 2, size * 0.6, size * 1.2]} />
              <meshStandardMaterial color="#3a0a3a" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Organic curves */}
            {[0, 1, 2].map((i) => {
              const angle = (i / 3) * Math.PI * 2 + 0.5
              return (
                <mesh key={i} position={[Math.cos(angle) * size * 0.7, 0, Math.sin(angle) * size * 0.7]}>
                  <sphereGeometry args={[size * 0.4, 6, 8]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.6}
                    transparent
                    opacity={0.7}
                  />
                </mesh>
              )
            })}
            {/* Unusual propulsion - energy rings */}
            {[-1, 0, 1].map((offset, i) => (
              <mesh key={i} position={[-size * 1.5, offset * size * 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[size * 0.5, size * 0.08, 8, 12]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={1.5}
                  transparent
                  opacity={0.8}
                  toneMapped={false}
                />
              </mesh>
            ))}
            {/* Bioluminescent accents */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i / 6) * Math.PI * 2
              return (
                <mesh key={i} position={[Math.cos(angle) * size * 1.2, 0, Math.sin(angle) * size * 1.2]}>
                  <sphereGeometry args={[0.1, 4, 4]} />
                  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.0} toneMapped={false} />
                </mesh>
              )
            })}
          </>
        )
      case 'stealth-fighter':
        return (
          <>
            {/* Angular faceted design */}
            <mesh>
              <boxGeometry args={[size * 3, size * 0.4, size * 2]} />
              <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Sharp angled wings */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[0, 0, side * size * 1.5]} rotation={[0, side * 0.3, 0]}>
                <boxGeometry args={[size * 2, size * 0.1, size * 1.2]} />
                <meshStandardMaterial color="#0a0a0a" metalness={0.95} roughness={0.1} />
              </mesh>
            ))}
            {/* Minimal profile cockpit */}
            <mesh position={[size * 0.8, size * 0.3, 0]}>
              <boxGeometry args={[size * 0.6, size * 0.2, size * 0.8]} />
              <meshStandardMaterial color="#000000" transparent opacity={0.9} metalness={1.0} roughness={0.0} />
            </mesh>
            {/* Barely visible running lights */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[size * 1.5, 0, side * size]}>
                <sphereGeometry args={[0.05, 4, 4]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
              </mesh>
            ))}
            {/* Advanced tech glow - minimal */}
            <mesh position={[-size * 1.5, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 0.3, 6]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.6}
                toneMapped={false}
              />
            </mesh>
          </>
        )
      case 'trade-freighter':
        return (
          <>
            {/* Robust frame */}
            <mesh>
              <boxGeometry args={[size * 5, size * 1.2, size * 2.2]} />
              <meshStandardMaterial color="#3a3a2a" metalness={0.6} roughness={0.7} />
            </mesh>
            {/* Modular shipping containers */}
            {[0, 1, 2].map((row) =>
              [-1, 0, 1].map((col) => (
                <mesh
                  key={`${row}-${col}`}
                  position={[col * size * 1.5, size * 0.8 + row * size * 0.7, 0]}
                >
                  <boxGeometry args={[size * 1.3, size * 0.6, size * 2.0]} />
                  <meshStandardMaterial
                    color={row === 0 ? color : row === 1 ? "#ff6600" : "#ffff00"}
                    metalness={0.5}
                    roughness={0.6}
                  />
                </mesh>
              ))
            )}
            {/* Utility markings */}
            {[-2, -1, 0, 1, 2].map((offset, i) => (
              <mesh key={i} position={[offset * size, size * 0.3, size * 1.15]}>
                <boxGeometry args={[size * 0.8, size * 0.8, size * 0.02]} />
                <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
              </mesh>
            ))}
            {/* Heavy-duty thrusters */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[-size * 2.5, 0, side * size * 0.9]}>
                <cylinderGeometry args={[0.4, 0.5, 1.0, 8]} />
                <meshStandardMaterial
                  color="#ff6600"
                  emissive="#ff6600"
                  emissiveIntensity={1.5}
                  transparent
                  opacity={0.7}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </>
        )
      case 'colony-transport':
        return (
          <>
            {/* Massive cylindrical habitat */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[size * 2, size * 2, size * 6, 16]} />
              <meshStandardMaterial color="#2a2a3e" metalness={0.7} roughness={0.4} />
            </mesh>
            {/* Rotating habitat rings */}
            {[-1.5, 0, 1.5].map((offset, i) => (
              <mesh key={i} position={[offset * size, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[size * 2.2, size * 0.15, 8, 24]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.8} />
              </mesh>
            ))}
            {/* Habitat windows - many lights */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((ring) => {
              const angle = (ring / 8) * Math.PI * 2
              return [-2, -1, 0, 1, 2].map((yOffset, i) => (
                <mesh
                  key={`${ring}-${i}`}
                  position={[
                    yOffset * size * 1.2,
                    Math.cos(angle) * size * 2.05,
                    Math.sin(angle) * size * 2.05
                  ]}
                >
                  <boxGeometry args={[size * 0.3, size * 0.3, size * 0.05]} />
                  <meshStandardMaterial
                    color="#ffff80"
                    emissive="#ffff80"
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.9}
                  />
                </mesh>
              ))
            })}
            {/* Solar panels */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[0, side * size * 2.8, 0]}>
                <boxGeometry args={[size * 5, size * 0.05, size * 3]} />
                <meshStandardMaterial color="#1a1a3a" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
            {/* Main engines */}
            {[-1, 1].map((side, i) => (
              <mesh key={i} position={[-size * 3.2, 0, side * size]}>
                <cylinderGeometry args={[0.6, 0.7, 1.5, 8]} />
                <meshStandardMaterial
                  color="#00aaff"
                  emissive="#00aaff"
                  emissiveIntensity={2.0}
                  transparent
                  opacity={0.8}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </>
        )
      default: // cargo
        return (
          <>
            {/* Main hull */}
            <mesh>
              <boxGeometry args={[size * 4, size * 1, size * 2]} />
              <meshStandardMaterial color="#2a2a3e" metalness={0.9} roughness={0.3} />
            </mesh>
            {/* Cargo containers on top */}
            <mesh position={[0, size * 0.8, 0]}>
              <boxGeometry args={[size * 3.5, size * 0.6, size * 1.8]} />
              <meshStandardMaterial color={color} metalness={0.5} roughness={0.6} />
            </mesh>
            <mesh position={[0, size * 1.5, 0]}>
              <boxGeometry args={[size * 3, size * 0.6, size * 1.5]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.4} />
            </mesh>
            {/* Cockpit/bridge */}
            <mesh position={[size * 2, size * 0.3, 0]}>
              <boxGeometry args={[size * 0.8, size * 0.6, size * 1.2]} />
              <meshStandardMaterial color="#1a1a2e" transparent opacity={0.7} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Cockpit windows */}
            <mesh position={[size * 2.4, size * 0.3, 0]}>
              <planeGeometry args={[size * 0.3, size * 0.4]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
                toneMapped={false}
              />
            </mesh>
          </>
        )
    }
  }

  return (
    <group ref={groupRef}>
      {renderShip()}

      {/* Running lights */}
      <group ref={lightsRef}>
        <mesh position={[size * 2.5, size * 0.5, size]}>
          <sphereGeometry args={[0.15, 4, 4]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} toneMapped={false} />
        </mesh>
        <mesh position={[size * 2.5, size * 0.5, -size]}>
          <sphereGeometry args={[0.15, 4, 4]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} toneMapped={false} />
        </mesh>
        <mesh position={[-size, size * 0.5, 0]}>
          <sphereGeometry args={[0.1, 4, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} toneMapped={false} />
        </mesh>
      </group>

      {/* Thrusters */}
      <group ref={thrustersRef}>
        <mesh position={[-size * 1.5, -size * 0.6, size * 0.6]}>
          <cylinderGeometry args={[0.3, 0.4, 0.5, 6]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-size * 1.5, -size * 0.9, size * 0.6]}>
          <coneGeometry args={[0.4, 0.6, 6]} />
          <meshStandardMaterial
            color="#00aaff"
            emissive="#00aaff"
            emissiveIntensity={1.5}
            transparent
            opacity={0.7}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[-size * 1.5, -size * 0.6, -size * 0.6]}>
          <cylinderGeometry args={[0.3, 0.4, 0.5, 6]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-size * 1.5, -size * 0.9, -size * 0.6]}>
          <coneGeometry args={[0.4, 0.6, 6]} />
          <meshStandardMaterial
            color="#00aaff"
            emissive="#00aaff"
            emissiveIntensity={1.5}
            transparent
            opacity={0.7}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[-size * 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 1, 6]} />
          <meshStandardMaterial
            color="#ff6600"
            emissive="#ff6600"
            emissiveIntensity={2}
            transparent
            opacity={0.6}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Antenna/sensor array on top */}
      <mesh position={[size, size * 2.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 6]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[size, size * 2.7, 0]}>
        <sphereGeometry args={[0.15, 4, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function CargoShips({
  bass,
  mids,
  beatDetected,
  theme
}: CargoShipsProps) {
  const shipRefsArray = useRef<ShipRefs[]>([])

  const shipData = useMemo(() => {
    const ships = []
    const count = 5 // Large objects, keep count low

    const shipTypes: Array<'cargo' | 'passenger-liner' | 'military-frigate' | 'shuttle' | 'yacht' | 'mining-barge' | 'research-vessel' | 'alien-cruiser' | 'stealth-fighter' | 'trade-freighter' | 'colony-transport'> = [
      'cargo', 'passenger-liner', 'military-frigate', 'shuttle', 'yacht',
      'mining-barge', 'research-vessel', 'alien-cruiser', 'stealth-fighter',
      'trade-freighter', 'colony-transport'
    ]

    for (let i = 0; i < count; i++) {
      const pathRadius = 70 + i * 15
      const height = 25 + i * 8
      const speed = 0.05 + Math.random() * 0.03
      const size = 1.5 + Math.random() * 0.5
      const shipType = shipTypes[Math.floor(Math.random() * shipTypes.length)]

      let color: THREE.Color
      if (theme) {
        const colors = [
          new THREE.Color(theme.colors.primary),
          new THREE.Color(theme.colors.secondary),
          new THREE.Color(theme.colors.tertiary)
        ]
        color = colors[i % colors.length]
      } else {
        const colors = ['#00ffff', '#ff00ff', '#ffff00']
        color = new THREE.Color(colors[i % colors.length])
      }

      ships.push({
        pathRadius,
        pathAngle: (i / count) * Math.PI * 2,
        height,
        speed: i % 2 === 0 ? speed : -speed,
        color,
        size,
        shipType
      })
    }

    return ships
  }, [theme])

  const handleShipMount = (index: number) => (refs: ShipRefs) => {
    shipRefsArray.current[index] = refs
  }

  // Single useFrame for all ships
  useFrame((state) => {
    const time = state.clock.elapsedTime

    shipRefsArray.current.forEach((refs) => {
      if (!refs?.groupRef.current || !refs.thrustersRef.current || !refs.lightsRef.current) return

      // Move along circular path
      refs.pathAngle += refs.speed * 0.016

      const x = Math.cos(refs.pathAngle) * refs.pathRadius
      const z = Math.sin(refs.pathAngle) * refs.pathRadius

      // Gentle hover oscillation
      const hoverBob = Math.sin(time * 0.5 + refs.hoverPhase) * 1.5

      // Bass makes ships bob more
      const bassBob = bass * 2

      const y = refs.height + hoverBob + bassBob

      refs.groupRef.current.position.set(x, y, z)

      // Face direction of travel
      refs.groupRef.current.rotation.y = refs.pathAngle + (refs.speed > 0 ? Math.PI / 2 : -Math.PI / 2)

      // Slight tilt based on movement
      refs.groupRef.current.rotation.z = Math.sin(time * 0.3 + refs.hoverPhase) * 0.05

      // Thruster pulse with mids
      const thrusterIntensity = 1.5 + mids * 1.0 + Math.sin(time * 4) * 0.3
      refs.thrustersRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          if (child.material.emissive) {
            child.material.emissiveIntensity = thrusterIntensity
          }
        }
      })

      // Lights flicker on beat
      if (beatDetected) {
        refs.lightsRef.current.scale.setScalar(1.3)
      } else {
        refs.lightsRef.current.scale.setScalar(1.0)
      }
    })
  })

  return (
    <group>
      {shipData.map((ship, i) => (
        <CargoShip
          key={i}
          pathRadius={ship.pathRadius}
          pathAngle={ship.pathAngle}
          height={ship.height}
          speed={ship.speed}
          color={ship.color}
          size={ship.size}
          shipType={ship.shipType}
          onMount={handleShipMount(i)}
        />
      ))}
    </group>
  )
}
