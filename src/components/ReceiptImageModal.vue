<template>
  <Teleport to="body">
    <div v-if="open" class="modal-bg" @click="$emit('close')">
      <div class="modal-wrapper" @click.stop>
        <img v-if="img" :src="img" alt="Kvitto" class="modal-img" />
        <div v-else-if="error" class="modal-loader error">{{ error }}</div>
        <div v-else class="modal-loader">Laddar bild...</div>
        <button class="modal-close" @click="$emit('close')">
          <SquareX :size="20" style="margin-right: 10px" />
          <span>Stäng</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { SquareX } from '@lucide/vue'

defineProps<{ open: boolean; img: string | null; error: string | null }>()
defineEmits<{ close: [] }>()
</script>

<style scoped lang="scss">
.modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(24, 28, 34, 0.97);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 95vw;
  max-height: 95vh;
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
  &.error {
    color: #e74c3c;
    font-weight: bold;
  }
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
  transition: background 0.2s;
  &:hover {
    background: #444;
  }
}
</style>
