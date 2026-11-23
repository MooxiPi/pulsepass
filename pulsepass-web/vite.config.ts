/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

const raiz = fileURLToPath(new URL('.', import.meta.url))

// El proxy de desarrollo evita CORS (GAP-05): el navegador llama a /api en el
// mismo origen y Vite reenvía la petición a la API de Spring Boot.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, raiz, '')
  const destinoApi = env.VITE_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: destinoApi,
          // Para el navegador la petición es del mismo origen; si se reenviara el
          // encabezado Origin (http://localhost:5173), Spring Security la trataría como
          // CORS y respondería 403 a todo POST/PATCH (PULSEPASS_CORS_ALLOWED_ORIGINS vacío).
          configure: (proxy) => {
            proxy.on('proxyReq', (peticion) => peticion.removeHeader('origin'))
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      restoreMocks: true,
    },
  }
})
