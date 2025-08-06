import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/use-normalized-keys/tools/' : '/',
  root: resolve(__dirname, 'demo'),
  build: {
    outDir: '../dist-tools',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'demo/tools/index.html'),
        docs: resolve(__dirname, 'demo/tools-docs.html')
      }
    }
  },
  resolve: {
    alias: {
      'use-normalized-keys': resolve(__dirname, 'src/index.ts')
    }
  },
  server: {
    port: 5174,
    open: '/tools/'
  }
});