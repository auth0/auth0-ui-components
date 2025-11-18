import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    spa: 'src/spa.ts',
    rwa: 'src/rwa.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ['react', 'react-dom', 'react-hook-form', '@auth0/auth0-react'],
  banner: {
    js: '"use client";',
  },
});
