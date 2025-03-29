<!-- src/App.vue -->
<template>
  <div id="app">
    <NavBar />
    <router-view/>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<style>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}
a{
  text-decoration: none;
  color: #551eba;
}
</style>