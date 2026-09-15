import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Le worker MapLibre v6 est un module ES (il importe maplibre-gl-shared.mjs)
  worker: { format: 'es' },
})
