import { vi } from 'vitest';

/**
 * Mock HTML element that simulates document.documentElement with common DOM APIs
 */
export function createMockHtmlElement() {
  return {
    dataset: {} as { theme?: string; [key: string]: string | undefined },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
    style: {
      setProperty: vi.fn(),
    },
  };
}

export type MockHtmlElement = ReturnType<typeof createMockHtmlElement>;
