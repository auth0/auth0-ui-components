/**
 * CSS implementation detection for telemetry.
 * @module css-detection
 * @internal
 */

import type { CssImplementation } from '@auth0/universal-components-core';

/**
 * Detects the CSS implementation being used by the application.
 *
 * Scoped CSS: imports `@auth0/universal-components-react/styles` which has
 * all styles prefixed with `.auth0-universal` selector (e.g., `.auth0-universal .sr-only`).
 *
 * Tailwind CSS: imports `@auth0/universal-components-react/tailwind` or uses
 * Tailwind directly where utilities like `.sr-only` are global.
 *
 * Detection: Check if `.sr-only` styles only apply inside `.auth0-universal` wrapper.
 * - Scoped: `.sr-only` without wrapper has no effect, with wrapper it works
 * - Tailwind: `.sr-only` works globally without needing wrapper
 *
 * @returns The detected CSS implementation ('scoped' or 'tailwind')
 * @internal
 */
export function detectCssImplementation(): CssImplementation {
  if (typeof document === 'undefined') {
    return 'unknown';
  }
  const element = document.body;
  // Create probe without .auth0-universal wrapper
  const probeWithoutWrapper = document.createElement('div');
  probeWithoutWrapper.className = 'sr-only';
  probeWithoutWrapper.style.visibility = 'hidden';
  probeWithoutWrapper.setAttribute('aria-hidden', 'true');
  element.appendChild(probeWithoutWrapper);

  const computedWithout = getComputedStyle(probeWithoutWrapper);
  // In Tailwind mode, .sr-only works globally (position: absolute)
  // In Scoped mode, .sr-only only works inside .auth0-universal wrapper
  const srOnlyWorksGlobally = computedWithout.position === 'absolute';

  element.removeChild(probeWithoutWrapper);

  return srOnlyWorksGlobally ? 'tailwind' : 'scoped';
}
