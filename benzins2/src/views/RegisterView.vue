<template>
  <div class="register-container">
    <h1>Register</h1>
    <form @submit.prevent="register">
      <input
        type="text"
        v-model="first_name"
        placeholder="First Name"
        required
      />
      <input
        type="text"
        v-model="last_name"
        placeholder="Last Name"
        required
      />
      <input
        type="email"
        v-model="email"
        placeholder="Email"
        required
        :class="{ 'input-error': emailError }"
      />
      <span v-if="emailError" class="error-message">{{ emailError }}</span>

      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
      />
      <button type="submit">Register</button>
    </form>

    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
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
