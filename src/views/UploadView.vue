<template>
  <div class="upload-view">
    <ReceiptScanner @image-selected="onImageSelected" />
    <div v-if="error" class="status error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ReceiptScanner from '../components/ReceiptScanner.vue'
import { fetchReceipts } from '../utils/fetchReceipts'

const error = ref('')

async function onImageSelected(
  payload: { file: File; name: string } | undefined
) {
  if (!payload || !payload.file || !payload.name) {
    error.value = 'Ingen bild eller namn angivet'
    return
  }
  error.value = ''
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
    await fetchReceipts()
  } catch (e: any) {
    error.value = e.message || 'Något gick fel'
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
  position: relative;
}

.status.error {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 0.7rem 1.2rem;
  font-size: 0.9rem;
  z-index: 10;
  white-space: nowrap;
}
</style>
