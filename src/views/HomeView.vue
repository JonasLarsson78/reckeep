<template>
  <div class="home-view">
    <ReceiptScanner @image-selected="onImageSelected" />
    <div v-if="loading" class="status">Laddar upp kvitto...</div>
    <div v-if="error" class="status error">{{ error }}</div>
    <div v-if="success" class="status success">Kvitto sparat!</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ReceiptScanner from '../components/ReceiptScanner.vue'

const loading = ref(false)
const error = ref('')
const success = ref(false)

async function onImageSelected(file: File) {
  error.value = ''
  success.value = false
  loading.value = true
  try {
    const base64 = await fileToBase64(file)
    const res = await fetch('/api/scan-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64.split(',')[1] }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Fel vid uppladdning')
    }
    success.value = true
  } catch (e: any) {
    error.value = e.message || 'Något gick fel'
  } finally {
    loading.value = false
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
</script>

<style lang="scss" scoped>
body,
html {
  margin: 0;
  padding: 0;
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  background: linear-gradient(135deg, #232526 0%, #414345 100%);
  min-height: 100vh;
}
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 2.5rem 1rem 1.5rem 1rem;
  width: 100vw;
  min-height: 100vh;
  box-sizing: border-box;
  background: transparent;
}
.status {
  margin: 1.2rem 0 0.7rem 0;
  font-size: 1.15rem;
  text-align: center;
  padding: 0.7rem 1.2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  letter-spacing: 0.01em;
}
.status.error {
  color: #ff5252;
  background: rgba(255, 82, 82, 0.08);
}
.status.success {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.08);
}
</style>
