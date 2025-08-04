import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/use-normalized-keys/demo/',
  build: {
    outDir: 'dist-demo',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'demo/index.html')
      }
    }
  },
  resolve: {
    alias: {
      'use-normalized-keys': resolve(__dirname, 'src/index.ts')
    }
  }
});