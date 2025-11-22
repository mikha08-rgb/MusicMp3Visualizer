/**
 * Holographic Glass Shader
 * Creates iridescent, fresnel-based glass effect for futuristic buildings
 * Features: edge glow, rainbow iridescence, transparency, audio reactivity
 */

export const holographicGlassShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);

      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform float time;
    uniform float audioReactivity;
    uniform float fresnelPower;
    uniform float opacity;
    uniform float iridescenceStrength;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    // Smooth noise function for iridescence
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      // Fresnel effect (edges glow more)
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), fresnelPower);

      // Iridescence based on view angle and position
      float iridescence = abs(dot(viewDir, vNormal));

      // Create rainbow shift based on position and time
      float shift = vWorldPosition.y * 0.05 + time * 0.2;

      // Blend three colors for iridescence effect
      vec3 iridColor = mix(color1, color2, sin(shift + iridescence * 3.14159) * 0.5 + 0.5);
      iridColor = mix(iridColor, color3, cos(shift * 1.3 + iridescence * 6.28) * 0.5 + 0.5);

      // Add subtle scanlines
      float scanline = sin(vWorldPosition.y * 50.0 + time * 2.0) * 0.05 + 0.95;

      // Audio reactivity adds intensity pulses
      float pulse = sin(time * 3.0) * audioReactivity * 0.3;

      // Combine effects
      vec3 finalColor = iridColor * (1.0 + fresnel * 0.5);
      finalColor *= scanline;
      finalColor += fresnel * iridColor * (iridescenceStrength + pulse);

      // Add glow at edges
      float edgeGlow = pow(fresnel, 3.0) * (1.0 + pulse);
      finalColor += edgeGlow * iridColor * 0.5;

      float finalOpacity = opacity * (0.3 + fresnel * 0.4);

      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `,
}
