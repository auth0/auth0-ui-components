import { expect, type Locator, type Page } from '@playwright/test';

// Short per attempt, so a detached item is retried rather than waited on.
const ATTEMPT_TIMEOUT_MS = 2_000;
const MENU_TIMEOUT_MS = 20_000;

/**
 * Opens a row's actions menu and clicks one of its items, retrying the pair as one unit.
 *
 * A background refetch re-renders the row and detaches the menu item mid-click; Playwright then
 * waits for an item that never comes back and burns the whole test timeout. Asserting the menu is
 * visible first doesn't help — it can die a frame later. Retrying open-plus-click does, because a
 * closed menu just means the next attempt reopens it.
 *
 * @param page - Page the menu portals into.
 * @param trigger - The row's actions menu button.
 * @param item - The menu item to click.
 */
export async function openMenuAndClick(page: Page, trigger: Locator, item: Locator): Promise<void> {
  const menu = page.getByRole('menu');

  await expect(async () => {
    if (!(await menu.isVisible())) {
      await trigger.click({ timeout: ATTEMPT_TIMEOUT_MS });
    }
    await item.click({ timeout: ATTEMPT_TIMEOUT_MS });
  }).toPass({ timeout: MENU_TIMEOUT_MS });
}
