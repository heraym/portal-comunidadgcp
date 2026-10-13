import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Vite con proxy hacia el backend FastAPI
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
