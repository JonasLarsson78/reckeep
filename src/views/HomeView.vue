<template>
  <div class="home-view">
    <button class="logout-btn" @click="logout" style="float: right; margin: 1rem">
      Logga ut
    </button>
    <img
      src="/logo.png"
      alt="RecKeep Logo"
      style="width: 90%; margin-bottom: 1rem; border-radius: 10px"
    />
    <button class="main-btn" @click="goToUpload" style="margin-bottom: 2rem">
      <Upload :size="20" style="margin-right: 10px" />
      <span>Ladda upp nytt kvitto</span>
    </button>

    <ReceiptList @show-receipt="showReceipt" />

    <ReceiptImageModal
      :open="modalOpen"
      :img="modalImg"
      :error="modalError"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'
import { Upload } from '@lucide/vue'
import { fetchReceipts } from '../utils/fetchReceipts'
import { useRouter } from 'vue-router'
import { useReceiptsStore } from '../store/receiptsStore'
import ReceiptList from '../components/ReceiptList.vue'
import ReceiptImageModal from '../components/ReceiptImageModal.vue'

const authStore = useAuthStore()
const router = useRouter()
const receiptsStore = useReceiptsStore()

watch(
  () => authStore.token,
  (token) => {
    if (token) fetchReceipts()
  },
  { immediate: true }
)

onMounted(() => {
  if (!receiptsStore.loaded) {
    receiptsStore.loadFromStorage()
    if (!receiptsStore.loaded) {
      fetchReceipts()
    }
  }
})

function logout() {
  authStore.clearToken()
  router.push('/login')
}

function goToUpload() {
  router.push('/upload')
}

const modalOpen = ref(false)
const modalImg = ref<string | null>(null)
const modalError = ref<string | null>(null)

async function showReceipt(id: number) {
  modalOpen.value = true
  modalImg.value = null
  modalError.value = null
  try {
    const res = await fetch(`/api/receipt-image?id=${id}`)
    if (res.status === 404) {
      modalError.value =
        'Kvitto-bild hittades inte (404). Det kan bero på att bilden är borttagen eller aldrig laddades upp.'
      return
    }
    if (!res.ok) throw new Error('Kunde inte hämta bild')
    const data = await res.json()
    modalImg.value = `data:image/jpeg;base64,${data.imageBase64}`
  } catch (e: any) {
    modalError.value = e.message || 'Fel vid hämtning av bild.'
    modalImg.value = null
  }
}

function closeModal() {
  modalOpen.value = false
  modalImg.value = null
}
</script>

<style scoped lang="scss">
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
  position: fixed;
  top: 0;
  left: 0;
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
  pointer-events: none;
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
  &:hover {
    background: linear-gradient(90deg, #0072ff 0%, #00c6ff 100%);
  }
}
.logout-btn {
  width: fit-content;
  height: 25px;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(231, 76, 60, 0.2);
  transition: background 0.2s;
  margin-bottom: 10px;
}
</style>
