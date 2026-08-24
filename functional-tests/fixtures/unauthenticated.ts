import type { Locator, Page } from '@playwright/test';

import { reactSpaNpmApp } from '../apps/react-spa-npm.app';

import { expect, test } from './auth.fixture';

/**
 * Registers an unauthenticated test inside the calling spec file.
 * Verifies that the given route redirects to the app root and that
 * a component-specific element is not visible.
 *
 * @param route - The route path to visit (e.g. reactSpaNpmApp.routes.memberManagement)
 * @param getComponentLocator - A function returning a locator that is ONLY present when the
 *   component has rendered — e.g. a feature-specific button or card, not a generic role like
 *   `main` which exists on every page.
 */
export function testUnauthenticatedRedirect(
  route: string,
  getComponentLocator: (page: Page) => Locator,
): void {
  test.describe('unauthenticated', () => {
    // persistSession: false — this context has no session; writing it back would wipe the worker's real one
    test.use({ storageState: { cookies: [], origins: [] }, persistSession: false });

    test('redirects away from the route instead of rendering the component', async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(`${reactSpaNpmApp.baseURL}/`);
      await expect(getComponentLocator(page)).toBeHidden();
    });
  });
}
