import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Looks for .test.ts or .spec.ts files inside the src folder
    include: ['src/**/*.{test,spec}.ts'],
  },
});
