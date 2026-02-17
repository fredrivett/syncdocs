import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  base: '/viewer/',
  build: {
    outDir: resolve(__dirname, '../../../dist/viewer-dist'),
    emptyOutDir: true,
  },
});
