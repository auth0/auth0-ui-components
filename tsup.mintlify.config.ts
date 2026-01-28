import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    // Single bundle for all components
    index: 'src/mintlify.ts',
  },
  outDir: 'dist/mintlify',
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  external: [
    'react',
    'react-dom',
    'react-dom/client',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    '@auth0/auth0-react',
  ],
  noExternal: [
    'zod',
    'clsx',
    'sonner',
    /^@radix-ui/,
    /^@tanstack/,
    'lucide-react',
    'tailwind-merge',
    '@hookform/resolvers',
    'class-variance-authority',
    '@auth0/universal-components-core',
  ],
  treeshake: true,
  minify: false,
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  injectStyle: false,
});
