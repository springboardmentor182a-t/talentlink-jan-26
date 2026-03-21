import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,  // required on Windows for hot reload in Docker volumes
    },
    proxy: {
      '/api': {
        target: 'http://server:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://server:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})