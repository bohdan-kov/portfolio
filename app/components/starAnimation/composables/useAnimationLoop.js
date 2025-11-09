import { ref, onBeforeUnmount } from "vue";

export const useAnimationLoop = () => {
  const animationFrameId = ref(0);
  const lastTimestamp = ref(0);

  const startLoop = (callback) => {
    const loop = (timestamp) => {
      if (!lastTimestamp.value) {
        lastTimestamp.value = timestamp;
      }

      const delta = Math.min((timestamp - lastTimestamp.value) / 1000, 0.1);
      lastTimestamp.value = timestamp;

      callback(delta, timestamp);
      animationFrameId.value = requestAnimationFrame(loop);
    };

    animationFrameId.value = requestAnimationFrame(loop);
  };

  const stopLoop = () => {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = 0;
    }
  };

  onBeforeUnmount(stopLoop);

  return { startLoop, stopLoop };
};
