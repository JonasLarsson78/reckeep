<template>
  <div class="receipts-list" v-if="receipts.length">
    <span class="receipts-header">
      <ReceiptText :size="30" style="margin-right: 10px" />
      <h3>Uppladdade kvitton</h3>
    </span>
    <ul>
      <li
        v-for="receipt in receipts"
        :key="receipt.id"
        @click="$emit('show-receipt', receipt.id)"
      >
        <span>
          <ReceiptText :size="20" style="margin-right: 10px" />
          <strong>{{ receipt.name }}</strong>
        </span>
        <span class="date">{{ formatDate(receipt.created_at) }}</span>
        <Trash2
          :size="20"
          color="#e74c3c"
          class="delete-icon"
          @click.stop="openDeleteModal(receipt.id)"
        />
      </li>
    </ul>
  </div>
  <div v-else>Inga kvitton hittades.</div>

  <DeleteModal
    :open="deleteModalOpen"
    @confirm="confirmDeleteReceipt"
    @cancel="closeDeleteModal"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ReceiptText, Trash2 } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { useReceiptsStore } from '../store/receiptsStore'
import { useAuthStore } from '../store/authStore'
import DeleteModal from './DeleteModal.vue'

defineEmits<{ 'show-receipt': [id: number] }>()

const receiptsStore = useReceiptsStore()
const authStore = useAuthStore()
const { receipts } = storeToRefs(receiptsStore)

const deleteModalOpen = ref(false)
const deleteTargetId = ref<number | null>(null)

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

function openDeleteModal(id: number) {
  deleteTargetId.value = id
  deleteModalOpen.value = true
}

function closeDeleteModal() {
  deleteModalOpen.value = false
  deleteTargetId.value = null
}

async function confirmDeleteReceipt() {
  if (!deleteTargetId.value) return
  try {
    const res = await fetch(`/api/delete-receipt?id=${deleteTargetId.value}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Kunde inte ta bort kvittot.')
      return
    }
    receiptsStore.removeReceipt(deleteTargetId.value)
    closeDeleteModal()
  } catch {
    alert('Fel vid borttagning av kvitto.')
  }
}
</script>

<style scoped lang="scss">
.receipts-list {
  width: 100%;
  max-width: 420px;
  background: transparent;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
  margin-bottom: 2rem;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #fff;
    text-align: center;
    font-weight: 600;
  }

  ul {
    max-height: calc(100vh - 220px);
    overflow-y: auto;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
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
    cursor: pointer;
  }
}
.receipts-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.2rem;
}
.date {
  margin-left: 1rem;
  color: #888;
  font-size: 0.95em;
}
.delete-icon {
  margin-left: 1rem;
  cursor: pointer;
}
</style>
