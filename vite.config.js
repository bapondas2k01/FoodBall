import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: "",
  server: {
    host: "::",
    port: 8080,
    hmr: false,
    middlewareMode: false,
    middleware: [
      (req, res, next) => {
        // Set correct Content-Type headers for audio files
        if (req.url.endsWith('.mp3')) {
          res.setHeader('Content-Type', 'audio/mpeg');
        } else if (req.url.endsWith('.wav')) {
          res.setHeader('Content-Type', 'audio/wav');
        }
        next();
      }
    ]
  },
  plugins: [],
  build: {
    // Chunk size warning limit (phaser is a large library, 1500kB is reasonable)
    chunkSizeWarningLimit: 1500,
    
    // Optimize rollup output
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Split phaser into vendor chunk (game libraries can be large)
          if (id.includes('node_modules/phaser')) {
            return 'vendor-phaser';
          }
        }
      }
    },
    
    // Target modern browsers for better compression
    target: 'esnext',
    cssCodeSplit: true,
  }
})
