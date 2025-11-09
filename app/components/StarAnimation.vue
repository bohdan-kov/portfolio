<template>
  <div class="starry-sky">
    <canvas ref="canvasRef"></canvas>
    <div ref="webglRef" class="black-hole-layer"></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  STAR_COUNT,
  MAX_BOOST,
  BOOST_DECAY_RATE,
  BOOST_DECAY_DELAY,
  POINTER_BOOST,
  KEY_BOOST,
  KEY_TRIGGER_CODES,
  WHEEL_DELTA_DIVISOR,
  WHEEL_MAX_BOOST,
  SCROLL_DELTA_DIVISOR,
  SCROLL_MAX_BOOST,
  KEY_REPEAT_MODIFIER,
  BOOST_DECAY_DELAY_FRAMES,
  BLACK_HOLE_EVENT_HORIZON_MULTIPLIER,
  BLACK_HOLE_INFLUENCE_RADIUS_MULTIPLIER,
  GLOW_BOOST_DIVISOR,
} from "./starAnimation/constants";
import {
  getViewport,
  computeBaseRadius,
  updatePointerVelocity,
} from "./starAnimation/utils";
import { BlackHoleManager } from "./starAnimation/blackHoleManager";
import {
  createStar,
  applyBlackHoleGravity,
  updateStarPosition,
  renderStar,
} from "./starAnimation/starRenderer";

// ============================================================================
// STATE VARIABLES
// ============================================================================

const stars = [];
let ctx = null;
let animationFrameId = 0;
let lastTimestamp = 0;
let currentSpeed = 1;
let boostMomentum = 0;
let lastBoostTime = 0;
let lastScrollY = 0;
let blackHoleRadius = 0;

const pointerState = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  lastTime: 0,
  active: false,
};

const canvasRef = ref(null);
const webglRef = ref(null);
const blackHoleManager = new BlackHoleManager();

// ============================================================================
// BOOST MANAGEMENT
// ============================================================================

const applyBoost = (boostFactor) => {
  if (boostFactor <= 0) return;
  boostMomentum = Math.min(MAX_BOOST, boostMomentum + boostFactor);
  lastBoostTime = performance.now();
};

const handleWheel = (event) => {
  const delta = event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY;
  applyBoost(Math.min(Math.abs(delta) / WHEEL_DELTA_DIVISOR, WHEEL_MAX_BOOST));
};

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  const delta = Math.abs(currentScrollY - lastScrollY);
  lastScrollY = currentScrollY;
  if (delta > 0) {
    applyBoost(Math.min(delta / SCROLL_DELTA_DIVISOR, SCROLL_MAX_BOOST));
  }
};

// ============================================================================
// POINTER MANAGEMENT
// ============================================================================

const handlePointerDown = (event) => {
  const now = performance.now();
  pointerState.lastTime = now;
  pointerState.vx = 0;
  pointerState.vy = 0;
  pointerState.x = event.clientX;
  pointerState.y = event.clientY;
  pointerState.active = true;
  applyBoost(POINTER_BOOST);
};

const handlePointerMove = (event) => {
  const now = performance.now();
  const dx = event.clientX - pointerState.x;
  const dy = event.clientY - pointerState.y;
  const velocity = updatePointerVelocity(now, pointerState.lastTime, dx, dy);

  pointerState.vx = velocity.vx;
  pointerState.vy = velocity.vy;
  pointerState.x = event.clientX;
  pointerState.y = event.clientY;
  pointerState.lastTime = now;
  pointerState.active = true;
};

const handlePointerLeave = () => {
  pointerState.active = false;
  pointerState.vx = 0;
  pointerState.vy = 0;
  pointerState.lastTime = 0;

  const { width, height } = getViewport();
  pointerState.x = width / 2;
  pointerState.y = height / 2;
};

const handleKeyDown = (event) => {
  if (KEY_TRIGGER_CODES.has(event.code) || event.key === "Shift") {
    applyBoost(event.repeat ? KEY_BOOST * KEY_REPEAT_MODIFIER : KEY_BOOST);
  }
};

// ============================================================================
// RESIZE HANDLING
// ============================================================================

