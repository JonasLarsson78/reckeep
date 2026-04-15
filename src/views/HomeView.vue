<template>
  <div class="home-view">
    <div class="glow glow-top" />
    <div class="glow glow-bottom" />

    <header class="header">
      <div class="logo-wrap">
        <span class="logo">RecKeep</span>
        <span class="version">v{{ version }}</span>
      </div>
      <button class="logout-btn" @click="logout">
        <LogOut :size="15" />
        Logga ut
      </button>
    </header>

    <main class="content">
      <button class="upload-btn" @click="goToUpload">
        <Upload :size="20" />
        Ladda upp nytt kvitto
      </button>
      <ReceiptList @show-receipt="showReceipt" />
    </main>

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
import { Upload, LogOut } from '@lucide/vue'
import { fetchReceipts } from '../utils/fetchReceipts'
import { useRouter } from 'vue-router'
import { useReceiptsStore } from '../store/receiptsStore'
import ReceiptList from '../components/ReceiptList.vue'
import ReceiptImageModal from '../components/ReceiptImageModal.vue'

const version = __APP_VERSION__

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
.home-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.glow {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;

  &.glow-top {
    top: -20vh;
    right: -10vw;
    width: 55vw;
    height: 55vw;
    background: radial-gradient(
      circle,
      rgba(139, 92, 246, 0.2) 0%,
      transparent 70%
    );
  }

  &.glow-bottom {
    bottom: -20vh;
    left: -10vw;
    width: 55vw;
    height: 55vw;
    background: radial-gradient(
      circle,
      rgba(34, 211, 238, 0.12) 0%,
      transparent 70%
    );
  }
}

.header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.logo-wrap {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.version {
  font-size: 0.72rem;
  color: #334155;
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  padding: 0.45rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.16);
  }
}

.content {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem 2rem;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  max-width: 420px;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 24px rgba(139, 92, 246, 0.35);
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
</style>
