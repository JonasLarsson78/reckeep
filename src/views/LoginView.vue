<template>
  <div class="auth-form">
    <h2>Logga in</h2>
    <form @submit.prevent="onLogin">
      <input v-model="username" placeholder="Användarnamn" required />
      <input
        v-model="password"
        type="password"
        placeholder="Lösenord"
        required
      />
      <button type="submit">Logga in</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
    <router-link to="/register">Registrera dig</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../utils/request'
import { useAuthStore } from '../store/authStore'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const authStore = useAuthStore()

async function onLogin() {
  error.value = ''
  try {
    const result = await login(username.value, password.value)
    authStore.setToken(result.token)
    router.push('/')
  } catch (e: any) {
    error.value = e?.message || 'Fel vid inloggning'
  }
}
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>
