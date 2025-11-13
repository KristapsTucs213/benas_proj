<template>
  <div
    class="app-background d-flex justify-content-center align-items-center py-5"
  >
    <div
      class="card shadow-lg border-0 p-5 text-center"
      style="max-width: 500px; width: 100%"
    >
      <h2 class="fw-bold mb-4 text-dark">Login</h2>

      <form @submit.prevent="login" class="text-start">
        <div class="mb-3">
          <label for="emailllll" class="form-label fw-semibold">Email</label>
          <input
            id="emailllll"
            v-model="email"
            type="email"
            class="form-control form-control-lg"
            placeholder="Enter your email"
            required
          />
        </div>
        <div class="mb-4">
          <label for="passss" class="form-label fw-semibold">Password</label>
          <input
            id="passss"
            v-model="password"
            type="password"
            class="form-control form-control-lg"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" class="btn btn-warning w-100 btn-lg fw-bold">
          Login
        </button>
      </form>

      <p v-if="errorMessage" class="text-danger mt-3 text-center">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import "@/css/LoginView.css";
import { userStore } from "@/store/userStore";

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
          userStore.setUser(response.data.user);

          this.$router.push("/");
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.error || "Invalid email or password.";
      }
    },
  },
};
</script>
