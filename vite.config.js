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
      supported: {
        'top-level-await': true
      },
      target: 'es2015',
      // Force esbuild to treat js files as ES modules to handle import/export properly
      format: 'esm'
    }
  },
  optimizeDeps: {
    exclude: ['js/ui.js'], // Exclude the problematic ui.js from dependency optimization
    include: ['three', 'three/examples/jsm/controls/OrbitControls.js']
  },
  define: {
    'process.env.NODE_ENV': '"development"'
  }
}); 