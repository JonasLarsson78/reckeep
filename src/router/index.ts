import { createWebHistory, createRouter } from 'vue-router'
import routes from './routes/index.js'

export default createRouter({
  history: createWebHistory(),
  routes,
})
