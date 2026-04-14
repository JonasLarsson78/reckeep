<template>
  <div class="auth-form">
    <h2>Registrera</h2>
    <form @submit.prevent="onRegister">
      <div class="input-group">
        <label for="username">Användarnamn</label>
        <input
          id="username"
          v-model="username"
          placeholder="Användarnamn"
          required
        />
      </div>
      <div class="input-group">
        <label for="password">Lösenord</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Lösenord"
          required
        />
      </div>
      <button class="main-btn" type="submit">Registrera</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
    <router-link class="login-link" to="/login"
      >Redan medlem? Logga in</router-link
    >
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../utils/request'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

async function onRegister() {
  error.value = ''
  try {
    await register(username.value, password.value)
    router.push('/')
  } catch (e: any) {
    error.value = e?.message || 'Registrering misslyckades'
  }
}
</script>

<style scoped lang="scss">
@import '../scss/variabels.scss';
.auth-form {
  max-width: 380px;
  margin: 3rem auto;
  padding: $padding * 2.5 $padding * 2 $padding * 2 $padding * 2;
  border-radius: $border-radius * 2;
  background: #181c22;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #fff;
  font-weight: 700;
  letter-spacing: 1px;
}
.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}
label {
  margin-bottom: 0.5rem;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
}
input {
  padding: 0.75rem 1rem;
  border: 1px solid #444;
  border-radius: $border-radius;
  font-size: 1rem;
  background: #181c22;
  color: #fff;
  transition: border 0.2s;
  font-family: $font-family;
}
input:focus {
  border: 1.5px solid $primary-color;
  outline: none;
}
.main-btn {
  width: 100%;
  padding: 0.9rem 0;
  background: linear-gradient(
    90deg,
    $primary-color 0%,
    $primary-color-hover 100%
  );
  color: $button-text-color;
  border: none;
  border-radius: $border-radius;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px 0 rgba(79, 140, 255, 0.08);
  transition: background 0.2s;
}
.main-btn:hover {
  background: linear-gradient(
    90deg,
    $primary-color-hover 0%,
    $primary-color 100%
  );
}
.error {
  color: $alert-color;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
}
.login-link {
  display: block;
  text-align: center;
  margin-top: 2rem;
  color: $primary-color;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
}
.login-link:hover {
  text-decoration: underline;
}
</style>
