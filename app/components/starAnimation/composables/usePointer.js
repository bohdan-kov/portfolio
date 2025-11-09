import { reactive } from "vue";
import { updatePointerVelocity, getViewport } from "../utils";
import { POINTER_BOOST } from "../constants";

export const usePointer = (applyBoost) => {
  const pointerState = reactive({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    lastTime: 0,
    active: false,
  });

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

  const resetPointer = () => {
    const { width, height } = getViewport();
    pointerState.x = width / 2;
    pointerState.y = height / 2;
    pointerState.vx = 0;
    pointerState.vy = 0;
    pointerState.lastTime = 0;
    pointerState.active = false;
  };

  return {
    pointerState,
    handlePointerDown,
    handlePointerMove,
    handlePointerLeave,
    resetPointer,
  };
};
