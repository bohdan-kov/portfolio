import {
  BASE_SPEED,
  STAR_RADIUS_MIN,
  STAR_RADIUS_MAX,
  STAR_SPEED_VARIATION_MIN,
  STAR_SPEED_VARIATION_MAX,
  STREAK_MAX_LENGTH,
  STREAK_THRESHOLD,
} from "./constants";
import {
  calculateGravityForce,
  calculateSpiralAngle,
  calculateStarOpacity,
} from "./blackHoleManager";

export const createStar = (width, height) => ({
  x: Math.random() * width,
  y: Math.random() * height,
  radius: Math.random() * (STAR_RADIUS_MAX - STAR_RADIUS_MIN) + STAR_RADIUS_MIN,
  speed:
    BASE_SPEED *
    (STAR_SPEED_VARIATION_MIN +
      Math.random() * (STAR_SPEED_VARIATION_MAX - STAR_SPEED_VARIATION_MIN)),
  vx: 0,
  vy: 0,
  opacity: 1,
});

export const respawnStar = (star, width, height) => {
  const edge = Math.random();

  if (edge < 0.25) {
    star.x = Math.random() * width;
    star.y = -star.radius;
  } else if (edge < 0.5) {
    star.x = Math.random() * width;
    star.y = height + star.radius;
  } else if (edge < 0.75) {
    star.x = -star.radius;
    star.y = Math.random() * height;
  } else {
    star.x = width + star.radius;
    star.y = Math.random() * height;
  }

  star.vx = 0;
  star.vy = 0;
  star.opacity = 1;
  star.speed =
    BASE_SPEED *
    (STAR_SPEED_VARIATION_MIN +
      Math.random() * (STAR_SPEED_VARIATION_MAX - STAR_SPEED_VARIATION_MIN));
};

export const applyBlackHoleGravity = (
  star,
  centerX,
  centerY,
  eventHorizon,
  influenceRadius,
  delta,
  width,
  height
) => {
  const dx = centerX - star.x;
  const dy = centerY - star.y;
  const distanceToCenter = Math.hypot(dx, dy);

  if (distanceToCenter < influenceRadius) {
    const normalizedDist = distanceToCenter / influenceRadius;
    const gravityForce = calculateGravityForce(normalizedDist);
    const angle = Math.atan2(dy, dx);
    const spiralAngle = calculateSpiralAngle(angle, normalizedDist);

    star.vx += Math.cos(spiralAngle) * gravityForce * delta;
    star.vy += Math.sin(spiralAngle) * gravityForce * delta;
    star.opacity = calculateStarOpacity(distanceToCenter, eventHorizon);

    if (distanceToCenter < eventHorizon) {
      respawnStar(star, width, height);
      return;
    }
  } else {
    star.opacity = 1;
  }
};

export const updateStarPosition = (
  star,
  currentSpeed,
  delta,
  width,
  height
) => {
  star.x += star.vx * delta;
  star.y += star.vy * delta;
  star.y += star.speed * currentSpeed * delta;

  if (star.y - star.radius > height) {
    star.y = -star.radius;
    star.x = Math.random() * width;
    star.speed =
      BASE_SPEED *
      (STAR_SPEED_VARIATION_MIN +
        Math.random() * (STAR_SPEED_VARIATION_MAX - STAR_SPEED_VARIATION_MIN));
    star.vx = 0;
    star.vy = 0;
    star.opacity = 1;
  }

  if (star.x < -star.radius) star.x = width + star.radius;
  if (star.x > width + star.radius) star.x = -star.radius;
};

const renderStarStreak = (star, ctx, boostMagnitude, glowBoost) => {
  const streakLength = Math.min(
    STREAK_MAX_LENGTH,
    boostMagnitude * star.speed * 0.35
  );

  if (streakLength > star.radius * STREAK_THRESHOLD) {
    const gradient = ctx.createLinearGradient(
      star.x,
      star.y - streakLength,
      star.x,
      star.y + star.radius * 2
    );

    gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(
      0.45,
      `rgba(255, 255, 255, ${(0.18 + 0.5 * glowBoost) * star.opacity})`
    );
    gradient.addColorStop(1, `rgba(255, 255, 255, ${0.9 * star.opacity})`);

    ctx.save();
    ctx.globalAlpha = star.opacity;
    ctx.lineWidth = Math.max(1, star.radius * (1 + boostMagnitude * 0.3));
    ctx.strokeStyle = gradient;
    ctx.lineCap = "round";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(star.x, star.y - streakLength);
    ctx.lineTo(star.x, star.y + star.radius);
    ctx.stroke();
    ctx.restore();
  }
};

const renderStarCore = (star, ctx, glowBoost) => {
  ctx.save();
  ctx.globalAlpha = star.opacity;
  ctx.shadowColor = `rgba(255, 255, 255, ${0.85 * star.opacity})`;
  ctx.shadowBlur = (6 + glowBoost * 20) * star.opacity;
  ctx.fillStyle = `rgba(255, 255, 255, ${
    (0.7 + glowBoost * 0.25) * star.opacity
  })`;
  ctx.beginPath();
  ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const renderStar = (star, ctx, boostMagnitude, glowBoost) => {
  if (star.opacity < 0.01) return;
  renderStarStreak(star, ctx, boostMagnitude, glowBoost);
  renderStarCore(star, ctx, glowBoost);
};

// Batch rendering для кращої продуктивності
export const renderStars = (stars, ctx, boostMagnitude, glowBoost) => {
  // Спочатку всі streak
  ctx.save();
  for (const star of stars) {
    if (star.opacity > 0.01) {
      renderStarStreak(star, ctx, boostMagnitude, glowBoost);
    }
  }
  ctx.restore();

  // Потім всі core
  ctx.save();
  for (const star of stars) {
    if (star.opacity > 0.01) {
      renderStarCore(star, ctx, glowBoost);
    }
  }
  ctx.restore();
};
