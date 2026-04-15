<template>
  <div class="auth-page">
    <div class="glow glow-top" />
    <div class="glow glow-bottom" />
    <div class="auth-card">
      <div class="brand">RecKeep</div>
      <p class="brand-sub">Skapa ett konto</p>
      <form @submit.prevent="onRegister">
        <div class="field">
          <label for="username">Användarnamn</label>
          <input
            id="username"
            v-model="username"
            placeholder="Välj ett användarnamn"
            required
          />
        </div>
        <div class="field">
          <label for="password">Lösenord</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <button class="submit-btn" type="submit">Registrera</button>
      </form>
      <div v-if="error" class="error">{{ error }}</div>
      <router-link class="auth-link" to="/login">
        Redan medlem? Logga in
      </router-link>
    </div>
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
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.glow {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;

  &.glow-top {
    top: -25vh;
    right: -15vw;
    width: 55vw;
    height: 55vw;
    background: radial-gradient(
      circle,
      rgba(139, 92, 246, 0.25) 0%,
      transparent 70%
    );
  }

  &.glow-bottom {
    bottom: -25vh;
    left: -15vw;
    width: 55vw;
    height: 55vw;
    background: radial-gradient(
      circle,
      rgba(34, 211, 238, 0.15) 0%,
      transparent 70%
    );
  }
}

.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  backdrop-filter: blur(24px);
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.08);
}

.brand {
  text-align: center;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.4rem;
}

.brand-sub {
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 2rem 0;
}

.field {
  margin-bottom: 1.2rem;

  label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 0.45rem;
    letter-spacing: 0.02em;
  }

  input {
    width: 100%;
    padding: 0.85rem 1rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: $border-radius;
    color: #f1f5f9;
    font-size: 1rem;
    font-family: $font-family;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;

    &::placeholder {
      color: #334155;
    }

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
    }
  }
}

.submit-btn {
  width: 100%;
  padding: 0.95rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%);
  color: #fff;
  border: none;
  border-radius: $border-radius;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.4rem;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.35);
  transition:
    opacity 0.2s,
    transform 0.15s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    opacity: 1;
  }
}

.error {
  color: #f87171;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 10px;
}

.auth-link {
  display: block;
  text-align: center;
  margin-top: 1.5rem;
  color: #8b5cf6;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;

  &:hover {
    color: #22d3ee;
  }
}
</style>
