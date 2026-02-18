import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: 1234,
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Ganti URL sesuai backend Laravel di dalam jaringan Docker (service name:port)
        changeOrigin: true,
        secure: false
      },
      '/files': {
        target: 'http://localhost:8000', // Ganti URL sesuai backend Laravel di dalam jaringan Docker (service name:port)
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/files/, '')
      },
      '/images': {
        target: 'http://localhost:8000', // Ganti URL sesuai backend Laravel di dalam jaringan Docker (service name:port)
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {  // Production
    port:3001
  }
})