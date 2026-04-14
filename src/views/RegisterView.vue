<template>
  <div class="auth-form">
    <h2>Registrera</h2>
    <form @submit.prevent="onRegister">
      <input v-model="username" placeholder="Användarnamn" required />
      <input
        v-model="password"
        type="password"
        placeholder="Lösenord"
        required
      />
      <button type="submit">Registrera</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
    <router-link to="/login">Redan medlem? Logga in</router-link>
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
    router.push('/login')
  } catch (e: any) {
    error.value = e?.message || 'Fel vid registrering'
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
