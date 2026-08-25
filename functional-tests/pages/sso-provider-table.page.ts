import { expect, type Locator, type Page } from '@playwright/test';

import { t } from '../lib/i18n';

export class SsoProviderTablePage {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('main');
  }

  async goto(routePath: string): Promise<void> {
    await this.page.goto(routePath);
  }

  providerRow(providerName: string): Locator {
    return this.root.getByRole('row').filter({ hasText: providerName });
  }

  enabledSwitch(providerName: string): Locator {
    return this.providerRow(providerName).getByRole('switch');
  }

  get refreshButton(): Locator {
    return this.root.getByRole('button', { name: t('common.refresh') });
  }

  get addProviderButton(): Locator {
    return this.root.getByRole('button', {
      name: t('idp_management.sso_provider_table.header.create_button_text'),
    });
  }

  // The menu trigger has no label, but it is the row's only button, so matching by role is safe.
  // We check the menu opened here, because a list refresh can close it and the caller would hang.
  async openProviderActionsMenu(providerName: string): Promise<Locator> {
    await this.providerRow(providerName).getByRole('button').click();
    const menu = this.page.getByRole('menu');
    await expect(menu).toBeVisible();
    return menu;
  }

  editMenuItem(menu: Locator): Locator {
    return menu.getByRole('menuitem', {
      name: t('idp_management.sso_provider_table.table.actions.edit_button_text'),
    });
  }
}
