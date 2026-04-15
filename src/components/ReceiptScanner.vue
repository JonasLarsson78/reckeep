<template>
  <div class="scanner-bg">
    <div class="glow glow-top" />
    <div class="glow glow-bottom" />

    <div class="scanner-card">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="18" />
        Tillbaka
      </button>

      <div class="card-header">
        <div class="icon-wrap">
          <Camera :size="24" color="#8b5cf6" />
        </div>
        <h2 class="title">Skanna kvitto</h2>
        <p class="desc">Ta en bild eller välj från galleriet.</p>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="onFileChange"
        :disabled="loading"
        style="display: none"
      />

      <div class="name-field">
        <input
          v-model="receiptName"
          type="text"
          placeholder="Namn på kvittot"
          class="name-input"
          :class="{ 'name-input--error': nameError }"
          :disabled="loading"
          @input="nameError = ''"
        />
        <span v-if="nameError" class="name-error">{{ nameError }}</span>
      </div>

      <button class="pick-btn" @click="triggerFileInput" :disabled="loading">
        <Camera :size="18" />
        <span v-if="!imageFile">Välj eller ta bild</span>
        <span v-else>Byt bild</span>
      </button>

      <div v-if="imageUrl && !uploadSuccess" class="preview-wrapper">
        <template v-if="!loading">
          <advanced-cropper
            :src="imageUrl"
            :autoZoom="true"
            :stencil-component="RectangleStencil"
            imageRestriction="fit-area"
            :defaultBoundaries="'fit'"
            @change="onCropChange"
            class="cropper"
          />
        </template>
        <template v-else>
          <div class="loader-wrap">
            <div class="spinner" />
            <span>Laddar upp...</span>
          </div>
        </template>
      </div>

      <button
        v-if="imageFile && !loading && !uploadSuccess"
        class="upload-btn"
        @click="emitImage"
      >
        Ladda upp kvitto
      </button>

      <div v-if="uploadSuccess" class="success">
        Kvitto uppladdat!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Camera } from '@lucide/vue'
import {
  Cropper as AdvancedCropper,
  RectangleStencil,
} from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const router = useRouter()
const emit = defineEmits(['image-selected'])
const imageFile = ref<File | null>(null)
const imageUrl = ref<string | null>(null)
const loading = ref(false)
const uploadSuccess = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const receiptName = ref('')
const cropData = ref<any>(null)
const nameError = ref('')

function triggerFileInput() {
  fileInput.value?.click()
}

function goBack() {
  router.push('/')
}

function onFileChange(e: Event) {
  uploadSuccess.value = false
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    imageFile.value = target.files[0]
    imageUrl.value = URL.createObjectURL(target.files[0])
    cropData.value = null
  }
}

function onCropChange({ coordinates, canvas }: any) {
  cropData.value = { coordinates, canvas }
}

async function emitImage() {
  if (!receiptName.value.trim()) {
    nameError.value = 'Ange ett namn på kvittot innan du laddar upp.'
    return
  }
  if (imageFile.value && receiptName.value.trim()) {
    loading.value = true
    let fileToSend = imageFile.value
    if (cropData.value && cropData.value.canvas) {
      const blob = await new Promise<Blob | null>((resolve) =>
        cropData.value.canvas.toBlob(resolve, 'image/jpeg')
      )
      if (blob) {
        fileToSend = new File([blob], imageFile.value.name, {
          type: 'image/jpeg',
        })
      }
    }
    emit('image-selected', { file: fileToSend, name: receiptName.value })
    setTimeout(() => {
      loading.value = false
      uploadSuccess.value = true
      imageFile.value = null
      imageUrl.value = null
      receiptName.value = ''
      cropData.value = null
      setTimeout(() => router.push('/'), 1000)
    }, 2000)
  }
}
</script>

<style scoped lang="scss">
.scanner-bg {
  position: fixed;
  inset: 0;
  background: #0d0d14;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 1.5rem 1rem 3rem;
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

.scanner-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 1.5rem 1.5rem 2rem;
  backdrop-filter: blur(20px);
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(139, 92, 246, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: #94a3b8;
  border-radius: 10px;
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f1f5f9;
  }
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
}

.icon-wrap {
  width: 52px;
  height: 52px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.4rem;
}

.title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.desc {
  color: #475569;
  font-size: 0.88rem;
  margin: 0;
}

.name-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.name-error {
  font-size: 0.82rem;
  color: #f87171;
}

.name-input {
  width: 100%;
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: #f1f5f9;
  font-size: 1rem;
  font-family: inherit;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &::placeholder {
    color: #334155;
  }

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  }

  &.name-input--error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
  }

  &:disabled {
    opacity: 0.5;
  }
}

.pick-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.25);
  color: #a78bfa;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.2);
    color: #c4b5fd;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.preview-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 50vh;
  overflow: hidden;
  border-radius: 14px;
}

.cropper {
  width: 100%;
  height: 280px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 14px;
}

.loader-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #64748b;
  font-size: 0.9rem;
  padding: 2rem;
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

.upload-btn {
  width: 100%;
  padding: 0.95rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.35);
  transition:
    opacity 0.2s,
    transform 0.15s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.success {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #4ade80;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: 12px;
  padding: 0.75rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 500;
  width: 100%;
  justify-content: center;
}
</style>
