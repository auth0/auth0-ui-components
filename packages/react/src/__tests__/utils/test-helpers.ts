import { vi } from 'vitest';

export class MockResizeObserver implements ResizeObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
}

class MockPointerEvent extends MouseEvent {}

export function setupJsdomMocks(): void {
  global.ResizeObserver = MockResizeObserver;

  if (typeof window !== 'undefined') {
    global.PointerEvent = MockPointerEvent as typeof PointerEvent;
  }

  // jsdom lacks these APIs that Radix primitives (e.g. Select) rely on to open.
  if (typeof Element !== 'undefined') {
    Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? vi.fn();
    Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture ?? vi.fn();
    Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture ?? vi.fn();
  }
}
