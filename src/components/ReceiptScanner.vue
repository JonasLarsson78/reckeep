<template>
  <div class="receipt-bg">
    <div class="receipt-scanner">
      <button
        class="main-btn"
        @click="goBack"
        style="
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5em;
        "
      >
        <ArrowLeft :size="20" />
        Tillbaka till lista
      </button>
      <div class="icon-wrapper">
        <Camera :size="30" color="#00c6ff" />
      </div>
      <h2 class="title">Skanna kvitto</h2>
      <p class="desc">
        Ta en bild på ditt kvitto eller ladda upp från mobilen.
      </p>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        @change="onFileChange"
        :disabled="loading"
        style="display: none"
      />
      <input
        v-model="receiptName"
        type="text"
        placeholder="Namn på kvittot"
        class="name-input"
        :disabled="loading"
      />
      <button class="main-btn" @click="triggerFileInput" :disabled="loading">
        <Camera :size="20" style="margin-right: 10px" />
        <span v-if="!imageFile"> Välj eller ta bild</span>
        <span v-else>Byt bild</span>
      </button>
      <div v-if="imageUrl && !uploadSuccess" class="image-preview-wrapper">
        <template v-if="!loading">
          <img
            :src="imageUrl"
            alt="Scanned receipt preview"
            class="receipt-image"
          />
        </template>
        <template v-else>
          <div class="loader-wrapper">
            <div class="loader"></div>
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
      <!-- Loader visas nu i preview ovan -->
      <div v-if="uploadSuccess" class="success-message">
        ✅ Kvitto uppladdat!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Camera } from '@lucide/vue'

// OpenCV.js laddningsstatus
const cvReady = ref(false)
function waitForOpenCV() {
  return new Promise<void>((resolve) => {
    if ((window as any).cv && (window as any).cv.imread) {
      cvReady.value = true
      resolve()
    } else {
      const check = setInterval(() => {
        if ((window as any).cv && (window as any).cv.imread) {
          cvReady.value = true
          clearInterval(check)
          resolve()
        }
      }, 100)
    }
  })
}

const router = useRouter()

const emit = defineEmits(['image-selected'])

const imageFile = ref<File | null>(null)
const imageUrl = ref<string | null>(null)
const loading = ref(false)
const uploadSuccess = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const receiptName = ref('')

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
    // Auto-crop kvitto
    autoCropReceipt(target.files[0])
  }
}

