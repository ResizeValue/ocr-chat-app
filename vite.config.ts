import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // ВАЖЛИВО: має відповідати output_location
  },
  optimizeDeps: {
    include: ['react-markdown', 'remark-math', 'rehype-katex'],
  },
})
