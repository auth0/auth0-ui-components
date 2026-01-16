import '@testing-library/jest-dom';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Tooltip uses PointerEvents, which JSDOM doesn't fully support
if (typeof window !== 'undefined' && window.PointerEvent) {
  global.PointerEvent = MouseEvent as any;
}