async function autoCropReceipt(file: File) {
  await waitForOpenCV()
  const img = new Image()
  img.onload = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    // Läs in bilden till OpenCV
    const cv = (window as any).cv
    let src = cv.imread(canvas)
    let dst = new cv.Mat()
    // Förbehandling: gråskala & blur
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)
    cv.GaussianBlur(src, src, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT)
    // Kantdetektering
    cv.Canny(src, dst, 50, 150)
    // Hitta konturer
    let contours = new cv.MatVector()
    let hierarchy = new cv.Mat()
    cv.findContours(
      dst,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    )
    // Försök hitta bästa kvittoliknande kontur (vit, rektangulär, stor)
    let imgArea = img.width * img.height
    let bestScore = 0
    let bestQuad = null
    let largestRect = null
    let largestRectArea = 0
    for (let i = 0; i < contours.size(); i++) {
      let cnt = contours.get(i)
      let peri = cv.arcLength(cnt, true)
      let approx = new cv.Mat()
      cv.approxPolyDP(cnt, approx, 0.02 * peri, true)
      let area = cv.contourArea(cnt)
      // Spara största rektangel för fallback
      if (area > largestRectArea) {
        largestRectArea = area
        largestRect = cnt
      }
      if (approx.rows === 4 && area > 0.05 * imgArea) {
        // Rektangulärhetskvot
        let rect = cv.boundingRect(approx)
        let aspect = rect.height / rect.width
        // Tillåt bredare kvitton (1.0-10.0)
        if (aspect > 1.0 && aspect < 10.0) {
          // Kontrollera medelvärde på ROI (ska vara ljust/"vitt")
          let mask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1)
          cv.drawContours(mask, new cv.MatVector([approx]), 0, new cv.Scalar(255), -1)
          let mean = cv.mean(src, mask)[0]
          mask.delete()
          // Score: area * vithet * rektanguläritet
          let score = area * (mean / 255) * (2 - Math.abs(aspect - 3) / 3)
          if (score > bestScore) {
            if (bestQuad) bestQuad.delete()
            bestScore = score
            bestQuad = approx
          } else {
            approx.delete()
          }
        } else {
          approx.delete()
        }
      } else {
        approx.delete()
      }
    }
    let croppedDataUrl = ''
    if (bestQuad && bestScore > 0) {
      // Sortera hörn: [top-left, top-right, bottom-right, bottom-left]
      let pts = []
      for (let i = 0; i < 4; i++) {
        pts.push({
          x: bestQuad.intPtr(i, 0)[0],
          y: bestQuad.intPtr(i, 0)[1],
        })
      }
      pts.sort((a, b) => a.y - b.y)
      let top = pts.slice(0, 2).sort((a, b) => a.x - b.x)
      let bottom = pts.slice(2, 4).sort((a, b) => a.x - b.x)
      let ordered = [top[0], top[1], bottom[1], bottom[0]]
      let w1 = Math.hypot(ordered[1].x - ordered[0].x, ordered[1].y - ordered[0].y)
      let w2 = Math.hypot(ordered[2].x - ordered[3].x, ordered[2].y - ordered[3].y)
      let h1 = Math.hypot(ordered[3].x - ordered[0].x, ordered[3].y - ordered[0].y)
      let h2 = Math.hypot(ordered[2].x - ordered[1].x, ordered[2].y - ordered[1].y)
      let maxWidth = Math.max(w1, w2)
      let maxHeight = Math.max(h1, h2)
      let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        ordered[0].x, ordered[0].y,
        ordered[1].x, ordered[1].y,
        ordered[2].x, ordered[2].y,
        ordered[3].x, ordered[3].y,
      ])
      let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        maxWidth, 0,
        maxWidth, maxHeight,
        0, maxHeight,
      ])
      let M = cv.getPerspectiveTransform(srcTri, dstTri)
      let warped = new cv.Mat()
      cv.warpPerspective(src, warped, M, new cv.Size(maxWidth, maxHeight))
      // Konvertera till dataURL
      let warpCanvas = document.createElement('canvas')
      warpCanvas.width = maxWidth
      warpCanvas.height = maxHeight
      cv.imshow(warpCanvas, warped)
      croppedDataUrl = warpCanvas.toDataURL('image/jpeg', 0.95)
      imageUrl.value = croppedDataUrl
      // Konvertera till File-objekt
      const arr = croppedDataUrl.split(',')
      const mimeMatch = arr[0].match(/:(.*?);/)
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) u8arr[n] = bstr.charCodeAt(n)
      imageFile.value = new File(
        [u8arr],
        file.name.replace(/\.[^.]+$/, '') + '-cropped.jpg',
        { type: mime }
      )
      // Clean up
      warped.delete()
      M.delete()
      srcTri.delete()
      dstTri.delete()
      bestQuad.delete()
    } else if (largestRect && largestRectArea > 0.05 * imgArea) {
      // Fallback: bounding rect på största kontur
      let rect = cv.boundingRect(largestRect)
      const cropCanvas = document.createElement('canvas')
      cropCanvas.width = rect.width
      cropCanvas.height = rect.height
      const cropCtx = cropCanvas.getContext('2d')!
      cropCtx.drawImage(
        img,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        rect.width,
        rect.height
      )
      croppedDataUrl = cropCanvas.toDataURL('image/jpeg', 0.95)
      imageUrl.value = croppedDataUrl
      // Konvertera till File-objekt
      const arr = croppedDataUrl.split(',')
      const mimeMatch = arr[0].match(/:(.*?);/)
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) u8arr[n] = bstr.charCodeAt(n)
      imageFile.value = new File(
        [u8arr],
        file.name.replace(/\.[^.]+$/, '') + '-cropped.jpg',
        { type: mime }
      )
    } else {
      // Om ingen tydlig kontur hittas, visa original
      imageUrl.value = canvas.toDataURL('image/jpeg', 0.95)
      imageFile.value = file
    }
    src.delete()
    dst.delete()
    contours.delete()
    hierarchy.delete()
  }
  img.src = URL.createObjectURL(file)
}

async function emitImage() {
  if (imageFile.value && receiptName.value.trim()) {
    loading.value = true
    emit('image-selected', {
      file: imageFile.value,
      name: receiptName.value,
    })
    // Vänta på att HomeView hanterar uppladdning, simulera delay för loader
    setTimeout(() => {
      loading.value = false
      uploadSuccess.value = true
      imageFile.value = null
      imageUrl.value = null
      receiptName.value = ''
    }, 2000)
  }
}
</script>

