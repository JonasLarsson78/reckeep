<template>
  <Teleport to="body">
    <div v-if="open" class="modal-bg" @click="$emit('cancel')">
      <div class="modal-content" @click.stop>
        <Trash2 :size="38" color="#e74c3c" class="icon" />
        <div class="title">Ta bort kvitto?</div>
        <div class="desc">
          Är du säker på att du vill ta bort detta kvitto? Detta går inte att
          ångra.
        </div>
        <div class="actions">
          <button class="btn-cancel" @click="$emit('cancel')">Avbryt</button>
          <button class="btn-delete" @click="$emit('confirm')">Ta bort</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Trash2 } from '@lucide/vue'

defineProps<{ open: boolean }>()
defineEmits<{ cancel: []; confirm: [] }>()
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
.modal-content {
  max-width: 400px;
  background: #23272f;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.icon {
  margin-bottom: 1.2rem;
}
.title {
  font-size: 1.18rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  text-align: center;
  color: #fff;
}
.desc {
  color: #bbb;
  font-size: 1.02rem;
  margin-bottom: 2rem;
  text-align: center;
}
.actions {
  display: flex;
  gap: 1.2rem;
}
.btn-cancel {
  background: #444;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-delete {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
}
</style>
