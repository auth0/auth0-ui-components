import { reactSpaNpmApp } from '../apps/react-spa-npm.app';
import { env } from '../env';
import { expect, test } from '../fixtures/auth.fixture';
import { t } from '../lib/i18n';
import {
  deleteSsoProvider,
  deleteUser,
  findSsoConnectionIdByProviderName,
  findUserIdByEmail,
  getConnection,
  listOrgInvitations,
  listOrgMembers,
  waitForPropagation,
} from '../lib/management-api';
import { pollRead } from '../lib/poll';
import { requireRunState } from '../lib/run-state';
import { watchToasts } from '../lib/toast';
import { MemberManagementPage } from '../pages/member-management.page';
import { SsoLoginPage } from '../pages/sso-login.page';
import { SsoProviderCreatePage } from '../pages/sso-provider-create.page';
import { SsoProviderTablePage } from '../pages/sso-provider-table.page';

const org = requireRunState();
const strategies = ['oidc', 'okta'] as const;

for (const strategy of strategies) {
  const connectionName = `ft-${strategy}-${Date.now()}`;

  test.describe(`SSO invitation (${strategy})`, () => {
    test.setTimeout(180_000);

    let connectionId: string | undefined;

    test.afterAll(async () => {
      const userId = await findUserIdByEmail(env.FT_OKTA_SSO_USER_EMAIL).catch(() => undefined);
      if (userId) await deleteUser(userId).catch(() => undefined);
      if (connectionId) await deleteSsoProvider(connectionId).catch(() => undefined);
    });

    // OIDC and Okta: invite -> invitee signs in via Okta SSO -> becomes member
    test('invitee accepts the invitation through Okta, then signs in again as a member', async ({
      page,
      browser,
    }) => {
      const email = env.FT_OKTA_SSO_USER_EMAIL;

      // Providers only show up in the invite modal when created through the wizard.
      const ssoProviderCreate = new SsoProviderCreatePage(page);
      await ssoProviderCreate.goto(reactSpaNpmApp.routes.ssoProviderCreate);
      if (strategy === 'oidc') {
        await ssoProviderCreate.createOidcProvider({
          name: connectionName,
          displayName: connectionName,
          discoveryUrl: `https://${env.FT_OKTA_DOMAIN}/.well-known/openid-configuration`,
          clientId: env.FT_OKTA_CLIENT_ID,
          clientSecret: env.FT_OKTA_CLIENT_SECRET,
        });
      } else {
        await ssoProviderCreate.createOktaProvider({
          name: connectionName,
          displayName: connectionName,
          domain: env.FT_OKTA_DOMAIN,
          clientId: env.FT_OKTA_CLIENT_ID,
          clientSecret: env.FT_OKTA_CLIENT_SECRET,
        });
      }
      connectionId = await findSsoConnectionIdByProviderName(connectionName);

      const enabledSwitch = new SsoProviderTablePage(page).enabledSwitch(connectionName);
      const enableToasts = await watchToasts(page);
      await enabledSwitch.click();
      await enableToasts.expectSuccess(
        t('idp_management.notifications.update_success', { providerName: connectionName }),
      );
      await expect(enabledSwitch).toHaveAttribute('aria-checked', 'true');

      const memberManagement = new MemberManagementPage(page);

      await memberManagement.goto(reactSpaNpmApp.routes.memberManagement);
      await memberManagement.inviteButton.click();
      await expect(memberManagement.inviteMemberDialog).toBeVisible();
      await memberManagement.fillInviteEmail(email);
      await memberManagement.selectInviteConnection(connectionName);

      const toasts = await watchToasts(page);
      await memberManagement.inviteSubmitButton.click();
      await toasts.expectSuccess(t('member_management.invitation.create.success', { email }));

      await memberManagement.invitationsTab.click();
      const row = memberManagement.invitationRow(email);
      await expect(row).toBeVisible();
      await memberManagement.clickInvitationAction(
        row,
        memberManagement.viewInvitationDetailsMenuItem,
      );
      await memberManagement.copyInvitationUrlButton.click();
      let invitationUrl = '';
      await expect
        .poll(
          pollRead(async () => {
            invitationUrl = await page.evaluate(() => navigator.clipboard.readText());
            return invitationUrl;
          }, ''),
        )
        .toContain('invitation=');

      const link = new URL(invitationUrl);
      const invitation = link.searchParams.get('invitation');
      const organization = link.searchParams.get('organization');
      expect(invitation).toBeTruthy();
      expect(organization).toBe(org.orgId);

      const inviteeContext = await browser.newContext();
      const inviteePage = await inviteeContext.newPage();
      try {
        const sso = new SsoLoginPage(inviteePage, connectionName);

        await sso.gotoInvitation(invitation!, organization!);
        await sso.completeSsoLogin();
        await expect(sso.signInButton).toBeHidden();

        await waitForPropagation(
          `${email} to become a member of ${org.orgId}`,
          () => listOrgMembers(org.orgId),
          (members) => members.some((member) => member.email === email),
        );
        const remaining = await listOrgInvitations(org.orgId);
        expect(remaining.some((i) => i.invitee.email === email)).toBe(false);

        await sso.signOut();
        await expect(sso.signInButton).toBeVisible();

        await sso.gotoOrganizationLogin(org.orgId, (await getConnection(connectionId!)).name);
        await sso.completeSsoLogin();
        await expect(sso.signInButton).toBeHidden();

        const members = await listOrgMembers(org.orgId);
        expect(members.filter((member) => member.email === email)).toHaveLength(1);
      } finally {
        await inviteeContext.close();
      }
    });
  });
}
