/**
 * Neon Pulse Shader
 * Animated glowing neon effect for signs, accents, and decorative elements
 * Features: pulsing glow, electric flicker, audio reactivity, customizable color
 */

export const neonPulseShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 neonColor;
    uniform float time;
    uniform float pulseSpeed;
    uniform float pulseIntensity;
    uniform float audioReactivity;
    uniform float flickerAmount;
    uniform float glowWidth;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Noise function for flicker effect
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    float noise(float t) {
      return random(vec2(t, t * 0.1));
    }

    void main() {
      // Main pulse animation
      float pulse = sin(time * pulseSpeed) * 0.5 + 0.5;
      pulse = pow(pulse, 2.0); // Sharpen the pulse

      // Audio reactive pulse
      float audioPulse = sin(time * 8.0) * audioReactivity;

      // Electric flicker
      float flicker = noise(time * 20.0) * flickerAmount;
      flicker = mix(1.0, flicker, 0.15); // Subtle flicker

      // Combine all intensity modifiers
      float intensity = (1.0 + pulse * pulseIntensity + audioPulse) * flicker;

      // Edge glow based on UV distance from center
      float distFromCenter = length(vUv - 0.5) * 2.0;
      float edgeGlow = 1.0 - smoothstep(1.0 - glowWidth, 1.0, distFromCenter);

      // Core glow (brighter in the center)
      float coreGlow = 1.0 - distFromCenter;
      coreGlow = pow(coreGlow, 3.0);

      // Combine glows
      vec3 finalColor = neonColor * intensity;
      finalColor += neonColor * edgeGlow * 0.5;
      finalColor += neonColor * coreGlow * 2.0;

      // Add extra bright spots for "hot spots"
      float hotSpot = pow(sin(vUv.x * 10.0 + time) * 0.5 + 0.5, 8.0);
      finalColor += neonColor * hotSpot * 0.3;

      // Emissive boost
      float emissive = intensity * 2.0;

      gl_FragColor = vec4(finalColor * emissive, 1.0);
    }
  `,
}
