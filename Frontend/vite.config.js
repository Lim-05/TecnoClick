import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../backend/certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../backend/certs/cert.pem')),
    },
    proxy: {
      '/api': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false, // Acepta el certificado autofirmado en desarrollo
      }
    }
  }
})