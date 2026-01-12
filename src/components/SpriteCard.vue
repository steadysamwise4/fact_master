<template>
  <div class="sprite-card" :style="{ borderColor }">
    <div
      class="sprite"
      :class="spriteClasses"
      :style="{ width: size + 'px', height: size + 'px' }"
    >
      <img :src="src" :alt="alt" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  size: { type: Number, default: 220 }, // square px
  borderColor: { type: String, default: '#8b6914' },
  glowInset: { type: String, default: 'rgba(255,215,0,0.1)' },
  spriteClasses: { type: Object, default: () => ({}) }, // e.g., { shake: true, 'fade-out': false }
});
</script>

<style scoped>
.sprite-card {
  position: relative;
  background: rgba(0, 0, 0, 0.6);
  border: 3px solid;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px var(--glow, rgba(255, 215, 0, 0.1));
}
.sprite {
  position: relative;
  image-rendering: pixelated;
}
.sprite img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
