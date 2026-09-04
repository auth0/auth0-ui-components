import type { Locator, Page } from '@playwright/test';

import { t } from '../lib/i18n';
import { openMenuAndClick } from '../lib/menu';

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

  get editMenuItem(): Locator {
    return this.page.getByRole('menuitem', {
      name: t('idp_management.sso_provider_table.table.actions.edit_button_text'),
    });
  }

  // The trigger has no label, but it is the row's only button, so matching by role is safe.
  clickEditAction(providerName: string): Promise<void> {
    return openMenuAndClick(
      this.page,
      this.providerRow(providerName).getByRole('button'),
      this.editMenuItem,
    );
  }
}
