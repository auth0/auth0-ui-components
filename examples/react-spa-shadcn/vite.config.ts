import path from 'path';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: 'localhost',
    port: 5173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@/auth0-ui-components': path.resolve('./src/auth0-ui-components'),
      src: path.resolve('./src'),
    },
  },
}));
