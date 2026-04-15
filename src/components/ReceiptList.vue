<template>
  <div class="receipts-list" v-if="receipts.length">
    <div class="list-header">
      <ReceiptText :size="16" color="#8b5cf6" />
      <span>Uppladdade kvitton</span>
    </div>
    <ul>
      <li
        v-for="receipt in receipts"
        :key="receipt.id"
        @click="$emit('show-receipt', receipt.id)"
      >
        <span class="receipt-name">
          <strong>{{ receipt.name }}</strong>
        </span>
        <span class="date">{{ formatDate(receipt.created_at) }}</span>
        <Trash2
          :size="18"
          class="delete-icon"
          @click.stop="openDeleteModal(receipt.id)"
        />
      </li>
    </ul>
  </div>
  <div v-else class="empty-state">
    <ReceiptText :size="40" color="#1e293b" />
    <p>Inga kvitton uppladdade än</p>
  </div>

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
}

.list-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #475569;
  margin-bottom: 0.9rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

li {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    transform 0.15s;

  &:hover {
    background: rgba(139, 92, 246, 0.08);
    border-color: rgba(139, 92, 246, 0.25);
    transform: translateY(-1px);
  }
}

.receipt-name {
  flex: 1;
  min-width: 0;
  font-size: 0.97rem;
  color: #e2e8f0;

  strong {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }
}

.date {
  color: #475569;
  font-size: 0.8rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.delete-icon {
  color: #475569;
  flex-shrink: 0;
  transition: color 0.15s;

  &:hover {
    color: #ef4444;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  color: #334155;
  font-size: 0.9rem;
  padding: 3rem 1rem;

  p {
    margin: 0;
  }
}
</style>
