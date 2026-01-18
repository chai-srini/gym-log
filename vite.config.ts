import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages: set to '/repo-name/' for project pages
  // or '/' for user/org pages (username.github.io)
  base: process.env.GITHUB_PAGES ? '/gym-log/' : '/',

  server: {
    host: true, // Expose to network
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext', // Support top-level await
  },
});
