<template>
    <div id="app">
      <h1>Hello Vue 3!</h1>
      <p>Counter: {{ count }}</p>
      <button @click="increment">Increment</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const count = ref(0)
  const increment = () => {
    count.value++
  }
  </script>
  
  <style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    text-align: center;
    margin-top: 40px;
  }
  </style>
  