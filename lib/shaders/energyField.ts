/**
 * Energy Field Shader
 * Sci-fi force field effect with hexagonal patterns and electric arcs
 * Features: hexagon grid, impact ripples, audio reactivity, color shifting
 */

export const energyFieldShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);

      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 fieldColor;
    uniform vec3 accentColor;
    uniform float time;
    uniform float hexSize;
    uniform float hexThickness;
    uniform float audioReactivity;
    uniform float flowSpeed;
    uniform float impactX;
    uniform float impactY;
    uniform float impactZ;

    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    #define PI 3.14159265359

    // Hexagon distance function
    float hexDist(vec2 p) {
      p = abs(p);
      float c = dot(p, normalize(vec2(1.0, 1.73)));
      c = max(c, p.x);
      return c;
    }

    // Hexagonal grid pattern
    vec4 hexagonGrid(vec2 p, float size) {
      vec2 grid = vec2(0.866, 1.5) * size;

      // Main hexagon
      vec2 p1 = mod(p, grid) - grid * 0.5;

      // Offset hexagon
      vec2 p2 = mod(p + grid * 0.5, grid) - grid * 0.5;

      float d1 = hexDist(p1);
      float d2 = hexDist(p2);

      float dist = min(d1, d2);
      vec2 center = d1 < d2 ? p1 : p2;

      return vec4(center, dist, 0.0);
    }

    void main() {
      // World space coordinates for consistent sizing
      vec2 coords = vWorldPosition.xz + vWorldPosition.xy;

      // Animated hexagon grid
      vec4 hex = hexagonGrid(coords + time * flowSpeed, hexSize);
      float hexPattern = smoothstep(hexThickness, hexThickness + 0.02, hex.z);

      // Electric arcs within hexagons
      float arcPattern = sin(hex.x * 20.0 + time * 5.0) * cos(hex.y * 20.0 - time * 4.0);
      arcPattern = smoothstep(0.7, 1.0, arcPattern);

      // Impact ripple effect
      vec3 impactPos = vec3(impactX, impactY, impactZ);
      float distFromImpact = length(vWorldPosition - impactPos);
      float ripple = sin(distFromImpact * 5.0 - time * 10.0) *
                     exp(-distFromImpact * 0.5);
      ripple = max(0.0, ripple);

      // Audio reactive energy flow
      float audioFlow = sin(hex.x * 2.0 + time * 3.0 + audioReactivity * PI) *
                        cos(hex.y * 2.0 - time * 2.0) * 0.5 + 0.5;

      // Fresnel edge glow
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);

      // Combine patterns
      float intensity = (1.0 - hexPattern) + arcPattern * 0.5 + ripple;
      intensity += audioFlow * audioReactivity * 0.3;

      // Color mixing
      vec3 finalColor = mix(fieldColor, accentColor, arcPattern);
      finalColor += accentColor * ripple * 2.0;
      finalColor *= intensity;

      // Edge glow
      finalColor += fresnel * fieldColor * 1.5;

      // Opacity based on patterns
      float alpha = (1.0 - hexPattern) * 0.3 + arcPattern * 0.5 + ripple * 0.8 + fresnel * 0.4;
      alpha = clamp(alpha, 0.0, 0.9);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
}
