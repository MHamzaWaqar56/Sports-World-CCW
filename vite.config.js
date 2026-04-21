import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('react-router-dom')) return 'react-router';
          if (id.includes('framer-motion')) return 'framer-motion';
          if (id.includes('lucide-react')) return 'lucide-react';
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules\\react\\') ||
            id.includes('react-dom')
          ) {
            return 'react';
          }
          if (id.includes('axios')) return 'axios';
          return 'vendor';
        },
      },
    },
  },
})
