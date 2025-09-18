<template>
  <div class="login-container">
    <h1>Login</h1>
    <form>
      <input type="text" placeholder="Username" />
      <input type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import '@/css/LoginView.css'
export default {
  name: "LoginView",
};
</script>
