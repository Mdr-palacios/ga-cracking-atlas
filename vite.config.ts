import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages, set base to "/<repo-name>/" via env var at build time.
// Defaults to "/" for local dev and other deployments.
export default defineConfig({
  plugins: [react()],
  // Use relative paths so the build works behind any proxy / subdirectory
  // (Perplexity preview URL, GitHub Pages, etc.). Override with VITE_BASE_PATH if needed.
  base: process.env.VITE_BASE_PATH || './',
})
