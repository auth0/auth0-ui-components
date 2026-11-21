/**
 * Clipboard copy with a short-lived status for feedback.
 * @module use-copy-to-clipboard
 * @internal
 */

import * as React from 'react';

export type CopyStatus = 'idle' | 'copied' | 'error';

export interface UseCopyToClipboardOptions {
  resetAfterMs?: number;
}

export interface UseCopyToClipboardResult {
  status: CopyStatus;
  copy: (text: string) => Promise<boolean>;
}

/**
 * Copies text to the clipboard and exposes the result as a status that resets after a delay.
 * @param options - Hook options.
 * @param options.resetAfterMs - Delay before the status returns to `idle` (default 1000).
 * @returns The current status and a `copy` function.
 */
export function useCopyToClipboard({
  resetAfterMs = 1000,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardResult {
  const [status, setStatus] = React.useState<CopyStatus>('idle');
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const copy = React.useCallback(
    async (text: string) => {
      let next: CopyStatus;
      try {
        await navigator.clipboard.writeText(text);
        next = 'copied';
      } catch {
        next = 'error';
      }
      setStatus(next);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setStatus('idle'), resetAfterMs);
      return next === 'copied';
    },
    [resetAfterMs],
  );

  return { status, copy };
}
