/**
 * Narrowing helpers for tests.
 * @module
 * @internal
 */

import { vi } from 'vitest';

/**
 * Returns the element at the given index, throwing when it is absent.
 * @param items - Collection to read from
 * @param index - Zero-based position to read
 * @returns The element at `index`
 * @throws When no element exists at `index`
 */
export function nth<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) {
    throw new Error(
      `Expected an element at index ${index}, but the collection has ${items.length}`,
    );
  }
  return item;
}

/**
 * Returns the wrapping element that carries a disabled control's tooltip trigger.
 * @param control - The disabled control whose tooltip trigger is needed
 * @returns The wrapping tooltip trigger element
 * @throws When the control has no parent element
 */
export function tooltipTriggerFor(control: HTMLElement): HTMLElement {
  const trigger = control.parentElement;
  if (!trigger) {
    throw new Error(
      'Expected the control to be wrapped in a tooltip trigger, but it has no parent',
    );
  }
  return trigger;
}

/**
 * Creates a typed selection-change handler that records what the component emitted.
 * @returns The `handler` to pass as a prop, and `first()` to read the first emitted selection
 */
export function captureSelection<T>() {
  const emitted: T[][] = [];

  return {
    handler: vi.fn((items: T[]) => {
      emitted.push(items);
    }),
    /**
     * Returns the selection emitted by the first call.
     * @returns The first emitted selection
     * @throws When the handler was never called
     */
    first: (): T[] => {
      const [firstCall] = emitted;
      if (!firstCall) {
        throw new Error('Expected the selection handler to have been called, but it was not');
      }
      return firstCall;
    },
  };
}
