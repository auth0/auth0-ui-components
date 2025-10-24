import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Define projects that extend from subpackage configs
    projects: ['./packages/core', './packages/react'],
    exclude: ['**/examples/**', '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'cobertura'],
      reportsDirectory: './coverage',
      // Merge coverage from both packages
      include: ['packages/core/src/**', 'packages/react/src/**'],
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/node_modules/**',
        '**/.{git,cache}/**',
        'coverage/**',
        'packages/**/dist/**',
        '**/examples/**',
        'examples/**',
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
    },
  },
});
