import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { detectCssImplementation } from '@/lib/utils/shared/css-detection';

describe('detectCssImplementation', () => {
  const originalDocument = global.document;

  afterEach(() => {
    vi.restoreAllMocks();
    global.document = originalDocument;
  });

  describe('when document is undefined (SSR)', () => {
    beforeEach(() => {
      // @ts-expect-error - simulating SSR environment
      global.document = undefined;
    });

    it('should return "unknown"', () => {
      expect(detectCssImplementation()).toBe('unknown');
    });
  });

  describe('when document is available (client)', () => {
    let mockProbe: HTMLDivElement;

    beforeEach(() => {
      mockProbe = document.createElement('div');
      vi.spyOn(document, 'createElement').mockReturnValue(mockProbe);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockProbe);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockProbe);
    });

    it('should return "tailwind" when .sr-only has position: absolute globally', () => {
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        position: 'absolute',
      } as CSSStyleDeclaration);

      expect(detectCssImplementation()).toBe('tailwind');
    });

    it('should return "scoped" when .sr-only does not have position: absolute globally', () => {
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        position: 'static',
      } as CSSStyleDeclaration);

      expect(detectCssImplementation()).toBe('scoped');
    });

    it('should create a probe element with correct attributes', () => {
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        position: 'static',
      } as CSSStyleDeclaration);

      detectCssImplementation();

      expect(mockProbe.className).toBe('sr-only');
      expect(mockProbe.style.visibility).toBe('hidden');
      expect(mockProbe.getAttribute('aria-hidden')).toBe('true');
    });

    it('should clean up the probe element after detection', () => {
      const appendSpy = vi.spyOn(document.body, 'appendChild');
      const removeSpy = vi.spyOn(document.body, 'removeChild');
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        position: 'static',
      } as CSSStyleDeclaration);

      detectCssImplementation();

      expect(appendSpy).toHaveBeenCalledWith(mockProbe);
      expect(removeSpy).toHaveBeenCalledWith(mockProbe);
    });
  });
});
