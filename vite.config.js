// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    hmr: true, // Enable hot module replacement
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: true, // Enable source maps for better debugging
    esbuild: {
      target: 'es2015', // Target ES2015 for better compatibility
      format: 'esm',    // Use ESM format
      loader: {
        '.js': 'js'    // Explicitly handle .js files as JavaScript
      },
      supported: {
        'top-level-await': true
      }
    }
  },
  optimizeDeps: {
    exclude: ['js/ui.js'], // Exclude the UI.js file from dependency optimization
    include: ['three', 'three/examples/jsm/controls/OrbitControls.js']
  },
  define: {
    'process.env.NODE_ENV': '"development"'
  }
}); 