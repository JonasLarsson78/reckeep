<template>
  <Teleport to="body">
    <div v-if="open" class="modal-bg" @click="$emit('cancel')">
      <div class="modal-content" @click.stop>
        <div class="icon-wrap">
          <Trash2 :size="24" color="#ef4444" />
        </div>
        <div class="title">Ta bort kvitto?</div>
        <div class="desc">
          Detta går inte att ångra.
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
  background: rgba(13, 13, 20, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 360px;
  background: rgba(20, 14, 38, 0.95);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 24px;
  padding: 2rem 1.8rem;
  backdrop-filter: blur(24px);
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(139, 92, 246, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.icon-wrap {
  width: 52px;
  height: 52px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.4rem;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f1f5f9;
}

.desc {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
}

.actions {
  display: flex;
  gap: 0.8rem;
  width: 100%;
}

.btn-cancel {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.btn-delete {
  flex: 1;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(239, 68, 68, 0.25);
  }
}
</style>
