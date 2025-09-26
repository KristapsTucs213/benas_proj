<template>
  <nav>
    <router-link to="/">Benzins</router-link> |
    <router-link to="/cenasvesture">Graphs</router-link> |

    <!-- Show Register/Login only if user is NOT logged in -->
    <template v-if="!isLoggedIn">
      <router-link to="/register">Register</router-link> |
      <router-link to="/login">Login</router-link> |
    </template>

    <!-- Show Logout button if user IS logged in -->
    <template v-else>
      <span>Welcome!</span> |
      <a href="#" @click.prevent="logout">Logout</a> |
    </template>
  </nav>

  <router-view />
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      isLoggedIn: false,
    };
  },
  mounted() {
    // Check localStorage on page load
    this.isLoggedIn = !!localStorage.getItem("userId");
  },
  methods: {
    logout() {
      // Remove user ID from localStorage
      localStorage.removeItem("userId");
      this.isLoggedIn = false;

      // Refresh the page
      window.location.reload();
    },
  },
};
</script>

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
