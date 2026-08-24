import type { Locator, Page } from '@playwright/test';

import { t } from '../lib/i18n';

const DETAILS_NAMESPACE = 'organization_management.organization_details';
const EDIT_NAMESPACE = 'organization_management.organization_details_edit';

export class OrganizationDetailsPage {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('main');
  }

  async goto(routePath: string): Promise<void> {
    await this.page.goto(routePath);
  }

  private field(key: string): Locator {
    return this.root.getByLabel(t(`${DETAILS_NAMESPACE}.${key}`), { exact: true });
  }

  get nameInput(): Locator {
    return this.field('sections.settings.fields.name.label');
  }

  get displayNameInput(): Locator {
    return this.field('sections.settings.fields.display_name.label');
  }

  get logoUrlInput(): Locator {
    return this.field('sections.branding.fields.logo.label');
  }

  get saveButton(): Locator {
    return this.root.getByRole('button', { name: t(`${DETAILS_NAMESPACE}.submit_button_label`) });
  }

  async setDisplayName(value: string): Promise<void> {
    await this.displayNameInput.fill(value);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  saveSuccessToast(organizationName: string): Locator {
    return this.page.locator('[data-sonner-toast][data-type="success"]').filter({
      hasText: t(`${EDIT_NAMESPACE}.save_organization_changes_message`, { organizationName }),
    });
  }
}
