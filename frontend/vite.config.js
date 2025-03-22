import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
      '@features': path.resolve(__dirname, './src/features'),
      '@services': path.resolve(__dirname, './src/lib/services'),
      '@utils': path.resolve(__dirname, './src/lib/utils'),
      '@hooks': path.resolve(__dirname, './src/lib/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  server: {
    host: true,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 500,
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
      ]
    },
    hmr: {
      clientPort: 5173,
      overlay: true
    },
    proxy: {
      '/api': {
        target: 'http://nginx:80',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-navigation-menu'],
          query: ['@tanstack/react-query'],
          forms: ['react-hook-form', 'zod'],
          charts: ['recharts']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'react-hook-form',
      'zod',
      'framer-motion'
    ],
    force: true
  }
})
