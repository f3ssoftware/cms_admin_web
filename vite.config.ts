import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: [
      // More specific alias must come first - match @/convex paths
      {
        find: /^@\/convex(\/.*)?$/,
        replacement: fileURLToPath(new URL('./convex$1', import.meta.url)),
      },
      // General @ alias for src folder
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Suppress deprecation warnings from Vue Black Dashboard template
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div']
      }
    }
  },
  server: {
    proxy: {
      // Proxy Keycloak requests to avoid CORS issues in development
      '/api/keycloak': {
        target: process.env.VITE_KEYCLOAK_URL || 'https://auth.f3ssoftware.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/keycloak/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})
