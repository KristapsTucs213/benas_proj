<template>
  <div class="app-background d-flex justify-content-center align-items-center py-5">
    <div class="card shadow-lg border-0 p-5 text-center" style="max-width: 500px; width: 100%;">
      <h2 class="fw-bold mb-4 text-dark">Create Account</h2>

      <form @submit.prevent="register" class="text-start">
        <div class="mb-3">
          <label class="form-label fw-semibold">First Name</label>
          <input v-model="first_name" type="text" class="form-control form-control-lg" required />
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Last Name</label>
          <input v-model="last_name" type="text" class="form-control form-control-lg" required />
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Email</label>
          <input v-model="email" type="email" class="form-control form-control-lg" required />
        </div>
        <div class="mb-4">
          <label class="form-label fw-semibold">Password</label>
          <input v-model="password" type="password" class="form-control form-control-lg" required />
        </div>
        <button class="btn btn-warning w-100 btn-lg fw-bold">Register</button>
      </form>
    </div>
  </div>
</template>



<script>
import axios from "axios";
import "@/css/RegisterView.css";

export default {
  name: "RegisterView",
  data() {
    return {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      emailError: "",
      successMessage: "",
    };
  },
  methods: {
    async register() {
      this.emailError = "";
      this.successMessage = "";

      try {
        const response = await axios.post("http://localhost:5001/register", {
          first_name: this.first_name,
          last_name: this.last_name,
          email: this.email,
          password: this.password,
        });

        this.successMessage = response.data.message;
        this.first_name = "";
        this.last_name = "";
        this.email = "";
        this.password = "";
      } catch (error) {
        if (error.response && error.response.status === 409) {
          this.emailError = error.response.data.error;
        } else {
          this.emailError = "Registration failed. Email already in use.";
        }
      }
    },
  },
};
</script>
