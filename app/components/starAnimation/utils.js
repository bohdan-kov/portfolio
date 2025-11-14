import * as THREE from "three";
import {
  BASE_RADIUS_FACTOR_A,
  BASE_RADIUS_FACTOR_B,
  BASE_RADIUS_FACTOR_C,
  MAX_BLACK_HOLE_RADIUS_PX,
  POINTER_CLAMP_MIN,
  POINTER_CLAMP_MAX,
} from "./constants";

export const computeBaseRadius = (width, height) => {
  const calculatedRadius =
    (BASE_RADIUS_FACTOR_A +
      (Math.min(width, height) / Math.max(width, height)) *
        BASE_RADIUS_FACTOR_B) *
    BASE_RADIUS_FACTOR_C;
  
  // Конвертуємо MAX_BLACK_HOLE_RADIUS_PX у Three.js одиниці
  const fov = 42 * (Math.PI / 180);
  const cameraZ = 1.6;
  const visibleHeight = 2 * Math.tan(fov / 2) * cameraZ;
  const maxRadiusInThreeJS = (MAX_BLACK_HOLE_RADIUS_PX / height) * visibleHeight;
  
  return Math.min(calculatedRadius, maxRadiusInThreeJS);
};

export const getViewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

export const clampPointerCoordinate = (value) =>
  THREE.MathUtils.clamp(value, POINTER_CLAMP_MIN, POINTER_CLAMP_MAX);

export const interpolateValue = (current, target, delta, rate) =>
  current + (target - current) * Math.min(1, delta * rate);

export const updatePointerVelocity = (now, lastTime, dx, dy) => {
  const dt = lastTime ? Math.max((now - lastTime) / 1000, 0.001) : 0.016;
  return { vx: dx / dt, vy: dy / dt };
};
