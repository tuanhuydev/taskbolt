<template>
  <div class="app-container">
    <h1>Welcome to {{ title }}!</h1>
    <p>Your Vue.js Module Federation app is running.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const title = ref('Taskbolt');
</script>

<style scoped>
.app-container {
  text-align: center;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

h1 {
  color: #42b983;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  color: #333;
  font-size: 1.2rem;
}
</style>
