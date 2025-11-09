export const vertexShader = `
  uniform float uTime;
  uniform float uBaseRadius;
  uniform float uNoiseFrequency;
  uniform float uNoiseAmplitude;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform vec2 uPointerVelocity;

  attribute float aSeed;

  varying float vFresnel;
  varying float vDepth;
  varying float vPointer;

  vec3 hash3(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
  }

  float smoothNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = smoothstep(0.0, 1.0, fract(p));
    float n = 0.0;
    for (int x = 0; x <= 1; x++) {
      for (int y = 0; y <= 1; y++) {
        for (int z = 0; z <= 1; z++) {
          vec3 corner = vec3(float(x), float(y), float(z));
          vec3 grad = hash3(i + corner);
          vec3 diff = (p - i) - corner;
          float weight = dot(grad, diff);
          float fadeX = mix(1.0 - f.x, f.x, float(x));
          float fadeY = mix(1.0 - f.y, f.y, float(y));
          float fadeZ = mix(1.0 - f.z, f.z, float(z));
          n += weight * fadeX * fadeY * fadeZ;
        }
      }
    }
    return n;
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.55;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
      value += amplitude * smoothNoise(p * frequency);
      frequency *= 1.9;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 dir = normalize(position);
    float t = uTime * 0.6 + aSeed * 0.7;
    float baseNoise = fbm(dir * uNoiseFrequency + t);
    float detailNoise = fbm(dir * (uNoiseFrequency * 2.7) - t * 1.2);
    float displacement = (baseNoise * 0.65 + detailNoise * 0.35) * uNoiseAmplitude;

    vec2 projected = dir.xy;
    vec2 toPointer = projected - uPointer;
    float pointerFalloff = exp(-dot(toPointer, toPointer) * (3.8 + uPointerStrength * 6.5));
    float swirl = (uPointerVelocity.x * toPointer.y - uPointerVelocity.y * toPointer.x) * 0.18;
    displacement += pointerFalloff * (uPointerStrength * 0.45 + swirl);

    float radius = uBaseRadius * (1.0 + displacement);
    vec3 displaced = dir * radius;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float size = (32.0 + uPointerStrength * 18.0) * radius / max(0.0001, -mvPosition.z);
    gl_PointSize = clamp(size, 1.4, 6.4);

    vec3 normal = normalize(normalMatrix * dir);
    vFresnel = pow(1.0 - max(0.0, dot(normal, vec3(0.0, 0.0, 1.0))), 1.6);
    vDepth = smoothstep(0.0, 1.0, radius / (uBaseRadius * 1.4));
    vPointer = pointerFalloff;
  }
`;

export const fragmentShader = `
  varying float vFresnel;
  varying float vDepth;
  varying float vPointer;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;

    float falloff = exp(-r2 * 1.9);
    vec3 base = mix(vec3(0.58, 0.62, 0.80), vec3(0.94, 0.97, 1.0), vDepth);
    vec3 rim = vec3(1.0, 0.97, 0.90) * vFresnel * 0.7;
    vec3 highlight = vec3(1.0, 0.96, 0.88) * vPointer * 0.9;

    vec3 color = base + rim + highlight;
    float alpha = falloff * (0.65 + vDepth * 0.35 + vPointer * 0.25);

    gl_FragColor = vec4(color, alpha);
  }
`;
