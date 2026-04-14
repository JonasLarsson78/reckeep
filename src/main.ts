import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'

import App from './App.vue'
import './global.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
// Rensa localStorage när användaren lämnar appen
window.addEventListener('pagehide', () => {
  localStorage.removeItem('receipts')
})
