import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Try to read port from port.json, fallback to 5000
function getBackendPort(): number {
  try {
    const portFile = path.join(__dirname, 'port.json')
    if (fs.existsSync(portFile)) {
      const portData = JSON.parse(fs.readFileSync(portFile, 'utf-8'))
      if (portData.port) {
        return portData.port
      }
    }
  } catch (error) {
    // Ignore errors, use default
  }
  return 5000 // Default port
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['emoji-picker-react'],
    exclude: []
  },
  resolve: {
    dedupe: ['emoji-picker-react']
  },
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${getBackendPort()}`, // Auto-detected port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
