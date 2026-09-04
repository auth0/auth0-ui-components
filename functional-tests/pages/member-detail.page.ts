import type { Locator, Page } from '@playwright/test';

import { t } from '../lib/i18n';

const NAMESPACE = 'member_management';

export class MemberDetailPage {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('main');
  }

  async goto(routePath: string): Promise<void> {
    await this.page.goto(routePath);
  }

  get detailsTab(): Locator {
    return this.root.getByRole('tab', { name: t(`${NAMESPACE}.member.detail.tabs.details`) });
  }

  get rolesTab(): Locator {
    return this.root.getByRole('tab', { name: t(`${NAMESPACE}.member.detail.tabs.roles`) });
  }

  roleRow(roleName: string): Locator {
    return this.root.getByRole('row').filter({ hasText: roleName });
  }

  removeRoleButton(roleName: string): Locator {
    return this.root.getByRole('button', {
      name: t(`${NAMESPACE}.member.detail.roles.table.remove_button_label`, { roleName }),
    });
  }

  get removeRoleDialog(): Locator {
    return this.page.getByRole('dialog', {
      name: t(`${NAMESPACE}.member.detail.roles.remove_confirm.title`),
    });
  }

  get confirmRemoveRoleButton(): Locator {
    return this.removeRoleDialog.getByRole('button', {
      name: t(`${NAMESPACE}.member.detail.roles.remove_confirm.confirm_button`),
    });
  }

  get removeFromOrganizationButton(): Locator {
    return this.root.getByRole('button', {
      name: t(`${NAMESPACE}.member.detail.actions.remove_from_organization.button`),
    });
  }

  async openRemoveFromOrganizationDialog(): Promise<void> {
    await this.removeFromOrganizationButton.click();
  }

  get removeFromOrganizationDialog(): Locator {
    return this.page.getByRole('dialog', {
      name: t(`${NAMESPACE}.member.detail.actions.remove_from_organization.modal.title`, {
        organizationName: '',
      }),
    });
  }

  get confirmRemoveFromOrganizationButton(): Locator {
    return this.removeFromOrganizationDialog.getByRole('button', {
      name: t(`${NAMESPACE}.member.detail.actions.remove_from_organization.modal.confirm_button`),
    });
  }
}
