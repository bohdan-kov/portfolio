import { ref } from "vue";
import {
  createStar,
  applyBlackHoleGravity,
  updateStarPosition,
  renderStar,
} from "../starRenderer";
import { STAR_COUNT } from "../constants";

export const useStars = () => {
  const stars = ref([]);

  const initStars = (width, height) => {
    stars.value = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.value.push(createStar(width, height));
    }
  };

  const updateAndRenderStars = (
    ctx,
    currentSpeed,
    delta,
    width,
    height,
    centerX,
    centerY,
    eventHorizon,
    influenceRadius,
    boostMagnitude,
    glowBoost
  ) => {
    for (const star of stars.value) {
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
  };

  return {
    stars,
    initStars,
    updateAndRenderStars,
  };
};
