<template>
  <div class="home-view">
    <button class="main-btn" @click="goToUpload" style="margin-bottom: 2rem">
      <Upload :size="20" style="margin-right: 10px" />
      <span>Ladda upp nytt kvitto</span>
    </button>
    <div class="receipts-list" v-if="receipts.length">
      <h3>Uppladdade kvitton</h3>
      <ul>
        <li
          v-for="receipt in receipts"
          :key="receipt.id"
          @click="showReceipt(receipt.id)"
          style="cursor: pointer"
        >
          <span>
            <ReceiptText :size="20" style="margin-right: 10px" />
            <strong>{{ receipt.name }}</strong>
          </span>
          <span style="margin-left: 1rem; color: #888; font-size: 0.95em">{{
            formatDate(receipt.created_at)
          }}</span>
        </li>
      </ul>
    </div>
    <div v-if="modalOpen" class="modal-bg" @click="closeModal">
      <div class="modal-img-wrapper" @click.stop>
        <img v-if="modalImg" :src="modalImg" alt="Kvitto" class="modal-img" />
        <div v-else class="modal-loader">Laddar bild...</div>
        <button class="modal-close" @click="closeModal">
          <SquareX :size="20" style="margin-right: 10px" />
          <span>Stäng</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, ReceiptText, SquareX } from '@lucide/vue'
const modalOpen = ref(false)
const modalImg = ref<string | null>(null)
async function showReceipt(id: number) {
  modalOpen.value = true
  modalImg.value = null
  try {
    const res = await fetch(`/api/receipt-image?id=${id}`)
    if (!res.ok) throw new Error('Kunde inte hämta bild')
    const data = await res.json()
    modalImg.value = `data:image/jpeg;base64,${data.imageBase64}`
  } catch {
    modalImg.value = null
  }
}
function closeModal() {
  modalOpen.value = false
  modalImg.value = null
}
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useReceiptsStore } from '../store/receiptsStore'

const router = useRouter()
const receiptsStore = useReceiptsStore()
const { receipts, loaded } = storeToRefs(receiptsStore)

function goToUpload() {
  router.push('/upload')
}

async function fetchReceipts() {
  try {
    const res = await fetch('/api/receipts')
    if (!res.ok) return
    const data = await res.json()
    receiptsStore.setReceipts(data.receipts || [])
  } catch {}
}

onMounted(() => {
  if (!loaded.value) {
    receiptsStore.loadFromStorage()
    if (!receiptsStore.loaded) {
      fetchReceipts()
    }
  }
})

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d
    .toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(/\./g, '-')
    .replace(',', '')
}
</script>

<style lang="scss" scoped>
.modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-img-wrapper {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.modal-img {
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 14px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.25);
}
.modal-loader {
  color: #fff;
  font-size: 1.2rem;
  padding: 2rem;
}
.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: background 0.2s;
}
.modal-close:hover {
  background: #444;
}
body,
html {
  margin: 0;
  padding: 0;
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  background: linear-gradient(135deg, #232526 0%, #414345 100%);
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
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
  background: #181c22;
  color: #fff;
  height: 100vh;
  overflow: hidden;
}
.home-view::before {
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
.receipts-list {
  width: 100%;
  max-width: 420px;
  background: transparent;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
  margin-bottom: 2rem;
}
.receipts-list h3 {
  margin-top: 0;
  margin-bottom: 1.2rem;
  font-size: 1.25rem;
  color: #fff;
  text-align: center;
  font-weight: 600;
}
.receipts-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.receipts-list li {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-bottom: 0.7rem;
  padding: 0.85rem 1rem;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.08rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
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
</style>
