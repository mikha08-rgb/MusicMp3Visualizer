/**
 * Energy Barrier Shader
 * Creates Tron-style energy barriers with hexagonal patterns and edge glow
 * Features: hexagonal grid, fresnel rim, pulsing energy, audio reactivity
 */

export const energyBarrierShader = {
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
    uniform vec3 barrierColor;
    uniform float time;
    uniform float audioIntensity;
    uniform float opacity;
    uniform float hexagonScale;
    uniform float pulseSpeed;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;

    // Hexagonal pattern
    float hexagonPattern(vec2 uv, float scale) {
      // Convert to hexagonal coordinates
      vec2 r = vec2(1.0, 1.73205080757);
      vec2 h = r * scale;
      vec2 a = mod(uv, h) - h * 0.5;
      vec2 b = mod(uv - h * 0.5, h) - h * 0.5;

      vec2 gv = length(a) < length(b) ? a : b;
      float hexDist = length(gv);

      // Create hexagon edges
      float hexEdge = smoothstep(0.4, 0.35, hexDist / scale);
      return hexEdge;
    }

    // Fresnel effect for rim glow
    float fresnel(vec3 viewDirection, vec3 normal, float power) {
      float fresnelFactor = dot(viewDirection, normal);
      fresnelFactor = clamp(1.0 - fresnelFactor, 0.0, 1.0);
      return pow(fresnelFactor, power);
    }

    // Energy pulse traveling up the barrier
    float energyPulse(float y, float time, float speed) {
      float pulse = fract(y * 0.5 + time * speed);
      return smoothstep(0.0, 0.1, pulse) * smoothstep(1.0, 0.8, pulse);
    }

    void main() {
      // View direction for fresnel
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel rim lighting
      float fresnelEffect = fresnel(viewDir, vNormal, 2.5);

      // Hexagonal grid pattern
      float hexagons = hexagonPattern(vUv * 10.0, hexagonScale);

      // Energy pulse traveling vertically
      float pulse = energyPulse(vUv.y, time, pulseSpeed);

      // Audio reactive flicker
      float audioPulse = sin(time * 15.0) * audioIntensity * 0.3 + 0.7;

      // Combine effects
      float totalIntensity = hexagons * 0.4;
      totalIntensity += fresnelEffect * 1.5;
      totalIntensity += pulse * 0.6;
      totalIntensity *= audioPulse;

      // Color output
      vec3 finalColor = barrierColor * totalIntensity;

      // Extra edge brightness
      finalColor += barrierColor * fresnelEffect * 2.0;

      // Add bright spots where hexagons meet
      float hexGlow = hexagons * fresnelEffect * 3.0;
      finalColor += barrierColor * hexGlow;

      // Scanline overlay
      float scanline = sin(vUv.y * 100.0 + time * 5.0) * 0.1 + 0.9;
      finalColor *= scanline;

      float finalOpacity = (totalIntensity + fresnelEffect) * opacity;

      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `,
}
