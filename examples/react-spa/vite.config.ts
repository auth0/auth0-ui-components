/* eslint-disable no-undef */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias your package to source code for local development
      '@auth0-web-ui-components/react': path.resolve(__dirname, '../../packages/react/src'),

      // Alias '@/' used INSIDE your react package source code
      '@': path.resolve(__dirname, '../../packages/react/src'),
    },
  },
});
