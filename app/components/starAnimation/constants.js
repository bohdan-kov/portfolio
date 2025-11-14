// Star animation constants
export const STAR_COUNT = 220;
export const BASE_SPEED = 45;
export const STREAK_MAX_LENGTH = 85;
export const MAX_BOOST = 3;
export const BOOST_DECAY_RATE = 1.35;
export const BOOST_DECAY_DELAY = 180;
export const POINTER_BOOST = 1.15;
export const KEY_BOOST = 0.9;

// Black hole particle constants
export const BLACK_HOLE_PARTICLE_COUNT = 5600;
export const BLACK_HOLE_NOISE_FREQ = 3.6;
export const BLACK_HOLE_NOISE_AMPLITUDE = 0.23;

// Scale constants
export const MAX_EXCITEMENT_SCALE = 1.1;
export const SURFACE_SMOOTH_PASSES = 2;
export const BLACK_HOLE_SURFACE_SMOOTHING = 0.22;

// Black hole attraction constants
export const BLACK_HOLE_GRAVITY_STRENGTH = 180;
export const BLACK_HOLE_EVENT_HORIZON_MULTIPLIER = 1;
export const BLACK_HOLE_INFLUENCE_RADIUS_MULTIPLIER = 2.5;
export const BLACK_HOLE_SPIRAL_STRENGTH = 0.4;

// Pointer interaction constants
export const POINTER_CLAMP_MIN = -0.9;
export const POINTER_CLAMP_MAX = 0.9;
export const POINTER_INFLUENCE_RADIUS_MULTIPLIER = 0.45;
export const POINTER_STRENGTH_MAX = 0.1;
export const POINTER_STIFFNESS_ACTIVE = 16;
export const POINTER_STIFFNESS_INACTIVE = 10;
export const POINTER_DAMPING = 6.5;

// Star rendering constants
export const STAR_RADIUS_MIN = 0.3;
export const STAR_RADIUS_MAX = 1.5;
export const STAR_SPEED_VARIATION_MIN = 0.5;
export const STAR_SPEED_VARIATION_MAX = 1.0;
export const GLOW_BOOST_DIVISOR = 3;
export const STREAK_THRESHOLD = 1.2;

// Fade constants
export const FADE_START_MULTIPLIER = 2;
export const FADE_END_MULTIPLIER = 1;

// Boost constants
export const WHEEL_DELTA_DIVISOR = 180;
export const WHEEL_MAX_BOOST = 1.8;
export const SCROLL_DELTA_DIVISOR = 220;
export const SCROLL_MAX_BOOST = 1.4;
export const KEY_REPEAT_MODIFIER = 0.45;
export const BOOST_DECAY_DELAY_FRAMES = 260;

// Black hole rendering constants
export const BASE_RADIUS_FACTOR_A = 0.35;
export const BASE_RADIUS_FACTOR_B = 0.18;
export const BASE_RADIUS_FACTOR_C = 0.33;
export const MAX_BLACK_HOLE_RADIUS_PX = 160; 

// Key codes for boost triggers
export const KEY_TRIGGER_CODES = new Set([
  "Space",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Enter",
  "ShiftLeft",
  "ShiftRight",
]);
