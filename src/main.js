import { createApp } from 'vue'
import './style.css'
import './assets/design-tokens.css'
import App from './App.vue'
import router from './router'

// Buat app dulu
const app = createApp(App)

// Gunakan router langsung tanpa reCAPTCHA
app.use(router)
app.mount('#app')