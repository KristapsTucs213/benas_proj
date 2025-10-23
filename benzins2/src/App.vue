<template>
  <div>
    <!-- Clean Desktop Navbar -->
    <nav class="navbar custom-navbar shadow-sm py-3">

      <div class="container d-flex justify-content-between align-items-center">
        <!-- Brand -->
        <RouterLink to="/" class="navbar-brand fw-bold text-dark fs-4">
          <img src="@/assets/loggo.png" alt="logo" class="foto">
        </RouterLink>

        <!-- Navigation Links -->
        <div class="d-flex align-items-center gap-4">
          <RouterLink to="/" class="nav-link text-white fw-semibold">Degviela</RouterLink>
          <RouterLink to="/cenasvesture" class="nav-link text-white fw-semibold">Graphs</RouterLink>

          <template v-if="!isLoggedIn">
            <RouterLink to="/register" class="nav-link text-white fw-semibold">Register</RouterLink>
            <RouterLink to="/login" class="nav-link text-white fw-semibold">Login</RouterLink>
          </template>

          <template v-else>
            <RouterLink to="/profile" class="nav-link text-white fw-semibold">Profile</RouterLink>
            <a href="#" @click.prevent="logout" class="nav-link text-white fw-semibold">Logout</a>
          </template>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="app-background">
      <router-view />
    </div>
  </div>
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

<style scoped>
.app-background {
  background: linear-gradient(135deg, #a09675 0%, #e8f9e9 50%, #685b30 100%);
  min-height: 100vh;
  background-attachment: fixed;
}
.navbar {
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  padding-top: 0.5rem;   /* reduce padding */
  padding-bottom: 0.5rem; /* reduce padding */
}

.nav-link {
  position: relative;
  transition: color 0.2s ease-in-out;
}

.nav-link:hover {
  color: #000 !important;
}

.nav-link::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0%;
  height: 2px;
  background-color: #000;
  transition: width 0.3s ease-in-out;
}

.nav-link:hover::after {
  width: 100%;
}

.navbar-brand {
  display: flex;
  align-items: center; /* vertically center logo and text */
  gap: 0.5rem;
}
.card:hover {
  transform: scale(1.02);
  transition: 0.2s ease-in-out;
}

.foto {
  max-height: 65px; /* max height to fit inside navbar */
  width: auto;      /* maintain aspect ratio */
  display: block;
}
.custom-navbar {
  background-color: #943d4d; /* your custom color */
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}


</style>