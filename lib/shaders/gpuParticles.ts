/**
 * GPU Particle Shader
 * High-performance particle system rendered entirely on GPU
 * Features: instanced rendering, custom shapes, trails, audio reactivity
 */

export const gpuParticleShader = {
  vertexShader: `
    uniform float time;
    uniform float audioReactivity;
    uniform vec3 particleColor1;
    uniform vec3 particleColor2;

    attribute vec3 particlePosition;
    attribute vec3 particleVelocity;
    attribute float particleSize;
    attribute float particleLife;
    attribute float particleId;

    varying vec3 vColor;
    varying float vLife;
    varying vec2 vUv;

    // Noise for particle movement
    float hash(float n) {
      return fract(sin(n) * 43758.5453123);
    }

    void main() {
      vUv = uv;
      vLife = particleLife;

      // Animate particle position
      vec3 pos = particlePosition;
      pos += particleVelocity * time;

      // Add turbulence
      float turbulence = hash(particleId + time * 0.1) * 2.0 - 1.0;
      pos.x += sin(time + particleId) * turbulence * 0.5;
      pos.z += cos(time + particleId * 0.5) * turbulence * 0.5;

      // Audio reactive movement
      pos.y += sin(time * 2.0 + particleId) * audioReactivity * 0.5;

      // Color based on life and audio
      float colorMix = particleLife + audioReactivity * 0.3;
      vColor = mix(particleColor1, particleColor2, colorMix);

      // Size based on life (fade in/out)
      float sizeFactor = smoothstep(0.0, 0.2, particleLife) *
                         smoothstep(1.0, 0.8, particleLife);
      float finalSize = particleSize * sizeFactor * (1.0 + audioReactivity * 0.5);

      // Transform to clip space
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Point size with distance attenuation
      gl_PointSize = finalSize * (300.0 / -mvPosition.z);
    }
  `,

  fragmentShader: `
    uniform vec3 particleColor1;
    uniform vec3 particleColor2;
    uniform float glowIntensity;
    uniform float softness;

    varying vec3 vColor;
    varying float vLife;
    varying vec2 vUv;

    void main() {
      // Distance from center of point sprite
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);

      // Soft circular particle with glow
      float circle = 1.0 - smoothstep(0.5 - softness, 0.5, dist);

      // Glow halo
      float glow = exp(-dist * 8.0) * glowIntensity;

      // Combine circle and glow
      float alpha = circle + glow;

      // Life-based fade
      alpha *= vLife;

      // Discard fully transparent fragments
      if (alpha < 0.01) discard;

      // Add brightness to center
      vec3 finalColor = vColor * (1.0 + glow);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
}
