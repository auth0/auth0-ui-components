import { reactSpaNpmApp } from '../apps/react-spa-npm.app';
import { expect, test } from '../fixtures/auth.fixture';
import { testUnauthenticatedRedirect } from '../fixtures/unauthenticated';
import { t } from '../lib/i18n';
import {
  addMembers,
  createInvitation,
  createUser,
  deleteInvitation,
  deleteUser,
  findRoleIdByName,
  getOrganization,
  listOrgInvitations,
  listOrgMemberRoles,
  listOrgMembers,
  type User,
  waitForOrgInvitation,
  waitForOrgMember,
} from '../lib/management-api';
import { pollRead } from '../lib/poll';
import { requireRunState } from '../lib/run-state';
import { watchToasts } from '../lib/toast';
import { MemberManagementPage } from '../pages/member-management.page';

const org = requireRunState();
const route = reactSpaNpmApp.routes.memberManagement;
const connectionName = process.env.FT_CONNECTION_NAME ?? 'Universal-Components-Demo';

testUnauthenticatedRedirect(route, (page) => new MemberManagementPage(page).membersTab);

function uniqueEmail(label: string): string {
  return `ft-${label}-${Date.now()}@example.com`;
}

test.describe('Members list', () => {
  const seededUsers: User[] = [];

  test.afterAll(async () => {
    await Promise.all(seededUsers.map((user) => deleteUser(user.user_id).catch(() => undefined)));
  });

  test('renders real seeded members with their name, email, and role', async ({ page }) => {
    const email = uniqueEmail('member');
    const user = await createUser({
      email,
      password: `Ft!${Math.random().toString(36).slice(2)}A1`,
      name: 'FT Seeded Member',
      connectionName,
    });
    seededUsers.push(user);
    await addMembers(org.orgId, [user.user_id]);
    await waitForOrgMember(org.orgId, user.user_id);

    const memberManagement = new MemberManagementPage(page);
    await memberManagement.goto(route);

    const row = memberManagement.memberRow(email);
    await expect(row).toBeVisible();
    await expect(row).toContainText('FT Seeded Member');
    await expect(row).toContainText(email);
  });
});

test.describe('Refresh button', () => {
  const seededUsers: User[] = [];

  test.afterAll(async () => {
    await Promise.all(seededUsers.map((user) => deleteUser(user.user_id).catch(() => undefined)));
  });

  test('picks up a member added outside the UI, without a full reload', async ({ page }) => {
    const memberManagement = new MemberManagementPage(page);
    await memberManagement.goto(route);
    await expect(memberManagement.membersTab).toBeVisible();

    const email = uniqueEmail('refresh');
    const user = await createUser({
      email,
      password: `Ft!${Math.random().toString(36).slice(2)}A1`,
      name: 'FT Refresh Member',
      connectionName,
    });
    seededUsers.push(user);
    await addMembers(org.orgId, [user.user_id]);
    await waitForOrgMember(org.orgId, user.user_id);

    await expect(memberManagement.memberRow(email)).toBeHidden();
    await memberManagement.refreshButton.click();
    await expect(memberManagement.memberRow(email)).toBeVisible();
  });
});

test.describe('Invite member', () => {
  test('sends a real invitation, verified independently via the Management API', async ({
    page,
  }) => {
    const email = uniqueEmail('invitee');
    const memberManagement = new MemberManagementPage(page);

    await memberManagement.goto(route);
    await memberManagement.inviteButton.click();

    await expect(memberManagement.inviteMemberDialog).toBeVisible();
    await memberManagement.fillInviteEmail(email);

    const toasts = await watchToasts(page);
    await memberManagement.inviteSubmitButton.click();
    await toasts.expectSuccess(t('member_management.invitation.create.success', { email }));
    await expect(memberManagement.inviteMemberDialog).toBeHidden();

    await memberManagement.invitationsTab.click();
    await expect(memberManagement.invitationRow(email)).toBeVisible();

    let invitationId: string | undefined;
    await expect
      .poll(
        pollRead(async () => {
          const invitations = await listOrgInvitations(org.orgId);
          invitationId = invitations.find((i) => i.invitee.email === email)?.id;
          return invitationId ?? null;
        }, null),
        { timeout: 10_000 },
      )
      .not.toBeNull();

    await deleteInvitation(org.orgId, invitationId!).catch(() => undefined);
  });
});

