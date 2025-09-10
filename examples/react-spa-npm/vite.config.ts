import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Remove this alias if you want to use built dist from node_modules
      // '@auth0-web-ui-components/react': path.resolve(__dirname, '../../packages/react/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@auth0-web-ui-components/react'], // 👈 Exclude this from pre-bundling
  },
});
