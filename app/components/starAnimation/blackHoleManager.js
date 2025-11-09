import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders";
import {
  BLACK_HOLE_PARTICLE_COUNT,
  BLACK_HOLE_NOISE_FREQ,
  BLACK_HOLE_NOISE_AMPLITUDE,
  BLACK_HOLE_GRAVITY_STRENGTH,
  BLACK_HOLE_SPIRAL_STRENGTH,
  FADE_START_MULTIPLIER,
  MAX_EXCITEMENT_SCALE,
  POINTER_STIFFNESS_ACTIVE,
  POINTER_STIFFNESS_INACTIVE,
  POINTER_DAMPING,
  POINTER_INFLUENCE_RADIUS_MULTIPLIER,
  POINTER_STRENGTH_MAX,
} from "./constants";
import {
  computeBaseRadius,
  clampPointerCoordinate,
  interpolateValue,
} from "./utils";

export class BlackHoleManager {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.pointCloud = null;
    this.pointUniforms = null;
    this.clock = new THREE.Clock();
    this.pointerStrength = 0;
    this.pointerStrengthVelocity = 0;
    this.pointerTarget = new THREE.Vector2();
    this.pointerVelocityTarget = new THREE.Vector2();
  }

  init(container, width, height, ratio) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    Object.assign(this.renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    });

    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 10);
    this.camera.position.set(0, 0, 1.6);
    this.scene.add(this.camera);

    this.setupLighting();
    this.createPointCloud(width, height);
  }

  setupLighting() {
    this.scene.add(new THREE.AmbientLight(0x10182c, 0.8));

    const keyLight = new THREE.DirectionalLight(0x4a5ca0, 1.25);
    keyLight.position.set(1.8, 2.1, 2.8);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x030408, 0.85);
    rimLight.position.set(-1.6, -1.2, -2.2);
    this.scene.add(rimLight);
  }

  createPointCloud(width, height) {
    const positions = new Float32Array(BLACK_HOLE_PARTICLE_COUNT * 3);
    const seeds = new Float32Array(BLACK_HOLE_PARTICLE_COUNT);
    const dir = new THREE.Vector3();

    for (let i = 0; i < BLACK_HOLE_PARTICLE_COUNT; i += 1) {
      dir.set(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      );
      dir.normalize();

      positions[i * 3] = dir.x;
      positions[i * 3 + 1] = dir.y;
      positions[i * 3 + 2] = dir.z;
      seeds[i] = Math.random() * 64;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    this.pointUniforms = {
      uTime: { value: 0 },
      uBaseRadius: { value: computeBaseRadius(width, height) },
      uNoiseFrequency: { value: BLACK_HOLE_NOISE_FREQ },
      uNoiseAmplitude: { value: BLACK_HOLE_NOISE_AMPLITUDE },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uPointerVelocity: { value: new THREE.Vector2(0, 0) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.pointUniforms,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      vertexShader,
      fragmentShader,
    });

    this.pointCloud = new THREE.Points(geometry, material);
    this.pointCloud.frustumCulled = false;
    this.scene.add(this.pointCloud);
  }

  updatePointer(delta, width, height, pointerState) {
    const pointerX = pointerState.active
      ? clampPointerCoordinate((pointerState.x / width) * 2 - 1)
      : 0;
    const pointerY = pointerState.active
      ? clampPointerCoordinate((pointerState.y / height) * -2 + 1)
      : 0;

    this.pointerTarget.set(pointerX, pointerY);
    this.pointUniforms.uPointer.value.lerp(
      this.pointerTarget,
      1 - Math.exp(-delta * 12)
    );

    const pointerVelocityX = pointerState.active
      ? THREE.MathUtils.clamp(pointerState.vx / Math.max(width, 1), -1.5, 1.5)
      : 0;
    const pointerVelocityY = pointerState.active
      ? THREE.MathUtils.clamp(-pointerState.vy / Math.max(height, 1), -1.5, 1.5)
      : 0;

    this.pointerVelocityTarget.set(pointerVelocityX, pointerVelocityY);
    this.pointUniforms.uPointerVelocity.value.lerp(
      this.pointerVelocityTarget,
      1 - Math.exp(-delta * 10)
    );
  }

  updateStrength(delta, width, height, pointerState) {
    const pointerDistance = Math.hypot(
      pointerState.x - width / 2,
      pointerState.y - height / 2
    );
    const influenceRadius =
      Math.min(width, height) * POINTER_INFLUENCE_RADIUS_MULTIPLIER;
    const rawStrength = Math.max(0, 1 - pointerDistance / influenceRadius);
    const targetStrength = pointerState.active ? rawStrength * 0.1 : 0;

    const stiffness = pointerState.active
      ? POINTER_STIFFNESS_ACTIVE
      : POINTER_STIFFNESS_INACTIVE;

    const accel =
      (targetStrength - this.pointerStrength) * stiffness -
      this.pointerStrengthVelocity * POINTER_DAMPING;

    this.pointerStrengthVelocity += accel * delta;
    this.pointerStrength += this.pointerStrengthVelocity * delta;
    this.pointerStrength = Math.min(
      Math.max(this.pointerStrength, 0),
      POINTER_STRENGTH_MAX
    );

    this.pointUniforms.uPointerStrength.value = this.pointerStrength;
  }

  update(delta, width, height, boostMagnitude, pointerState) {
    if (!this.renderer || !this.scene || !this.camera || !this.pointCloud)
      return;

    const time = this.clock.getElapsedTime();
    this.pointUniforms.uTime.value = time;

    this.updatePointer(delta, width, height, pointerState);
    this.updateStrength(delta, width, height, pointerState);

    // Update noise amplitude
    const targetNoise =
      BLACK_HOLE_NOISE_AMPLITUDE *
      (1 + this.pointerStrength * 0.45 + boostMagnitude * 0.35);
    this.pointUniforms.uNoiseAmplitude.value = interpolateValue(
      this.pointUniforms.uNoiseAmplitude.value,
      targetNoise,
      delta,
      6
    );

    // Update base radius
    const baseRadius =
      computeBaseRadius(width, height) * (1 + boostMagnitude * 0.08);
    this.pointUniforms.uBaseRadius.value = interpolateValue(
      this.pointUniforms.uBaseRadius.value,
      baseRadius,
      delta,
      4
    );

    // Update rotation
    const rotationBoost = boostMagnitude * 0.35;
    this.pointCloud.rotation.y +=
      delta * (0.35 + this.pointerStrength * 0.35 + rotationBoost);
    this.pointCloud.rotation.x += delta * (0.14 + this.pointerStrength * 0.22);
    this.pointCloud.rotation.z +=
      (this.pointerVelocityTarget.x * 0.5 +
        this.pointerVelocityTarget.y * 0.35) *
      delta;

    // Update scale
    const targetScale = Math.min(
      MAX_EXCITEMENT_SCALE,
      1 + this.pointerStrength * 0.1 + boostMagnitude * 0.05
    );
    const scaleValue = interpolateValue(
      this.pointCloud.scale.x,
      targetScale,
      delta,
      6
    );
    this.pointCloud.scale.setScalar(scaleValue);

    this.renderer.render(this.scene, this.camera);
  }

  resize(width, height, ratio) {
    if (this.renderer) {
      this.renderer.setPixelRatio(ratio);
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    if (this.pointUniforms) {
      this.pointUniforms.uBaseRadius.value = computeBaseRadius(width, height);
    }
  }

  reset() {
    this.pointerStrength = 0;
    this.pointerStrengthVelocity = 0;
    if (this.pointCloud) {
      this.pointCloud.scale.setScalar(1);
    }
  }

  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
      this.renderer = null;
    }
    if (this.pointCloud) {
      this.scene?.remove(this.pointCloud);
      this.pointCloud.geometry.dispose();
      this.pointCloud.material.dispose();
      this.pointCloud = null;
      this.pointUniforms = null;
    }
    this.scene = null;
    this.camera = null;
  }
}

export const calculateGravityForce = (normalizedDist) =>
  BLACK_HOLE_GRAVITY_STRENGTH * (1 - normalizedDist ** 2);

export const calculateSpiralAngle = (angle, normalizedDist) =>
  angle + BLACK_HOLE_SPIRAL_STRENGTH * (1 - normalizedDist);

export const calculateStarOpacity = (distanceToCenter, eventHorizon) => {
  if (distanceToCenter < eventHorizon * FADE_START_MULTIPLIER) {
    const fadeRange = eventHorizon * FADE_START_MULTIPLIER - eventHorizon;
    const fadeProgress = (distanceToCenter - eventHorizon) / fadeRange;
    return Math.max(0, Math.min(1, fadeProgress));
  }
  return 1;
};
