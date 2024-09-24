import react from "@vitejs/plugin-react"
import eslint from 'vite-plugin-eslint'
import { defineConfig } from "vite"
import path from 'path' // Import path module

// Your Vite configuration...
export default defineConfig({
  plugins: [react(), eslint()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
