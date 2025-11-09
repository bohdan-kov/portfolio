import { ref } from "vue";
import {
  MAX_BOOST,
  BOOST_DECAY_RATE,
  BOOST_DECAY_DELAY,
  BOOST_DECAY_DELAY_FRAMES,
  WHEEL_DELTA_DIVISOR,
  WHEEL_MAX_BOOST,
  SCROLL_DELTA_DIVISOR,
  SCROLL_MAX_BOOST,
  KEY_BOOST,
  KEY_REPEAT_MODIFIER,
  KEY_TRIGGER_CODES,
} from "../constants";

export const useBoost = () => {
  const boostMomentum = ref(0);
  const currentSpeed = ref(1);
  const lastBoostTime = ref(0);
  const lastScrollY = ref(0);

  const applyBoost = (boostFactor) => {
    if (boostFactor <= 0) return;
    boostMomentum.value = Math.min(
      MAX_BOOST,
      boostMomentum.value + boostFactor
    );
    lastBoostTime.value = performance.now();
  };

  const updateBoost = (delta) => {
    if (boostMomentum.value > 0) {
      const timeSinceBoost = performance.now() - lastBoostTime.value;
      if (timeSinceBoost > BOOST_DECAY_DELAY) {
        const decayRamp =
          1 +
          Math.min(
            1.75,
            (timeSinceBoost - BOOST_DECAY_DELAY) / BOOST_DECAY_DELAY_FRAMES
          );
        boostMomentum.value = Math.max(
          0,
          boostMomentum.value - BOOST_DECAY_RATE * decayRamp * delta
        );
      }
    }

    const targetSpeed = 1 + boostMomentum.value;
    const easing = 1 - Math.exp(-delta * 6);
    currentSpeed.value += (targetSpeed - currentSpeed.value) * easing;
  };

  const handleWheel = (event) => {
    const delta = event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY;
    applyBoost(
      Math.min(Math.abs(delta) / WHEEL_DELTA_DIVISOR, WHEEL_MAX_BOOST)
    );
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    const delta = Math.abs(currentScrollY - lastScrollY.value);
    lastScrollY.value = currentScrollY;
    if (delta > 0) {
      applyBoost(Math.min(delta / SCROLL_DELTA_DIVISOR, SCROLL_MAX_BOOST));
    }
  };

  const handleKeyDown = (event) => {
    if (KEY_TRIGGER_CODES.has(event.code) || event.key === "Shift") {
      applyBoost(event.repeat ? KEY_BOOST * KEY_REPEAT_MODIFIER : KEY_BOOST);
    }
  };

  const initScrollY = () => {
    lastScrollY.value = window.scrollY;
  };

  return {
    currentSpeed,
    boostMomentum,
    applyBoost,
    updateBoost,
    handleWheel,
    handleScroll,
    handleKeyDown,
    initScrollY,
  };
};
