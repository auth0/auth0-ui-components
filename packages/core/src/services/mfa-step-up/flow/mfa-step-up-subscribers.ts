/**
 * @returns A list of listeners. One that throws is logged and does not stop the others.
 */
export function createSubscribers() {
  const listeners = new Set<() => void>();

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    notify: () => {
      for (const listener of [...listeners]) {
        if (!listeners.has(listener)) continue;
        try {
          listener();
        } catch (listenerError) {
          console.warn('MFA step-up: a subscriber threw', listenerError);
        }
      }
    },
    clear: () => listeners.clear(),
    isEmpty: () => listeners.size === 0,
  };
}
