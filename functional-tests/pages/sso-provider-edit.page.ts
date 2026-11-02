import { expect, type Locator, type Page } from '@playwright/test';

import { t } from '../lib/i18n';

export class SsoProviderEditPage {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('main');
  }

  async goto(routePath: string): Promise<void> {
    await this.page.goto(routePath);
  }

  get displayNameInput(): Locator {
    return this.root.getByRole('textbox', { name: 'Display Name' });
  }

  // GET never returns client_secret — must be retyped on every save.
  get clientSecretInput(): Locator {
    return this.root.getByRole('textbox', { name: 'Client Secret' });
  }

  get saveButton(): Locator {
    return this.root.getByRole('button', {
      name: t('idp_management.sso_provider_details.submit_button_label'),
    });
  }

  private cardWithTitle(title: string): Locator {
    return this.page.locator('[data-slot="card"]').filter({ hasText: title });
  }

  async openDeleteModal(providerName: string): Promise<void> {
    const card = this.cardWithTitle(
      t('idp_management.delete_sso_provider.title', { providerName }),
    );
    await card
      .getByRole('button', { name: t('idp_management.delete_sso_provider.delete_button_label') })
      .click();
  }

  async confirmDelete(providerName: string): Promise<void> {
    const dialog = this.page.getByRole('dialog', {
      name: t('idp_management.delete_sso_provider.modal.title', { providerName }),
    });
    await expect(dialog).toBeVisible();
    await dialog
      .getByLabel(t('idp_management.delete_sso_provider.modal.content.field.label'))
      .fill(providerName);
    await dialog
      .getByRole('button', {
        name: t('idp_management.delete_sso_provider.modal.actions.delete_button_label'),
      })
      .click();
  }

  async openRemoveModal(providerName: string): Promise<void> {
    const card = this.cardWithTitle(
      t('idp_management.remove_sso_provider.title', { providerName }),
    );
    await card
      .getByRole('button', { name: t('idp_management.remove_sso_provider.remove_button_label') })
      .click();
  }

  async confirmRemove(providerName: string, organizationName: string): Promise<void> {
    const dialog = this.page.getByRole('dialog', {
      name: t('idp_management.remove_sso_provider.modal.title', { providerName, organizationName }),
    });
    // Check the dialog first. Its title includes the organization name, so if that name is missing
    // we fail fast with "dialog not visible" instead of waiting on a field that never shows up.
    await expect(dialog).toBeVisible();
    await dialog
      .getByLabel(t('idp_management.remove_sso_provider.modal.content.field.label'))
      .fill(providerName);
    await dialog
      .getByRole('button', {
        name: t('idp_management.remove_sso_provider.modal.actions.remove_button_text'),
      })
      .click();
  }
}
