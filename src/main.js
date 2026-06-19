import { createApp } from 'vue'
import axios from 'axios'
import './style.css'
import './assets/design-tokens.css'
import App from './App.vue'
import router from './router'

// Bypass halaman warning ngrok untuk SEMUA request axios di seluruh app
// (request relative lewat rewrite Vercel, maupun request absolut ke domain ngrok)
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'

// Buat app dulu
const app = createApp(App)

// Gunakan router langsung tanpa reCAPTCHA
app.use(router)
app.mount('#app')