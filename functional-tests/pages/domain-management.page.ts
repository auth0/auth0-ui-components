import { expect, type Locator, type Page } from '@playwright/test';

import { t } from '../lib/i18n';
import { openMenuAndClick } from '../lib/menu';

const NAMESPACE = 'domain_management';

export class DomainManagementPage {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('main');
  }

  async goto(routePath: string): Promise<void> {
    await this.page.goto(routePath);
  }

  get addDomainButton(): Locator {
    return this.root.getByRole('button', {
      name: t(`${NAMESPACE}.domain_table.header.create_button_text`),
    });
  }

  domainRow(domainName: string): Locator {
    return this.root.getByRole('row').filter({ hasText: domainName });
  }

  // Row actions trigger has no aria-label (icon-only) — only button in the row.
  rowActionsMenuButton(row: Locator): Locator {
    return row.getByRole('button');
  }

  clickRowAction(row: Locator, item: Locator): Promise<void> {
    return openMenuAndClick(this.page, this.rowActionsMenuButton(row), item);
  }

  get configureMenuItem(): Locator {
    return this.page.getByRole('menuitem', {
      name: t(`${NAMESPACE}.domain_table.table.actions.configure_button_text`),
    });
  }

  get deleteMenuItem(): Locator {
    return this.page.getByRole('menuitem', {
      name: t(`${NAMESPACE}.domain_table.table.actions.delete_button_text`),
    });
  }

  get createDomainDialog(): Locator {
    return this.page.getByRole('dialog', { name: t(`${NAMESPACE}.domain_create.modal.title`) });
  }

  get domainUrlInput(): Locator {
    return this.createDomainDialog.getByLabel(t(`${NAMESPACE}.domain_create.modal.field.label`));
  }

  get createSubmitButton(): Locator {
    return this.createDomainDialog.getByRole('button', {
      name: t(`${NAMESPACE}.domain_create.modal.actions.create_button_text`),
    });
  }

  verifyDialog(domainName: string): Locator {
    return this.page.getByRole('dialog', {
      name: t(`${NAMESPACE}.domain_verify.modal.title`, { domainName }),
    });
  }

  private get openDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  get txtRecordNameField(): Locator {
    return this.openDialog.getByLabel(t(`${NAMESPACE}.domain_verify.modal.txt_record_name.label`));
  }

  get txtRecordContentField(): Locator {
    return this.openDialog.getByLabel(
      t(`${NAMESPACE}.domain_verify.modal.txt_record_content.label`),
    );
  }

  get verifyDoneButton(): Locator {
    return this.openDialog.getByRole('button', {
      name: t(`${NAMESPACE}.domain_verify.modal.actions.done_button_text`),
    });
  }

  configureDialog(domain: string): Locator {
    return this.page.getByRole('dialog', {
      name: t(`${NAMESPACE}.domain_configure_providers.modal.title`, { domain }),
    });
  }

  // Only rendered while the domain has no associated connection.
  providerSelect(domain: string): Locator {
    return this.configureDialog(domain).getByRole('combobox', {
      name: t(`${NAMESPACE}.domain_configure_providers.modal.field.label`),
    });
  }

  // Options portal outside the dialog and read "Display name (strategy)".
  providerOption(providerDisplayName: string): Locator {
    return this.page.getByRole('option', { name: providerDisplayName });
  }

  async selectProvider(domain: string, providerDisplayName: string): Promise<void> {
    await this.providerSelect(domain).click();
    await this.providerOption(providerDisplayName).click();
  }

  configureSaveButton(domain: string): Locator {
    return this.configureDialog(domain).getByRole('button', {
      name: t(`${NAMESPACE}.domain_configure_providers.modal.actions.save_button_text`),
      exact: true,
    });
  }

  removeProviderButton(domain: string, providerDisplayName: string): Locator {
    return this.configureDialog(domain).getByRole('button', {
      name: t(`${NAMESPACE}.domain_configure_providers.modal.actions.remove_button_aria_label`, {
        provider: providerDisplayName,
      }),
    });
  }

  get deleteDomainDialog(): Locator {
    return this.page.getByRole('dialog', { name: t(`${NAMESPACE}.domain_delete.modal.title`) });
  }

  get confirmDeleteButton(): Locator {
    return this.deleteDomainDialog.getByRole('button', {
      name: t(`${NAMESPACE}.domain_delete.modal.actions.delete_button_text`),
    });
  }

  async confirmDelete(): Promise<void> {
    await expect(this.deleteDomainDialog).toBeVisible();
    await this.confirmDeleteButton.click();
  }
}
