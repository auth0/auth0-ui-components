import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    reporters: ['verbose'],
    setupFiles: ['./vitest-setup.ts'],
    include: ['./src/**/__tests__/**/*.test.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache',
      'docs-site',
      'examples',
      'src/components/ui/**/*',
      '**/src/types/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        '**/*.d.ts',
        '**/types.ts',
        '**/index.ts',
        '**/__mocks__/**',
        '**/__tests__/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/docs-site/**',
        '**/examples/**',
        '**/*.config.*',
        '**/*.test.*',
        '**/vitest-setup.ts',
        '**/*.json',
        '**/assets/**',
        '**/*.css',
        '**/vite.config.*',
        '**/tsup.config.*',
        'src/components/ui/**/*',
        '**/src/types/**',
        'src/components/auth0/shared/pagination.tsx',
        'src/components/auth0/shared/data-pagination.tsx',
      ],
      include: ['src/**/*'],
      thresholds: {
        global: {
          statements: 75,
          branches: 75,
          functions: 75,
          lines: 75,
        },
      },
    },
    mockReset: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Resolve workspace packages to source files during testing
      // This allows tests to run before build
      '@auth0/universal-components-core': resolve(__dirname, '../core/src'),
      '@core': resolve(__dirname, '../core/src'),
    },
  },
});
