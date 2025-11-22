/**
 * Tron Glow Shader
 * Creates the iconic Tron effect with glowing edges, digital grid patterns, and fresnel rim lighting
 * Features: edge glow, scanlines, grid texture, audio reactivity
 */

export const tronGlowShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vPosition = position;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform vec3 glowColor;
    uniform float time;
    uniform float audioIntensity;
    uniform float glowIntensity;
    uniform float gridScale;
    uniform float scanlineSpeed;
    uniform float fresnelPower;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;

    // Digital grid pattern
    float gridPattern(vec2 uv, float scale) {
      vec2 grid = fract(uv * scale);
      float lineWidth = 0.05;

      float xLine = step(1.0 - lineWidth, grid.x);
      float yLine = step(1.0 - lineWidth, grid.y);

      return max(xLine, yLine);
    }

    // Scanline effect
    float scanline(vec2 uv, float time, float speed) {
      float line = sin((uv.y + time * speed) * 50.0);
      return smoothstep(0.0, 0.1, line) * 0.3;
    }

    // Fresnel effect for rim lighting
    float fresnel(vec3 viewDirection, vec3 normal, float power) {
      float fresnelFactor = dot(viewDirection, normal);
      fresnelFactor = clamp(1.0 - fresnelFactor, 0.0, 1.0);
      return pow(fresnelFactor, power);
    }

    void main() {
      // View direction for fresnel
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel rim lighting (glowing edges)
      float fresnelEffect = fresnel(viewDir, vNormal, fresnelPower);

      // Digital grid overlay
      float grid = gridPattern(vUv, gridScale);

      // Animated scanlines
      float scanlines = scanline(vUv, time, scanlineSpeed);

      // Audio reactive pulse
      float audioPulse = sin(time * 8.0) * audioIntensity * 0.5 + 0.5;

      // Combine effects
      float totalGlow = fresnelEffect * glowIntensity;
      totalGlow += grid * 0.5;
      totalGlow += scanlines;
      totalGlow *= (1.0 + audioPulse);

      // Core color with glow
      vec3 finalColor = glowColor * totalGlow;

      // Extra edge brightness
      finalColor += glowColor * fresnelEffect * 2.0;

      // Digital "hot spots" that travel along edges
      float hotSpot = sin(vUv.x * 3.14159 + time * 2.0) * 0.5 + 0.5;
      hotSpot = pow(hotSpot, 10.0) * fresnelEffect;
      finalColor += glowColor * hotSpot * 3.0;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
}
