import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
    alias: {
      'framer-motion': path.resolve(__dirname, 'src/__mocks__/framer-motion.jsx'),
    },
  },
})
