import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'



export default defineConfig({
  base: '/',           // ← most important change
  plugins: [react()],
})
