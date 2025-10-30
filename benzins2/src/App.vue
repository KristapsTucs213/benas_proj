<template>
  <div>
    
    <nav class="navbar custom-navbar shadow-sm py-3">
      <div class="container d-flex justify-content-between align-items-center">
        
        <RouterLink to="/" class="navbar-brand fw-bold text-dark fs-4">
          <img src="@/assets/loggo.png" alt="logo" class="foto" />
        </RouterLink>

        
        <div class="d-flex align-items-center gap-4">
          <RouterLink to="/" class="nav-link text-white fw-semibold"
            >Degviela</RouterLink
          >
          <RouterLink to="/cenasvesture" class="nav-link text-white fw-semibold"
            >Graphs</RouterLink
          >

          <template v-if="!isLoggedIn">
            <RouterLink to="/register" class="nav-link text-white fw-semibold"
              >Register</RouterLink
            >
            <RouterLink to="/login" class="nav-link text-white fw-semibold"
              >Login</RouterLink
            >
          </template>

          <template v-else>
            <RouterLink to="/stati" class="nav-link text-white fw-semibold">Stati</RouterLink>
            <RouterLink to="/profile" class="nav-link text-white fw-semibold">Profile</RouterLink>
            <a
              href="#"
              @click.prevent="logout"
              class="nav-link text-white fw-semibold"
              >Logout</a
            >
          </template>
        </div>
      </div>
    </nav>

    <div class="app-background">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { userStore } from "@/store/userStore";

const router = useRouter();
const isLoggedIn = computed(() => userStore.isLoggedIn);

function logout() {
  userStore.setUser(null);
  router.push("/login");
}
</script>

<style scoped>
.app-background {
  background: linear-gradient(135deg, #a09675 0%, #e8f9e9 50%, #685b30 100%);
  min-height: 100vh;
  background-attachment: fixed;
}

.navbar {
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
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
  align-items: center;
  gap: 0.5rem;
}

.foto {
  max-height: 65px;
  width: auto;
  display: block;
}

.custom-navbar {
  background-color: #943d4d;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}
</style>
