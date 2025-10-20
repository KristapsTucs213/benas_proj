<template>
  <nav>
    <router-link to="/">Benzins</router-link> |
    <router-link to="/cenasvesture">Graphs</router-link> |

    <template v-if="!isLoggedIn">
      <router-link to="/register">Register</router-link> |
      <router-link to="/login">Login</router-link> |
    </template>

    <template v-else>
      <router-link to="/profile">Profile</router-link> |
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
    const user = localStorage.getItem("user");
    this.isLoggedIn = !!user;
  },
  methods: {
    logout() {
      localStorage.removeItem("user");
      this.isLoggedIn = false;
      window.location.reload();
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
}

html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  z-index: 10;
  background: orange;
}

nav a {
  font-weight: bold;
  color: #0a0a0a;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
