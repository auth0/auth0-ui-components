import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { MiddleEllipsisText } from '../middle-ellipsis-text';

describe('MiddleEllipsisText', () => {
  let resizeCallback: ResizeObserverCallback | null = null;
  let currentWidth = 0;

  beforeEach(() => {
    resizeCallback = null;
    currentWidth = 0;

    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback;
        }
        observe() {
          return undefined;
        }
        disconnect() {
          return undefined;
        }
      },
    );

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });

    vi.stubGlobal('cancelAnimationFrame', () => undefined);

    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      fontSize: '16px',
      fontFamily: 'Arial',
    } as CSSStyleDeclaration);

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      font: '',
      measureText: (text: string) => ({ width: text.length * 10 }),
    } as CanvasRenderingContext2D);

    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => currentWidth,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should render the full text when it fits', async () => {
    currentWidth = 200;
    const { container } = render(<MiddleEllipsisText text="hello" />);
    const span = container.querySelector('span');

    expect(span).not.toBeNull();
    await waitFor(() => {
      expect(span).toHaveTextContent('hello');
    });

    expect(span).not.toHaveAttribute('title');
  });

  it('should truncate text and set title when it overflows', async () => {
    currentWidth = 50;
    const text = 'abcdefghij';
    const { container } = render(<MiddleEllipsisText text={text} />);
    const span = container.querySelector('span');

    expect(span).not.toBeNull();
    await waitFor(() => {
      expect(span).toHaveTextContent('a...j');
    });

    expect(span).toHaveAttribute('title', text);
  });

  it('should update truncation when resized', async () => {
    const text = 'abcdefghij';
    currentWidth = 200;
    const { container } = render(<MiddleEllipsisText text={text} />);
    const span = container.querySelector('span');

    expect(span).not.toBeNull();
    await waitFor(() => {
      expect(span).toHaveTextContent(text);
    });

    currentWidth = 50;

    expect(resizeCallback).not.toBeNull();
    resizeCallback?.([] as ResizeObserverEntry[], {} as ResizeObserver);

    await waitFor(() => {
      expect(span).toHaveTextContent('a...j');
    });
  });
});
