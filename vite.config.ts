import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/JD_66/',           // ← put it back!
  plugins: [react()],
})
