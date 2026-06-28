import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
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
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
      manifest: {
        name: 'HustleX',
        short_name: 'HustleX',
        theme_color: '#1e3a5f',
        background_color: '#1e3a5f',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
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
