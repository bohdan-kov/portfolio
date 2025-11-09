import * as THREE from "three";
import {
  BASE_RADIUS_FACTOR_A,
  BASE_RADIUS_FACTOR_B,
  BASE_RADIUS_FACTOR_C,
  POINTER_CLAMP_MIN,
  POINTER_CLAMP_MAX,
} from "./constants";

export const computeBaseRadius = (width, height) =>
  (BASE_RADIUS_FACTOR_A +
    (Math.min(width, height) / Math.max(width, height)) *
      BASE_RADIUS_FACTOR_B) *
  BASE_RADIUS_FACTOR_C;

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
