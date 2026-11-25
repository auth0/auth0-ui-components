import crypto from 'node:crypto';

import type { Page } from '@playwright/test';

import { reactSpaNpmApp } from '../apps/react-spa-npm.app';
import { expect, loginWithPassword, test } from '../fixtures/auth.fixture';
import { t } from '../lib/i18n';
import {
  addMembers,
  assignMemberRoles,
  createUser,
  deleteInvitation,
  deleteUser,
  findRoleIdByName,
  listOrgInvitations,
  setTotpAuthenticator,
  waitForMemberRole,
  waitForPropagation,
} from '../lib/management-api';
import { requireRunState } from '../lib/run-state';
import { watchToasts } from '../lib/toast';
import { generateTotpSecret, nextTotpCode } from '../lib/totp';
import { MemberManagementPage } from '../pages/member-management.page';
import { MfaChallengePage } from '../pages/mfa-challenge.page';

/**
 * Needs the tenant's step-up Action (tenant/step-up-action.js) and the OTP factor enabled; see the
 * README. The Action only challenges users flagged in app_metadata, and only this spec creates one,
 * so the shared CI user and every other spec run unchallenged in any order.
 */

const org = requireRunState();
const route = reactSpaNpmApp.routes.memberManagement;
const connectionName = process.env.FT_CONNECTION_NAME || 'Universal-Components-Demo';
const adminRoleName = process.env.FT_ADMIN_ROLE_NAME || 'admin';

const stepUpEmail = uniqueEmail('stepup-admin');
const stepUpPassword = `Ft!${crypto.randomUUID()}A1`;
const totpSecret = generateTotpSecret();

function uniqueEmail(label: string): string {
  return `ft-${label}-${Date.now()}@example.com`;
}

test.describe('Step-up MFA on invite', () => {
  // Fresh login per test: an empty token cache guarantees the invite scope is requested, and challenged, again.
  test.use({ storageState: { cookies: [], origins: [] }, persistSession: false });

  let stepUpUserId: string | undefined;

  test.beforeAll(async () => {
    const [user, adminRoleId] = await Promise.all([
      createUser({
        email: stepUpEmail,
        password: stepUpPassword,
        name: 'FT Step-up Admin',
        connectionName,
        appMetadata: { ft_step_up: true },
      }),
      findRoleIdByName(adminRoleName),
    ]);
    stepUpUserId = user.user_id;

    await setTotpAuthenticator(user.user_id, totpSecret);
    await addMembers(org.orgId, [user.user_id]);
    await assignMemberRoles(org.orgId, user.user_id, [adminRoleId]);
    await waitForMemberRole(org.orgId, user.user_id, adminRoleId);
  });

  test.afterAll(async () => {
    if (stepUpUserId) await deleteUser(stepUpUserId).catch(() => undefined);
  });

  async function openInviteDialog(page: Page, inviteeEmail: string): Promise<MemberManagementPage> {
    await loginWithPassword(page, stepUpEmail, stepUpPassword);

    const memberManagement = new MemberManagementPage(page);
    await memberManagement.goto(route);
    await memberManagement.inviteButton.click();
    await expect(memberManagement.inviteMemberDialog).toBeVisible();
    await memberManagement.fillInviteEmail(inviteeEmail);
    return memberManagement;
  }

  test('asks for a one-time code in a popup, then sends the invite', async ({ page }) => {
    const email = uniqueEmail('stepup-invitee');
    const memberManagement = await openInviteDialog(page, email);

    const toasts = await watchToasts(page);
    const popup = page.waitForEvent('popup');
    await memberManagement.inviteSubmitButton.click();

    const mfa = new MfaChallengePage(await popup);
    await mfa.submitCode(await nextTotpCode(totpSecret));

    await toasts.expectSuccess(t('member_management.invitation.create.success', { email }));
    const invitations = await waitForPropagation(
      `an invitation for ${email} to be listed on ${org.orgId}`,
      () => listOrgInvitations(org.orgId),
      (list) => list.some((invitation) => invitation.invitee.email === email),
    );

    const created = invitations.find((invitation) => invitation.invitee.email === email);
    if (created) await deleteInvitation(org.orgId, created.id).catch(() => undefined);
  });

  test('closing the popup without a code sends nothing', async ({ page }) => {
    const email = uniqueEmail('stepup-cancelled');
    const memberManagement = await openInviteDialog(page, email);

    const toasts = await watchToasts(page);
    const popup = page.waitForEvent('popup');
    await memberManagement.inviteSubmitButton.click();

    const mfa = new MfaChallengePage(await popup);
    await expect(mfa.codeInput).toBeVisible();

    // The query client may retry and reopen the popup; close every one so the request can settle.
    page.on('popup', (retried) => void retried.close());
    await mfa.page.close();

    // The toast only marks the mutation as settled; its text is the SDK's, so it isn't asserted.
    await toasts.expectAnyError();
    // The API call never left the browser (no token was issued), so there is nothing to wait for.
    const invitations = await listOrgInvitations(org.orgId);
    expect(invitations.some((invitation) => invitation.invitee.email === email)).toBe(false);
  });
});
