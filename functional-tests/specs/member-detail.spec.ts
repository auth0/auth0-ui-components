import { reactSpaNpmApp } from '../apps/react-spa-npm.app';
import { expect, test } from '../fixtures/auth.fixture';
import { t } from '../lib/i18n';
import {
  addMembers,
  assignMemberRoles,
  createRole,
  createUser,
  deleteRole,
  deleteUser,
  listOrgMemberRoles,
  listOrgMembers,
  type Role,
  type User,
  waitForMemberRole,
  waitForOrgMember,
} from '../lib/management-api';
import { requireRunState } from '../lib/run-state';
import { MemberDetailPage } from '../pages/member-detail.page';

const org = requireRunState();
const connectionName = process.env.FT_CONNECTION_NAME ?? 'Universal-Components-Demo';

function uniqueEmail(label: string): string {
  return `ft-${label}-${Date.now()}@example.com`;
}

test.describe('Member details on page load', () => {
  let createdUserId: string | undefined;

  test.afterEach(async () => {
    if (createdUserId) await deleteUser(createdUserId).catch(() => undefined);
  });

  test('renders the real member fetched by id, not the list endpoint', async ({ page }) => {
    const email = uniqueEmail('detail-view');
    const user = await createUser({
      email,
      password: `Ft!${Math.random().toString(36).slice(2)}A1`,
      name: 'FT Detail View Member',
      connectionName,
    });
    createdUserId = user.user_id;
    await addMembers(org.orgId, [user.user_id]);
    await waitForOrgMember(org.orgId, user.user_id);

    const memberDetail = new MemberDetailPage(page);
    await memberDetail.goto(reactSpaNpmApp.routes.memberDetail(user.user_id));

    await expect(
      memberDetail.root.getByRole('heading', { name: user.name, exact: true }),
    ).toBeVisible();
    await expect(memberDetail.root.getByText(user.user_id, { exact: true })).toBeVisible();
    await expect(memberDetail.detailsTab).toHaveAttribute('data-state', 'active');
    await expect(memberDetail.root).toContainText(user.name!);
    await expect(memberDetail.root).toContainText(email);
  });
});

test.describe('Remove role from member', () => {
  let createdUserId: string | undefined;
  let createdRoleId: string | undefined;

  test.afterEach(async () => {
    if (createdUserId) await deleteUser(createdUserId).catch(() => undefined);
    if (createdRoleId) await deleteRole(createdRoleId).catch(() => undefined);
  });

  test('removes a single role, verified independently via the Management API', async ({ page }) => {
    const email = uniqueEmail('remove-role');
    const user = await createUser({
      email,
      password: `Ft!${Math.random().toString(36).slice(2)}A1`,
      name: 'FT Remove Role Member',
      connectionName,
    });
    createdUserId = user.user_id;
    await addMembers(org.orgId, [user.user_id]);
    await waitForOrgMember(org.orgId, user.user_id);

    const role = await createRole({ name: `ft-role-${Date.now()}` });
    createdRoleId = role.id;
    await assignMemberRoles(org.orgId, user.user_id, [role.id]);
    // Precondition, not an expectation: the component fetches roles once on mount, so if the
    // assignment is not readable yet it renders an empty table and never recovers.
    await waitForMemberRole(org.orgId, user.user_id, role.id);

    const memberDetail = new MemberDetailPage(page);
    await memberDetail.goto(reactSpaNpmApp.routes.memberDetail(user.user_id));
    await memberDetail.rolesTab.click();

    const row = memberDetail.roleRow(role.name);
    await expect(row).toBeVisible();
    await memberDetail.removeRoleButton(role.name).click();

    await expect(memberDetail.removeRoleDialog).toBeVisible();
    await memberDetail.confirmRemoveRoleButton.click();

    await expect(
      memberDetail.toast(
        t('member_management.member.detail.roles.remove_confirm.success', {
          roleName: role.name,
        }),
      ),
    ).toBeVisible();
    await expect(memberDetail.removeRoleDialog).toBeHidden();
    await expect(row).toBeHidden();

    await expect
      .poll(
        async () => {
          const roles = await listOrgMemberRoles(org.orgId, user.user_id);
          return roles.some((r) => r.id === role.id);
        },
        { timeout: 10_000 },
      )
      .toBe(false);

    const members = await listOrgMembers(org.orgId);
    expect(members.some((m) => m.user_id === user.user_id)).toBe(true);
  });
});

test.describe('Remove member from organization (detail page)', () => {
  let createdUserId: string | undefined;

  test.afterEach(async () => {
    if (createdUserId) await deleteUser(createdUserId).catch(() => undefined);
  });

  test('removes the member and navigates back to the members list', async ({ page }) => {
    const email = uniqueEmail('detail-remove-member');
    const user = await createUser({
      email,
      password: `Ft!${Math.random().toString(36).slice(2)}A1`,
      name: 'FT Detail Remove Member',
      connectionName,
    });
    createdUserId = user.user_id;
    await addMembers(org.orgId, [user.user_id]);
    await waitForOrgMember(org.orgId, user.user_id);

    const memberDetail = new MemberDetailPage(page);
    await memberDetail.goto(reactSpaNpmApp.routes.memberDetail(user.user_id));

    await expect(memberDetail.detailsTab).toHaveAttribute('data-state', 'active');

    await memberDetail.openRemoveFromOrganizationDialog();
    await expect(memberDetail.removeFromOrganizationDialog).toBeVisible();
    await memberDetail.confirmRemoveFromOrganizationButton.click();

    await expect(memberDetail.successToast).toBeVisible();

    await expect(page).toHaveURL(new RegExp(`${reactSpaNpmApp.routes.memberManagement}/?$`));

    await expect
      .poll(
        async () => {
          const members = await listOrgMembers(org.orgId);
          return members.some((m) => m.user_id === user.user_id);
        },
        { timeout: 10_000 },
      )
      .toBe(false);
  });
});