test.describe('View invitation details', () => {
  test('shows the real invitation and copies its accept URL from the modal', async ({ page }) => {
    const email = uniqueEmail('details');
    const adminRoleId = await findRoleIdByName(process.env.FT_ADMIN_ROLE_NAME ?? 'admin');
    const invitation = await createInvitation(org.orgId, {
      email,
      inviterName: 'FT Setup',
      clientId: process.env.FT_AUTH0_SPA_CLIENT_ID ?? '',
      roles: [adminRoleId],
    });
    await waitForOrgInvitation(org.orgId, email);

    const memberManagement = new MemberManagementPage(page);
    await memberManagement.goto(route);
    await memberManagement.invitationsTab.click();

    const row = memberManagement.invitationRow(email);
    await expect(row).toBeVisible();
    await memberManagement.openInvitationActionsMenu(row);
    await memberManagement.viewInvitationDetailsMenuItem.click();

    await expect(memberManagement.invitationDetailsDialog).toBeVisible();
    // Email/invited-by render as read-only <input> (value isn't textContent).
    await expect(memberManagement.detailsField('email_label')).toHaveValue(email);
    await expect(memberManagement.detailsField('invited_by_label')).toHaveValue('FT Setup');
    await expect(memberManagement.invitationDetailsDialog).toContainText('admin');

    // Poll: the click's clipboard write is async, and a bare expect() on a string has no retry.
    await memberManagement.copyInvitationUrlButton.click();
    await expect
      // clipboard.readText() rejects outright if the document isn't focused, which would end the
      // poll on its first tick instead of retrying.
      .poll(pollRead(() => page.evaluate(() => navigator.clipboard.readText()), ''))
      .toBe(invitation.invitation_url);

    await deleteInvitation(org.orgId, invitation.id).catch(() => undefined);
  });
});

test.describe('Assign role to member', () => {
  const seededUsers: User[] = [];

  test.afterAll(async () => {
    await Promise.all(seededUsers.map((user) => deleteUser(user.user_id).catch(() => undefined)));
  });

  test('assigns a real role, verified independently via the Management API', async ({ page }) => {
    const email = uniqueEmail('assign-role');
    const roleName = process.env.FT_ADMIN_ROLE_NAME ?? 'admin';
    const user = await createUser({
      email,
      password: `Ft!${Math.random().toString(36).slice(2)}A1`,
      name: 'FT Assign Role Member',
      connectionName,
    });
    seededUsers.push(user);
    await addMembers(org.orgId, [user.user_id]);
    await waitForOrgMember(org.orgId, user.user_id);

    const memberManagement = new MemberManagementPage(page);
    await memberManagement.goto(route);

    const row = memberManagement.memberRow(email);
    await expect(row).toBeVisible();
    await memberManagement.openMemberActionsMenu(row);
    await memberManagement.assignRoleMenuItem.click();

    await expect(memberManagement.assignRolesDialog).toBeVisible();
    await memberManagement.rolesCombobox.click();
    await memberManagement.roleOption(roleName).click();
    await page.keyboard.press('Escape');

    const toasts = await watchToasts(page);
    await memberManagement.assignRolesSubmitButton.click();
    await toasts.expectSuccess(t('member_management.member.detail.roles.assign_modal.success'));
    await expect(memberManagement.assignRolesDialog).toBeHidden();

    await expect
      .poll(
        pollRead(async () => {
          const roles = await listOrgMemberRoles(org.orgId, user.user_id);
          return roles.some((role) => role.name === roleName);
        }, false),
        { timeout: 10_000 },
      )
      .toBe(true);
  });
});

