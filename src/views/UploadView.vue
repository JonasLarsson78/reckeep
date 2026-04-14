<template>
  <div class="upload-view">
    <ReceiptScanner @image-selected="onImageSelected" />
    <div v-if="loading" class="status">Laddar upp kvitto...</div>
    <div v-if="error" class="status error">{{ error }}</div>
    <div v-if="success" class="status success">Kvitto sparat!</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ReceiptScanner from '../components/ReceiptScanner.vue'
import { fetchReceipts } from '../utils/fetchReceipts'
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function onImageSelected(payload: { file: File; name: string }) {
  error.value = ''
  success.value = false
  loading.value = true
  try {
    const base64 = await fileToBase64(payload.file)
    const res = await fetch('/api/scan-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64.split(',')[1],
        name: payload.name,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Fel vid uppladdning')
    }
    success.value = true
    // Navigera bara automatiskt om användaren inte redan tryckt på tillbaka
    // (Knappen goBack navigerar direkt)
    // Om du vill ha kvar automatisk navigering, ta bort kommentaren nedan:
    // setTimeout(() => { router.push('/') }, 1200)
    await fetchReceipts()
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

<style scoped lang="scss">
.upload-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 2.5rem 1rem 1.5rem 1rem;
  width: 100vw;
  min-height: 100vh;
  box-sizing: border-box;
  background: #181c22;
  color: #fff;
}
.upload-view::before {
  content: '';
  position: absolute;
  top: -20vw;
  left: -20vw;
  width: 80px;
  max-width: 80px;
  min-width: 60px;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 2.5rem 1rem 1.5rem 1rem;
  width: 100vw;
  min-height: 100vh;
  height: 100vh;
  box-sizing: border-box;
  background: #181c22;
  color: #fff;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  right: -25vw;
  width: 70vw;
  height: 70vw;
  background: radial-gradient(
    circle at 70% 70%,
    #ffb347 0%,
    #ff5e62 60%,
    transparent 100%
  );
  filter: blur(60px) brightness(1.1);
  opacity: 0.25;
  z-index: 0;
}
.main-btn {
  background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0.9rem 2.1rem;
  font-size: 1.13rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: background 0.2s;
}
.main-btn:hover {
  background: linear-gradient(90deg, #0072ff 0%, #00c6ff 100%);
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
