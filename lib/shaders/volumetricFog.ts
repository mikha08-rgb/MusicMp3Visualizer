/**
 * Volumetric Fog Shader
 * Raymarched volumetric fog with light scattering and density variation
 * Features: light shafts, depth-based density, color tinting, audio reactivity
 */

export const volumetricFogShader = {
  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;

      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = mvPosition.xyz;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform vec3 fogColor;
    uniform vec3 lightPosition;
    uniform vec3 lightColor;
    uniform float time;
    uniform float density;
    uniform float audioReactivity;
    uniform float lightIntensity;
    uniform int marchSteps;
    uniform float marchDistance;

    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    // 3D noise function
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    float noise3D(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      return mix(
        mix(
          mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
          mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x),
          f.y
        ),
        mix(
          mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
          mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x),
          f.y
        ),
        f.z
      );
    }

    // Fractional Brownian Motion for more complex noise
    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for (int i = 0; i < 4; i++) {
        value += amplitude * noise3D(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }

      return value;
    }

    // Calculate fog density at a point
    float getFogDensity(vec3 pos) {
      // Base noise
      float noise = fbm(pos * 0.5 + vec3(time * 0.1, 0.0, 0.0));

      // Audio reactive density variation
      float audioDensity = sin(pos.y * 2.0 + time + audioReactivity * 3.14159) * 0.3 + 0.7;

      // Height-based density (denser at bottom)
      float heightFactor = exp(-pos.y * 0.05);

      return noise * density * audioDensity * heightFactor;
    }

    // Calculate light scattering
    float getLightScatter(vec3 pos, vec3 rayDir) {
      vec3 toLight = normalize(lightPosition - pos);
      float alignment = max(0.0, dot(rayDir, toLight));

      // Henyey-Greenstein phase function for more realistic scattering
      float g = 0.6; // Anisotropy factor
      float g2 = g * g;
      float scatter = (1.0 - g2) / pow(1.0 + g2 - 2.0 * g * alignment, 1.5);

      return scatter / (4.0 * 3.14159);
    }

    void main() {
      // Ray marching setup
      vec3 rayOrigin = cameraPosition;
      vec3 rayDir = normalize(vWorldPosition - cameraPosition);

      // March through volume
      float totalDensity = 0.0;
      vec3 scatteredLight = vec3(0.0);

      float stepSize = marchDistance / float(marchSteps);

      for (int i = 0; i < 32; i++) {
        if (i >= marchSteps) break;

        float t = float(i) * stepSize;
        vec3 pos = rayOrigin + rayDir * t;

        // Sample density
        float density = getFogDensity(pos);

        if (density > 0.01) {
          // Calculate light contribution
          float distToLight = length(lightPosition - pos);
          float attenuation = 1.0 / (1.0 + distToLight * distToLight * 0.01);

          float scatter = getLightScatter(pos, rayDir);

          // Accumulate scattering
          vec3 lightContribution = lightColor * lightIntensity * scatter * attenuation;
          scatteredLight += lightContribution * density * stepSize;

          // Accumulate density
          totalDensity += density * stepSize;
        }

        // Early exit if too dense
        if (totalDensity > 1.0) break;
      }

      // Combine fog color and scattered light
      vec3 finalColor = mix(fogColor, scatteredLight, min(totalDensity, 1.0));

      // Apply exponential fog absorption
      float absorption = exp(-totalDensity);
      float alpha = 1.0 - absorption;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
}
