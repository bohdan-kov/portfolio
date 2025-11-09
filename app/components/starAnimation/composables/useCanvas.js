import { ref } from "vue";
import { getViewport } from "../utils";

export const useCanvas = (canvasRef) => {
  const ctx = ref(null);

  const initCanvas = () => {
    if (!canvasRef.value) return false;

    const context = canvasRef.value.getContext("2d", {
      alpha: false, // +10-15% FPS (не рендерить прозорість)
      desynchronized: true, // +5% FPS (async rendering)
      willReadFrequently: false, // оптимізація для write-only
    });
    if (!context) return false;

    ctx.value = context;
    return true;
  };

  const resizeCanvas = () => {
    if (!canvasRef.value || !ctx.value) return;

    const { width, height } = getViewport();
    const ratio = window.devicePixelRatio || 1;

    canvasRef.value.width = width * ratio;
    canvasRef.value.height = height * ratio;
    canvasRef.value.style.width = `${width}px`;
    canvasRef.value.style.height = `${height}px`;

    ctx.value.setTransform(1, 0, 0, 1, 0, 0);
    ctx.value.scale(ratio, ratio);
  };

  const clearCanvas = () => {
    if (!ctx.value) return;
    const { width, height } = getViewport();
    ctx.value.clearRect(0, 0, width, height);
  };

  return {
    ctx,
    initCanvas,
    resizeCanvas,
    clearCanvas,
  };
};
