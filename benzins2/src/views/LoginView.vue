<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input
        type="email"
        v-model="email"
        placeholder="Email"
        required
        :class="{ 'input-error': emailError }"
      />
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
        :class="{ 'input-error': passwordError }"
      />
      <button type="submit">Login</button>
    </form>

    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
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
      successMessage: "",
      emailError: false,
      passwordError: false,
    };
  },
  methods: {
    async login() {
      this.errorMessage = "";
      this.successMessage = "";
      this.emailError = false;
      this.passwordError = false;

      // Frontend validation
      if (!this.email) this.emailError = true;
      if (!this.password) this.passwordError = true;
      if (this.emailError || this.passwordError) return;

      try {
        const response = await axios.post("http://localhost:5001/login", {
          email: this.email,
          password: this.password,
        });

        const user = response.data.user;

        // Save user ID in localStorage
        localStorage.setItem("userId", user.id);

        this.successMessage = response.data.message;

        // Clear form fields
        this.email = "";
        this.password = "";

        // Reload the page so navbar updates
        window.location.reload();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.error || "Login failed. Try again.";
      }
    },
  },
};
</script>


