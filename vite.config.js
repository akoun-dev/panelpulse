import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Ajoutez cette configuration pour le serveur
  server: {
    host: '0.0.0.0', // Pour écouter sur toutes les interfaces réseau
    port: 3000 // Ou un autre port de votre choix
  }
})
