import { createWebHistory, createRouter } from 'vue-router'
import routes from './routes'
import { useAuthStore } from '../store/authStore'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const auth = useAuthStore()
  const publicPages = ['/login', '/register']
  const authRequired = !publicPages.includes(to.path)
  if (authRequired && !auth.token) {
    return '/login'
  }
  return true
})

export default router
