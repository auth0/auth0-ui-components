import { expect, type Locator, type Page } from '@playwright/test';

import { t } from '../lib/i18n';

const NAMESPACE = 'member_management';

export class MemberManagementPage {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('main');
  }

  async goto(routePath: string): Promise<void> {
    await this.page.goto(routePath);
  }

  get membersTab(): Locator {
    return this.root.getByRole('tab', { name: t(`${NAMESPACE}.tabs.members`) });
  }

  get invitationsTab(): Locator {
    return this.root.getByRole('tab', { name: t(`${NAMESPACE}.tabs.invitations`) });
  }

  get inviteButton(): Locator {
    return this.root.getByRole('button', { name: t(`${NAMESPACE}.invite_button`) });
  }

  get refreshButton(): Locator {
    return this.root.getByRole('button', { name: t('common.refresh') });
  }

  memberRow(email: string): Locator {
    return this.root.getByRole('row').filter({ hasText: email });
  }

  invitationRow(email: string): Locator {
    return this.root.getByRole('row').filter({ hasText: email });
  }

  rowActionsMenuButton(row: Locator): Locator {
    return row.getByRole('button', { name: t(`${NAMESPACE}.member.actions.menu_label`) });
  }

  invitationRowActionsMenuButton(row: Locator): Locator {
    return row.getByRole('button', { name: t(`${NAMESPACE}.invitation.actions.menu_label`) });
  }

  // Check the menu opened here, because a list refresh can close it and the caller would hang.
  async openMemberActionsMenu(row: Locator): Promise<void> {
    await this.rowActionsMenuButton(row).click();
    await expect(this.page.getByRole('menu')).toBeVisible();
  }

  async openInvitationActionsMenu(row: Locator): Promise<void> {
    await this.invitationRowActionsMenuButton(row).click();
    await expect(this.page.getByRole('menu')).toBeVisible();
  }

  get viewInvitationDetailsMenuItem(): Locator {
    return this.page.getByRole('menuitem', {
      name: t(`${NAMESPACE}.invitation.actions.view_details`),
    });
  }

  get assignRoleMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: t(`${NAMESPACE}.member.actions.assign_role`) });
  }

  get removeFromOrganizationMenuItem(): Locator {
    return this.page.getByRole('menuitem', {
      name: t(`${NAMESPACE}.member.actions.remove_from_organization`),
    });
  }

  get revokeInvitationMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: t(`${NAMESPACE}.invitation.actions.revoke`) });
  }

  get revokeAndResendInvitationMenuItem(): Locator {
    return this.page.getByRole('menuitem', {
      name: t(`${NAMESPACE}.invitation.actions.revoke_and_resend`),
    });
  }

  get assignRolesDialog(): Locator {
    return this.page.getByRole('dialog', {
      name: t(`${NAMESPACE}.member.detail.roles.assign_modal.title`),
    });
  }

  get rolesCombobox(): Locator {
    return this.assignRolesDialog.getByLabel(
      t(`${NAMESPACE}.member.detail.roles.assign_modal.roles_label`),
      { exact: true },
    );
  }

  // Options render as plain <button>s in a popover portal, not role="option".
  roleOption(roleName: string): Locator {
    return this.page.getByRole('button', { name: roleName, exact: true });
  }

  get assignRolesSubmitButton(): Locator {
    return this.assignRolesDialog.getByRole('button', {
      name: t(`${NAMESPACE}.member.detail.roles.assign_modal.submit_button`),
    });
  }

  async openRemoveFromOrganizationDialog(row: Locator): Promise<void> {
    await this.openMemberActionsMenu(row);
    await this.removeFromOrganizationMenuItem.click();
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

  get revokeInvitationDialog(): Locator {
    return this.page.getByRole('dialog', { name: t(`${NAMESPACE}.invitation.revoke.title`) });
  }

  get confirmRevokeInvitationButton(): Locator {
    return this.revokeInvitationDialog.getByRole('button', {
      name: t(`${NAMESPACE}.invitation.revoke.confirm_button`),
    });
  }

  get revokeAndResendInvitationDialog(): Locator {
    return this.page.getByRole('dialog', {
      name: t(`${NAMESPACE}.invitation.revoke_resend.title`),
    });
  }

  get confirmRevokeAndResendButton(): Locator {
    return this.revokeAndResendInvitationDialog.getByRole('button', {
      name: t(`${NAMESPACE}.invitation.revoke_resend.confirm_button`),
    });
  }

  get invitationDetailsDialog(): Locator {
    return this.page.getByRole('dialog', { name: t(`${NAMESPACE}.invitation.details.title`) });
  }

  detailsField(labelKey: string): Locator {
    return this.invitationDetailsDialog.getByLabel(
      t(`${NAMESPACE}.invitation.details.${labelKey}`),
      { exact: true },
    );
  }

  get copyInvitationUrlButton(): Locator {
    return this.invitationDetailsDialog.getByRole('button', {
      name: t(`${NAMESPACE}.invitation.details.copy_url_button`),
    });
  }

  get membersEmptyMessage(): Locator {
    return this.root.getByText(t(`${NAMESPACE}.member.table.empty_message`));
  }

  get inviteMemberDialog(): Locator {
    return this.page.getByRole('dialog', { name: t(`${NAMESPACE}.invitation.create.title`) });
  }

  get inviteEmailInput(): Locator {
    return this.inviteMemberDialog.getByLabel(t(`${NAMESPACE}.invitation.create.email_label`), {
      exact: false,
    });
  }

  get inviteSubmitButton(): Locator {
    return this.inviteMemberDialog.getByRole('button', {
      name: t(`${NAMESPACE}.invitation.create.submit_button`),
    });
  }

  async fillInviteEmail(email: string): Promise<void> {
    await this.inviteEmailInput.fill(email);
    await this.inviteEmailInput.press('Enter');
  }
}
