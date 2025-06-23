import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['packages/**/*.{test,spec}.{ts,tsx}', 'examples/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8', // Recommended coverage provider
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.d.ts', '**/types.ts', '**/index.ts', '**/__mocks__/**', '**/__tests__/**'],
    },

    // Mocking behavior
    // e.g., 'src/__mocks__/fileMock.ts'
    mockReset: true, // Resets mocks before each test
    clearMocks: true, // Clears mock history before each test
  },
  // Alias for common paths, useful for absolute imports like '@/components/ui/spinner'
  resolve: {
    alias: {
      '@': resolve(__dirname, './'), // Assumes '@' resolves to the project root
    },
  },
});
