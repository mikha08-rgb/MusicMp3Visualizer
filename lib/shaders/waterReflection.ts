/**
 * Water/Puddle Reflection Shader
 * Realistic water surface with reflections, ripples, and distortion
 * Features: real-time reflections, wave animation, rain ripples, audio reactivity
 */

export const waterReflectionShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec4 vScreenPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);

      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      vScreenPosition = gl_Position;
    }
  `,

  fragmentShader: `
    uniform vec3 waterColor;
    uniform vec3 reflectionTint;
    uniform float time;
    uniform float waveSpeed;
    uniform float waveAmplitude;
    uniform float rippleFrequency;
    uniform float audioReactivity;
    uniform float reflectionStrength;
    uniform sampler2D environmentMap;

    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec4 vScreenPosition;

    // 2D noise function
    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    float noise2D(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(
        mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    void main() {
      // Animated waves
      vec2 waveUv = vUv * rippleFrequency;
      float wave1 = noise2D(waveUv + time * waveSpeed);
      float wave2 = noise2D(waveUv * 1.5 - time * waveSpeed * 0.7);
      float wave3 = noise2D(waveUv * 2.3 + time * waveSpeed * 0.5);

      float waves = (wave1 + wave2 * 0.5 + wave3 * 0.25) / 1.75;
      waves *= waveAmplitude;

      // Rain ripples (circular patterns)
      vec2 ripplePos1 = vWorldPosition.xz * 0.5 + vec2(time * 0.3, 0.0);
      vec2 ripplePos2 = vWorldPosition.xz * 0.7 - vec2(0.0, time * 0.4);
      float ripple1 = sin(length(fract(ripplePos1) - 0.5) * 20.0 - time * 5.0);
      float ripple2 = sin(length(fract(ripplePos2) - 0.5) * 15.0 - time * 4.0);

      float ripples = (ripple1 + ripple2) * 0.05;

      // Audio reactive waves
      float audioWaves = sin(vWorldPosition.x * 2.0 + time * 3.0) *
                         cos(vWorldPosition.z * 2.0 + time * 2.0) *
                         audioReactivity * 0.1;

      // Combine all wave effects
      float totalDistortion = waves + ripples + audioWaves;

      // Distorted UV for reflection sampling
      vec2 distortedUv = vUv + totalDistortion * 0.1;

      // Calculate screen space UV for reflection
      vec2 screenUv = (vScreenPosition.xy / vScreenPosition.w) * 0.5 + 0.5;
      screenUv += totalDistortion * 0.05;

      // Fake reflection (inverted and tinted)
      vec3 reflection = reflectionTint * (0.5 + totalDistortion * 0.5);

      // Fresnel for reflection intensity
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);

      // Mix water color and reflection
      vec3 finalColor = mix(waterColor, reflection, fresnel * reflectionStrength);

      // Add specular highlights
      float specular = pow(max(0.0, waves), 8.0);
      finalColor += specular * 0.3;

      // Add subtle transparency
      float alpha = 0.7 + fresnel * 0.3;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
}
