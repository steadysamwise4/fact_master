// composables/useRafTimer.js
import { ref, onUnmounted } from 'vue';

export function useRafTimer(durationMs = 20000, onDone = null) {
  const progress = ref(1);
  const running = ref(false);

  let rafId = 0;
  let baseTs = 0;

  function tick(ts) {
    if (!baseTs) baseTs = ts;
    const elapsed = ts - baseTs;
    const remaining = Math.max(0, durationMs - elapsed);
    progress.value = remaining / durationMs;

    if (remaining > 0 && running.value) {
      rafId = requestAnimationFrame(tick);
    } else {
      running.value = false;
      rafId = 0;
      onDone && onDone(); // fire completion
    }
  }

  function start() {
    if (running.value) return;
    running.value = true;
    baseTs = 0;
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    running.value = false;
  }
  function reset() {
    stop();
    progress.value = 1;
  }

  onUnmounted(stop);
  return { progress, running, start, stop, reset };
}
