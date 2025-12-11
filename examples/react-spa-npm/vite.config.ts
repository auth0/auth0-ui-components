import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {},
  },
  optimizeDeps: {
    exclude: ['@auth0/universal-components-react'],
  },
});
