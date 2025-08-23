<!-- src/App.vue -->
<template>
    <div id="app">
      <NavBar />
      <router-view/>
    </div>
  </template>
  
  <script setup>
  import NavBar from '@/components/NavBar.vue'
  import { onMounted } from 'vue'
  import { useUserStore } from '@/stores/userStore'

  const userStore = useUserStore()

  onMounted(async () => {
    await userStore.checkLoginStatus()
  })
  </script>
  
  <style>
  #app {
    margin: auto;
  }
  a{
    text-decoration: none;
    color: #551eba;
  }
  </style>
