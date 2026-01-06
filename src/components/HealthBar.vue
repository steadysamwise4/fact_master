<template>
  <div class="hp-bar" :style="{ height: height + 'px' }">
    <div
      class="hp-fill"
      :class="variant"
      :style="{ width: percent + '%' }"
    ></div>
  </div>
  <div class="hp-text">HP: {{ value }} / {{ max }}</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: { type: Number, required: true }, // current HP
  max: { type: Number, required: true }, // max HP
  variant: { type: String, default: 'enemy' }, // 'enemy' | 'player'
  height: { type: Number, default: 24 }, // px
});
const percent = computed(() =>
  Math.max(0, Math.min(100, (props.value / props.max) * 100))
);
</script>

<style scoped>
.hp-bar {
  width: 100%;
  background: #2a1810;
  border: 2px solid #8b6914;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
}
.hp-fill {
  height: 100%;
  transition: width 0.5s ease;
}
.hp-fill.enemy {
  background: linear-gradient(to bottom, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}
.hp-fill.player {
  background: linear-gradient(to bottom, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
}
.hp-text {
  color: #e0d5c7;
  font-size: 0.9rem;
  text-align: center;
  font-weight: bold;
}
</style>
