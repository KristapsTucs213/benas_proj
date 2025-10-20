<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input v-model="email" type="text" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from "axios";
import "@/css/LoginView.css";

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post("http://localhost:5001/login", {
          email: this.email,
          password: this.password,
        });

        if (response.data.user) {
          // Save user info to localStorage
          localStorage.setItem("user", JSON.stringify(response.data.user));

          // Reload page to refresh state
          window.location.reload();
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.error || "Invalid email or password.";
      }
    },
  },
};
</script>

