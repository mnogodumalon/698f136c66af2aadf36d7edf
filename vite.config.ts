import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({ 
  base: '/698f136c66af2aadf36d7edf/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: [".e2b.app"],
    proxy: {
      '/api/rest': {
        target: 'https://my.living-apps.de',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/rest/, '/rest'),
      },
    },
  },
})
