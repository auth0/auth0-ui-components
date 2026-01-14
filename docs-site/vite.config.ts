import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { registryMiddleware } from './src/api/registry-middleware';

export default defineConfig({
  plugins: [react(), registryMiddleware()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
