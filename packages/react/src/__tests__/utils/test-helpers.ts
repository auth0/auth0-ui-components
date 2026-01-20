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
}
