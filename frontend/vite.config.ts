import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import Inspect from 'vite-plugin-inspect'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip', // Use 'brotliCompress' for Brotli
      ext: '.gz',        // File extension for compressed files
      threshold: 1024,   // Only assets bigger than this are compressed (bytes)
      deleteOriginFile: false // Keep original files
    }),
    Inspect()

  ],
  // تحسين الكاشينج للصور والملفات الثابتة
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096, // الصور الأقل من 4KB ستُضمّن مباشرة
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(assetInfo.name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  // ملاحظة: يفضل ضغط الصور وتحويلها إلى webp قبل إضافتها لمجلد assets


  server: {
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Ensure correct path rewriting
        secure: false, // Add this if HTTPS issues occur
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'http://127.0.0.1:5173'); // Ensure correct origin header
          });
          proxy.on('proxyRes', (proxyRes, _req, res) => {
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              res.setHeader('set-cookie', cookies);
            }
          });
        },
      },
    },
  },
  preview: {
  }
})
