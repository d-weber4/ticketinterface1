import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Optional: Custom plugin to remove version specifiers (if you really need it)
const importRegex = /(['"])(.+?)@\d+\.[\d\.]+\s*\1\s*;?\s*(\r?\n)/g;


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // removeVersionSpecifiers(), // Uncomment if you want to use this plugin
  ],
});