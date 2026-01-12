<!-- App.vue -->
<template>
  <router-view />
</template>

<script setup>
// No script needed unless you have global logic
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Georgia', serif;
  background: #1a1a2e;
}

.toast {
  position: fixed;
  left: 50%;
  top: 12%;
  transform: translate(-50%, -12px);
  z-index: 10000;
  background: #222;
  color: #fff;
  padding: 1rem 1.5rem; /* bigger */
  border-radius: 10px;
  font-size: 1.25rem; /* bigger text */
  line-height: 1.3;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  opacity: 0;
  transition: opacity 0.25s, transform 0.25s;
}
.toast.show {
  opacity: 1;
  transform: translate(-50%, 0);
}

.sprite.shake {
  animation: shake 0.3s;
}
.sprite.fade-out {
  animation: fadeOut 1s forwards;
}
.sprite.attack {
  animation: attackLunge 0.5s;
}
.sprite.hurt {
  animation: hurt 0.45s;
}

/* keyframes also global */
@keyframes attackLunge {
  0% {
    transform: translateY(0) scale(1);
  }
  35% {
    transform: translateY(-28px) scale(1.03);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}
@keyframes hurt {
  0%,
  100% {
    transform: translateX(0);
    filter: none;
  }
  25% {
    transform: translateX(-8px) brightness(1.4) saturate(1.2);
  }
  75% {
    transform: translateX(8px) brightness(1.4) saturate(1.2);
  }
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px) rotate(-3deg);
  }
  75% {
    transform: translateX(10px) rotate(3deg);
  }
}
@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.6) translateY(40px);
  }
}
</style>

<!-- <template><Header /><CreateUser /></template>

<script setup>
import CreateUser from './components/CreateUser.vue';
import Header from './components/Header.vue';

// export default {
//   components: {
//     Header,
//     CreateUser
//   },
// };
</script> -->
