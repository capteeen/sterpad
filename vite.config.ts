import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  server: {
    proxy: {
      '/api-ipfs': {
        target: 'https://pump.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-ipfs/, '/api/ipfs')
      },
      '/api-pump': {
        target: 'https://pumpportal.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-pump/, '/api')
      }
    }
  }
})
