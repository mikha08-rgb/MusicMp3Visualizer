/**
 * Scanlines Shader
 * Creates horizontal scanlines that sweep across surfaces for a Tron-style digital effect
 * Features: animated sweeps, variable density, audio reactivity, color modulation
 */

export const scanlinesShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 lineColor;
    uniform float time;
    uniform float density;
    uniform float speed;
    uniform float intensity;
    uniform float audioReactivity;

    varying vec2 vUv;
    varying vec3 vPosition;

    // Smooth scanline pattern
    float scanlinePattern(float y, float density, float time, float speed) {
      // Moving scanline
      float sweep = fract((y + time * speed) * density);
      float line = smoothstep(0.0, 0.1, sweep) * smoothstep(1.0, 0.9, sweep);

      return line;
    }

    // Secondary slower sweep for depth
    float secondarySweep(float y, float time) {
      float sweep = sin((y + time * 0.5) * 3.14159 * 2.0) * 0.5 + 0.5;
      return pow(sweep, 3.0);
    }

    void main() {
      // Primary scanlines
      float scanlines = scanlinePattern(vUv.y, density, time, speed);

      // Secondary sweep for depth
      float sweep = secondarySweep(vUv.y, time);

      // Audio reactive pulse
      float audioPulse = sin(time * 10.0) * audioReactivity * 0.3 + 0.7;

      // Combine effects
      float totalIntensity = (scanlines + sweep * 0.3) * intensity * audioPulse;

      // Add horizontal line accent
      float horizontalLine = smoothstep(0.49, 0.5, vUv.y) * smoothstep(0.51, 0.5, vUv.y);
      totalIntensity += horizontalLine * 0.5;

      // Color output
      vec3 finalColor = lineColor * totalIntensity;

      // Add bright spot at scanline intersection
      float brightSpot = scanlines * sweep * 2.0;
      finalColor += lineColor * brightSpot;

      gl_FragColor = vec4(finalColor, totalIntensity);
    }
  `,
}
