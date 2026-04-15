<template>
  <Teleport to="body">
    <div v-if="open" class="modal-bg" @click="$emit('close')">
      <div class="modal-wrapper" @click.stop>
        <img v-if="img" :src="img" alt="Kvitto" class="modal-img" />
        <div v-else-if="error" class="modal-msg error">{{ error }}</div>
        <div v-else class="modal-msg">
          <div class="spinner" />
          Laddar bild...
        </div>
        <button class="close-btn" @click="$emit('close')">
          <X :size="18" />
          Stäng
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from '@lucide/vue'

defineProps<{ open: boolean; img: string | null; error: string | null }>()
defineEmits<{ close: [] }>()
</script>

<style scoped lang="scss">
.modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(13, 13, 20, 0.92);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  max-width: 95vw;
  max-height: 95vh;
}

.modal-img {
  max-width: 90vw;
  max-height: 78vh;
  border-radius: 16px;
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  object-fit: contain;
}

.modal-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #64748b;
  font-size: 1rem;
  padding: 3rem;

  &.error {
    color: #f87171;
    font-size: 0.9rem;
    text-align: center;
    max-width: 300px;
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid rgba(239, 68, 68, 0.15);
    border-radius: 16px;
    padding: 1.5rem;
  }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.close-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  border-radius: 12px;
  padding: 0.65rem 1.4rem;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #f1f5f9;
  }
}
</style>
