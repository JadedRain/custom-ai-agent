import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['jaded-agent.duckdns.org'],
    // Proxy API requests to the backend Flask server during development.
    // Use `VITE_API_URL` if provided; inside Docker Compose this should point to the `api` service (e.g. http://api:5000).
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://api:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