<style scoped lang="scss">
.success-message {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.08);
  font-size: 1.1rem;
  text-align: center;
  margin-top: 1.2rem;
  padding: 0.7rem 1.2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.no-scroll {
  overflow: hidden;
  height: 100vh;
}
html,
body {
  margin: 0;
  padding: 0;
  background: #181c22;
  width: 100vw;
  min-height: 100vh;
  box-sizing: border-box;
}
.receipt-bg {
  padding-top: 20px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #181c22;
  overflow: hidden;
  z-index: 0;
}

@media (min-width: 600px) {
  .receipt-scanner {
    width: 100%;
    padding: 1.2rem 0.5rem 1.2rem 0.5rem;
    border-radius: 14px;
    max-width: 98vw;
    min-width: 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  .main-btn,
  .upload-btn {
    max-width: 100vw;
    font-size: 1rem;
    padding-left: 0;
    padding-right: 0;
  }
  .name-input {
    width: 100%;
    min-width: 0;
    font-size: 1rem;
    padding-left: 0.9rem;
    padding-right: 0.9rem;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
  }
  .image-preview-wrapper {
    max-height: 40vh;
  }
  .receipt-image {
    max-width: 98vw;
    max-height: 35vh !important;
  }
}
@media (min-width: 600px) {
  .receipt-scanner {
    padding: 1.2rem 0.5rem 1.2rem 0.5rem;
    border-radius: 14px;
    max-width: 98vw;
    min-width: 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  .main-btn,
  .upload-btn {
    max-width: 100vw;
    font-size: 1rem;
    padding-left: 0;
    padding-right: 0;
  }
  .name-input {
    width: 100%;
    min-width: 0;
    font-size: 1rem;
    padding-left: 0.9rem;
    padding-right: 0.9rem;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
  }
  .image-preview-wrapper {
    max-height: 40vh;
  }
  .receipt-image {
    max-width: 98vw;
    max-height: 35vh;
  }
}
.receipt-bg::before {
  content: '';
  position: absolute;
  top: -20vw;
  left: -20vw;
  width: 80px;
  max-width: 80px;
  min-width: 60px;
  height: auto;
  display: block;
  margin: 10px auto 0 auto;
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.13);
  object-fit: contain;
  background: #fff;
  z-index: 0;
}
.receipt-bg::after {
  content: '';
  position: absolute;
  bottom: -25vw;
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
.receipt-scanner {
  position: relative;
  z-index: 1;
  .receipt-scanner {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 1.1rem;
    background: rgba(30, 32, 34, 0.92);
    border-radius: 22px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.13);
    padding: 2.2rem 1.2rem 2rem 1.2rem;
    margin-bottom: 1.5rem;
  }
  .icon-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .title {
    color: #fff;
    font-size: 1.45rem;
    font-weight: 700;
    margin: 0 0 0.2rem 0;
    letter-spacing: 0.01em;
    text-align: center;
  }
  .desc {
    color: #b0b8c1;
    font-size: 1.05rem;
    margin: 0 0 1.1rem 0;
    text-align: center;
  }
  .main-btn {
    width: 100%;
    max-width: 220px;
    padding: 0.7rem 0;
    font-size: 1.05rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(90deg, #1976d2 60%, #00c6ff 100%);
    color: #fff;
    font-weight: 700;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition:
      background 0.2s,
      transform 0.1s;
    letter-spacing: 0.01em;
    margin-bottom: 0.5rem;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0.01em;
    margin-bottom: 0.5rem;
  }
  .main-btn:active {
    background: #1565c0;
    transform: scale(0.97);
  }
  .upload-btn {
    width: 100%;
    max-width: 220px;
    padding: 0.6rem 0;
    font-size: 1.01rem;
    border-radius: 10px;
    border: none;
    background: linear-gradient(90deg, #00c6ff 60%, #1976d2 100%);
    color: #fff;
    font-weight: 700;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition:
      background 0.2s,
      transform 0.1s;
    letter-spacing: 0.01em;
    margin-top: 0.3rem;
    margin-left: auto;
    margin-right: auto;
    display: block;
  }
  .upload-btn:active {
    background: #1565c0;
    transform: scale(0.97);
  }

  .name-input {
    width: 100%;
    border: none;
    font-size: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: background 0.2s;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    box-sizing: border-box;
  }
  .name-input:focus {
    outline: 2px solid #00c6ff;
  }
  .image-preview-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    background: transparent;
    max-height: 60vh;
    overflow: hidden;
  }
  .receipt-image {
    display: block;
    max-width: 90vw;
    max-height: 35vh;
    width: auto;
    height: auto;
    border-radius: 10px;
    object-fit: contain;
    margin: 0 auto;
  }
  .loader-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #00c6ff;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
