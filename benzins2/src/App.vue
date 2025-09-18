<template>
  <nav>
    <router-link to="/">Benzins</router-link> |
    <router-link to="/cenasvesture">Graphs</router-link> |
  </nav>
   <router-view/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}


/* Navbar overlay */
nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  z-index: 10;
  background: transparent;
}

nav a {
  font-weight: bold;
  color: #0a0a0a;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #42b983;
}

</style>
