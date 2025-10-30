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