test.describe('Remove member from organization', () => {
  const seededUsers: User[] = [];

  test.afterAll(async () => {
    await Promise.all(seededUsers.map((user) => deleteUser(user.user_id).catch(() => undefined)));
  });

  test('removes a real member, verified independently via the Management API', async ({ page }) => {
    const email = uniqueEmail('remove-member');
    const user = await createUser({
      email,
      password: `Ft!${Math.random().toString(36).slice(2)}A1`,
      name: 'FT Remove Member',
      connectionName,
    });
    seededUsers.push(user);
    await addMembers(org.orgId, [user.user_id]);
    await waitForOrgMember(org.orgId, user.user_id);

    const memberManagement = new MemberManagementPage(page);
    await memberManagement.goto(route);

    const row = memberManagement.memberRow(email);
    await expect(row).toBeVisible();

    await memberManagement.openRemoveFromOrganizationDialog(row);
    await expect(memberManagement.removeFromOrganizationDialog).toBeVisible();

    // The component builds this copy from the org's display_name, which another spec edits — read
    // it live so the assertion doesn't depend on file execution order.
    const { display_name: organizationName } = await getOrganization(org.orgId);

    const toasts = await watchToasts(page);
    await memberManagement.confirmRemoveFromOrganizationButton.click();
    await toasts.expectSuccess(
      t('member_management.member.detail.actions.remove_from_organization.success', {
        memberName: user.name!,
        organizationName: organizationName ?? '',
      }),
    );
    await expect(memberManagement.removeFromOrganizationDialog).toBeHidden();

    await expect
      .poll(
        pollRead(async () => {
          const members = await listOrgMembers(org.orgId);
          return members.some((member) => member.user_id === user.user_id);
        }, true),
        { timeout: 10_000 },
      )
      .toBe(false);
  });
});

test.describe('Revoke invitation', () => {
  test('revokes a real invitation, verified independently via the Management API', async ({
    page,
  }) => {
    const email = uniqueEmail('revoke');
    const invitation = await createInvitation(org.orgId, {
      email,
      inviterName: 'FT Setup',
      clientId: process.env.FT_AUTH0_SPA_CLIENT_ID ?? '',
    });
    await waitForOrgInvitation(org.orgId, email);

    const memberManagement = new MemberManagementPage(page);
    await memberManagement.goto(route);
    await memberManagement.invitationsTab.click();

    const row = memberManagement.invitationRow(email);
    await expect(row).toBeVisible();
    await memberManagement.openInvitationActionsMenu(row);
    await memberManagement.revokeInvitationMenuItem.click();

    await expect(memberManagement.revokeInvitationDialog).toBeVisible();

    const toasts = await watchToasts(page);
    await memberManagement.confirmRevokeInvitationButton.click();
    await toasts.expectSuccess(t('member_management.invitation.revoke.success', { email }));
    await expect(memberManagement.revokeInvitationDialog).toBeHidden();

    await expect
      .poll(
        pollRead(async () => {
          const invitations = await listOrgInvitations(org.orgId);
          return invitations.some((i) => i.id === invitation.id);
        }, true),
        { timeout: 10_000 },
      )
      .toBe(false);

    await deleteInvitation(org.orgId, invitation.id).catch(() => undefined);
  });
});

test.describe('Revoke and resend invitation', () => {
  test('revokes the pending invitation and creates a new one, verified independently via the Management API', async ({
    page,
  }) => {
    const email = uniqueEmail('revoke-resend');
    const invitation = await createInvitation(org.orgId, {
      email,
      inviterName: 'FT Setup',
      clientId: process.env.FT_AUTH0_SPA_CLIENT_ID ?? '',
    });
    await waitForOrgInvitation(org.orgId, email);

    const memberManagement = new MemberManagementPage(page);
    await memberManagement.goto(route);
    await memberManagement.invitationsTab.click();

    const row = memberManagement.invitationRow(email);
    await expect(row).toBeVisible();
    await memberManagement.openInvitationActionsMenu(row);
    await memberManagement.revokeAndResendInvitationMenuItem.click();

    await expect(memberManagement.revokeAndResendInvitationDialog).toBeVisible();

    const toasts = await watchToasts(page);
    await memberManagement.confirmRevokeAndResendButton.click();
    await toasts.expectSuccess(
      t('member_management.invitation.success.invitation_resent', { email }),
    );
    await expect(memberManagement.revokeAndResendInvitationDialog).toBeHidden();

    // A different invitation id for the same email proves delete+recreate happened,
    // not just a no-op. Toast alone can't distinguish this.
    let newInvitationId: string | undefined;
    await expect
      .poll(
        pollRead(async () => {
          const invitations = await listOrgInvitations(org.orgId);
          const match = invitations.find((i) => i.invitee.email === email);
          newInvitationId = match?.id;
          return !!match?.id && match.id !== invitation.id;
        }, false),
        { timeout: 10_000 },
      )
      .toBe(true);

    await deleteInvitation(org.orgId, newInvitationId!).catch(() => undefined);
  });
});
