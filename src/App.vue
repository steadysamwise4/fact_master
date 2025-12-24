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
