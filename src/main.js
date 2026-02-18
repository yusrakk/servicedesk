import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { VueReCaptcha } from 'vue-recaptcha-v3'

// Buat app dulu
const app = createApp(App)

// Baru gunakan plugin
app.use(VueReCaptcha, { siteKey: '6LczCZsrAAAAAKfBuoWhPQLXnD5q9gQ8FWV8he0d' })

app.use(router)
app.mount('#app')
