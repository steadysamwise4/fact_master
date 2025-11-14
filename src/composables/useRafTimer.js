// composables/useRafTimer.js
import { ref, onUnmounted } from 'vue';

export function useRafTimer(durationMs = 20000, onDone = null) {
  const progress = ref(1); // 1 -> 0
  const running = ref(false);
  const lastDurationSec = ref(null); // elapsed seconds for last run

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
      // capture total elapsed for this question
      lastDurationSec.value = Math.round((durationMs - remaining) / 1000);
      onDone && onDone();
    }
  }

  function start() {
    if (running.value) return;
    running.value = true;
    baseTs = 0;
    lastDurationSec.value = null;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (!running.value) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
    running.value = false;
    // compute elapsed at stop
    const remaining = progress.value * durationMs;
    lastDurationSec.value = Math.round((durationMs - remaining) / 1000);
  }

  function reset() {
    // hard reset regardless of running state
    if (rafId) cancelAnimationFrame(rafId);
    running.value = false;
    rafId = 0;
    baseTs = 0;
    progress.value = 1;
    lastDurationSec.value = null;
  }

  // optional: convenience getter
  function getElapsedMs() {
    return (1 - progress.value) * durationMs;
  }

  onUnmounted(stop);
  return {
    progress,
    running,
    start,
    stop,
    reset,
    lastDurationSec,
    getElapsedMs,
  };
}
