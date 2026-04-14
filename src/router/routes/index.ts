import HomeView from '../../views/HomeView.vue'
import UploadView from '../../views/UploadView.vue'
import LoginView from '../../views/LoginView.vue'
import RegisterView from '../../views/RegisterView.vue'

export default [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/upload', name: 'Upload', component: UploadView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
]
