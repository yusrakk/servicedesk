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
        target: 'https://splicing-compel-enduring.ngrok-free.dev', // Ganti ke URL Ngrok Anda
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true' // Menembus halaman warning Ngrok
        }
      },
      '/files': {
        target: 'https://splicing-compel-enduring.ngrok-free.dev', // Ganti ke URL Ngrok Anda
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        rewrite: (path) => path.replace(/^\/files/, '')
      },
      '/images': {
        target: 'https://splicing-compel-enduring.ngrok-free.dev', // Ganti ke URL Ngrok Anda
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      }
    }
  },
  preview: {  // Production
    port:3001
  }
})