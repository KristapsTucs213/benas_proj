
<template>
  <div class="register-container">
    <h1>Register</h1>
    <form>
      <input type="text" placeholder="Username" />
      <input type="password" placeholder="Password" />
      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script>
import '@/css/RegisterView.css'
export default {
  name: "RegisterView",
};
</script>