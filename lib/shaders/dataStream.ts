/**
 * Data Stream Shader
 * Creates flowing data particle streams with glyphs and digital effects
 * Features: flowing particles, digital glyphs, varying speeds, audio reactivity
 */

export const dataStreamShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vIntensity;

    uniform float time;
    uniform float flowSpeed;

    void main() {
      vUv = uv;
      vPosition = position;

      // Add some movement intensity based on position
      vIntensity = sin(position.y * 0.1 + time * flowSpeed) * 0.5 + 0.5;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 streamColor;
    uniform float time;
    uniform float flowSpeed;
    uniform float audioIntensity;
    uniform float density;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vIntensity;

    // Random function for digital noise
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    // Digital glyph pattern
    float glyphPattern(vec2 uv, float time) {
      vec2 glyphUv = fract(uv * density);
      float glyphId = random(floor(uv * density));

      // Create binary-like glyphs (0s and 1s)
      float glyph = step(0.5, random(glyphUv + time * 0.1));

      // Only show some glyphs
      glyph *= step(0.7, glyphId);

      return glyph;
    }

    // Data particle stream
    float dataParticles(vec2 uv, float time, float speed) {
      // Flowing particles
      float flow = fract(uv.y + time * speed);
      float particle = smoothstep(0.0, 0.05, flow) * smoothstep(1.0, 0.95, flow);

      // Add some horizontal variation
      float xOffset = sin(uv.y * 10.0 + time * 2.0) * 0.1;
      float xFade = 1.0 - abs(uv.x - 0.5 - xOffset) * 2.0;
      xFade = clamp(xFade, 0.0, 1.0);

      return particle * xFade;
    }

    // Scanlines for digital effect
    float scanlines(float y, float time) {
      return sin(y * 50.0 + time * 10.0) * 0.1 + 0.9;
    }

    void main() {
      // Flowing data particles
      float particles = dataParticles(vUv, time, flowSpeed);

      // Digital glyphs
      float glyphs = glyphPattern(vUv, time);

      // Scanlines
      float scanline = scanlines(vUv.y, time);

      // Audio reactive pulse
      float audioPulse = sin(time * 8.0) * audioIntensity * 0.4 + 0.6;

      // Vertical fade (fade at top and bottom)
      float verticalFade = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

      // Combine effects
      float totalIntensity = particles * 2.0;
      totalIntensity += glyphs * 0.5;
      totalIntensity *= scanline;
      totalIntensity *= audioPulse;
      totalIntensity *= verticalFade;
      totalIntensity *= vIntensity;

      // Color output
      vec3 finalColor = streamColor * totalIntensity;

      // Add bright spots to particles
      finalColor += streamColor * particles * 2.0;

      // Glyph highlights
      finalColor += streamColor * glyphs * audioPulse;

      gl_FragColor = vec4(finalColor, totalIntensity);
    }
  `,
}