const handleResize = () => {
  if (!canvasRef.value || !ctx) return;

  const { width, height } = getViewport();
  const ratio = window.devicePixelRatio || 1;

  canvasRef.value.width = width * ratio;
  canvasRef.value.height = height * ratio;
  canvasRef.value.style.width = `${width}px`;
  canvasRef.value.style.height = `${height}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(ratio, ratio);

  blackHoleRadius = computeBaseRadius(width, height) * Math.min(width, height);

  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i += 1) {
    stars.push(createStar(width, height));
  }

  if (!blackHoleManager.renderer) {
    blackHoleManager.init(webglRef.value, width, height, ratio);
  } else {
    blackHoleManager.resize(width, height, ratio);
  }

  pointerState.x = width / 2;
  pointerState.y = height / 2;
  pointerState.vx = 0;
  pointerState.vy = 0;
  pointerState.lastTime = 0;
  pointerState.active = false;
  blackHoleManager.reset();
};

// ============================================================================
// ANIMATION LOOP
// ============================================================================

const animate = (timestamp) => {
  if (!ctx) return;

  if (!lastTimestamp) {
    lastTimestamp = timestamp;
  }
  const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
  lastTimestamp = timestamp;

  if (boostMomentum > 0) {
    const timeSinceBoost = performance.now() - lastBoostTime;
    if (timeSinceBoost > BOOST_DECAY_DELAY) {
      const decayRamp =
        1 +
        Math.min(
          1.75,
          (timeSinceBoost - BOOST_DECAY_DELAY) / BOOST_DECAY_DELAY_FRAMES
        );
      boostMomentum = Math.max(
        0,
        boostMomentum - BOOST_DECAY_RATE * decayRamp * delta
      );
    }
  }

  const targetSpeed = 1 + boostMomentum;
  const easing = 1 - Math.exp(-delta * 6);
  currentSpeed += (targetSpeed - currentSpeed) * easing;

  const { width, height } = getViewport();

  ctx.clearRect(0, 0, width, height);

  const boostMagnitude = Math.max(0, currentSpeed - 1);
  const glowBoost = Math.min(1, boostMagnitude / GLOW_BOOST_DIVISOR);

  const centerX = width / 2;
  const centerY = height / 2;
  const eventHorizon = blackHoleRadius * BLACK_HOLE_EVENT_HORIZON_MULTIPLIER;
  const influenceRadius =
    blackHoleRadius * BLACK_HOLE_INFLUENCE_RADIUS_MULTIPLIER;

  for (const star of stars) {
    applyBlackHoleGravity(
      star,
      centerX,
      centerY,
      eventHorizon,
      influenceRadius,
      delta,
      width,
      height
    );
    updateStarPosition(star, currentSpeed, delta, width, height);
    renderStar(star, ctx, boostMagnitude, glowBoost);
  }

  blackHoleManager.update(delta, width, height, boostMagnitude, pointerState);

  animationFrameId = requestAnimationFrame(animate);
};

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  ctx = canvas.getContext("2d");
  lastScrollY = window.scrollY;
  lastBoostTime = performance.now();

  handleResize();
  animationFrameId = requestAnimationFrame(animate);

  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("wheel", handleWheel, { passive: true });
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("pointerdown", handlePointerDown, { passive: true });
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerleave", handlePointerLeave);
  window.addEventListener("blur", handlePointerLeave);
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);

  window.removeEventListener("resize", handleResize);
  window.removeEventListener("wheel", handleWheel);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("pointerdown", handlePointerDown);
  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerleave", handlePointerLeave);
  window.removeEventListener("blur", handlePointerLeave);
  window.removeEventListener("keydown", handleKeyDown);

  blackHoleManager.dispose();
});
</script>

<style scoped>
.starry-sky {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(
    circle at top,
    #061126 0%,
    #02060f 45%,
    #000 100%
  );
  pointer-events: none;
  z-index: 0;
}

.starry-sky canvas,
.starry-sky .black-hole-layer {
  position: absolute;
  inset: 0;
}

.starry-sky canvas {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

.black-hole-layer {
  pointer-events: none;
}
</style>
