import { type Locator, type Page } from '@playwright/test';

import { t } from '../lib/i18n';

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

  get viewMenuItem(): Locator {
    return this.page.getByRole('menuitem', {
      name: t(`${NAMESPACE}.domain_table.table.actions.view_button_text`),
    });
  }

  get verifyMenuItem(): Locator {
    return this.page.getByRole('menuitem', {
      name: t(`${NAMESPACE}.domain_table.table.actions.verify_button_text`),
    });
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

  txtRecordNameField(domainName: string): Locator {
    return this.verifyDialog(domainName).getByLabel(
      t(`${NAMESPACE}.domain_verify.modal.txt_record_name.label`),
    );
  }

  txtRecordContentField(domainName: string): Locator {
    return this.verifyDialog(domainName).getByLabel(
      t(`${NAMESPACE}.domain_verify.modal.txt_record_content.label`),
    );
  }

  verifySubmitButton(domainName: string): Locator {
    return this.verifyDialog(domainName).getByRole('button', {
      name: t(`${NAMESPACE}.domain_verify.modal.actions.verify_button_text`),
    });
  }

  verifyDoneButton(domainName: string): Locator {
    return this.verifyDialog(domainName).getByRole('button', {
      name: t(`${NAMESPACE}.domain_verify.modal.actions.done_button_text`),
    });
  }

  verifyErrorAlert(domainName: string): Locator {
    return this.verifyDialog(domainName).getByRole('alert');
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
    await this.confirmDeleteButton.click();
  }

  toast(message: string, type: 'success' | 'error' = 'success'): Locator {
    return this.page
      .locator(`[data-sonner-toast][data-type="${type}"]`)
      .filter({ hasText: message });
  }
}
