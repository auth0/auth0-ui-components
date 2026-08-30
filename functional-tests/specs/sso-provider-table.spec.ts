import { reactSpaNpmApp } from '../apps/react-spa-npm.app';
import { expect, test } from '../fixtures/auth.fixture';
import { testUnauthenticatedRedirect } from '../fixtures/unauthenticated';
import { t } from '../lib/i18n';
import {
  deleteSsoProvider,
  findSsoConnectionIdByProviderName,
  getConnection,
  listOrgEnabledConnections,
} from '../lib/management-api';
import { requireRunState } from '../lib/run-state';
import { watchToasts } from '../lib/toast';
import { SsoProviderCreatePage } from '../pages/sso-provider-create.page';
import { SsoProviderEditPage } from '../pages/sso-provider-edit.page';
import { SsoProviderTablePage } from '../pages/sso-provider-table.page';

const org = requireRunState();
const createRoute = reactSpaNpmApp.routes.ssoProviderCreate;

testUnauthenticatedRedirect(
  reactSpaNpmApp.routes.ssoProviders,
  (page) => new SsoProviderTablePage(page).addProviderButton,
);

function uniqueProviderName(label: string): string {
  return `e2e-${label}-${Date.now()}`;
}

test.describe('SSO providers list', () => {
  const seededConnectionIds: string[] = [];

  test.afterAll(async () => {
    await Promise.all(
      seededConnectionIds.map((id) => deleteSsoProvider(id).catch(() => undefined)),
    );
  });

  test('renders a real seeded OIDC provider with its name and display name', async ({ page }) => {
    const name = uniqueProviderName('oidc');
    const displayName = 'FT Seeded OIDC Provider';

    // Must seed via the wizard — providers created outside it never appear in the component's list (empirically verified).
    const ssoProviderCreate = new SsoProviderCreatePage(page);
    await ssoProviderCreate.goto(createRoute);
    await ssoProviderCreate.createOidcProvider({ name, displayName });

    const ssoProviderTable = new SsoProviderTablePage(page);
    const row = ssoProviderTable.providerRow(name);
    await expect(row).toBeVisible();
    await expect(row).toContainText(name);
    await expect(row).toContainText(displayName);

    const connectionId = await findSsoConnectionIdByProviderName(name);
    seededConnectionIds.push(connectionId);
    const connection = await getConnection(connectionId);
    expect(connection.strategy).toBe('oidc');
    expect(connection.display_name).toBe(displayName);
  });
});

test.describe('Enable/disable toggle', () => {
  const seededConnectionIds: string[] = [];

  test.afterAll(async () => {
    await Promise.all(
      seededConnectionIds.map((id) => deleteSsoProvider(id).catch(() => undefined)),
    );
  });

  test('enabling and disabling a provider updates its org enabled_connections', async ({
    page,
  }) => {
    const name = uniqueProviderName('toggle');
    const displayName = 'FT Toggle Provider';

    const ssoProviderCreate = new SsoProviderCreatePage(page);
    await ssoProviderCreate.goto(createRoute);
    await ssoProviderCreate.createOidcProvider({ name, displayName });

    const connectionId = await findSsoConnectionIdByProviderName(name);
    seededConnectionIds.push(connectionId);

    const ssoProviderTable = new SsoProviderTablePage(page);
    const switchControl = ssoProviderTable.enabledSwitch(name);
    await expect(ssoProviderTable.providerRow(name)).toBeVisible();
    await expect(switchControl).toHaveAttribute('aria-checked', 'false');

    // Enabling and disabling emit identical copy, and toasts live for 4s. A watcher per action
    // requires a *new* toast, so the disable assertion can't be satisfied by the enable toast.
    const updateToast = t('idp_management.notifications.update_success', {
      providerName: displayName,
    });

    const enableToasts = await watchToasts(page);
    await switchControl.click();
    await enableToasts.expectSuccess(updateToast);
    await expect(switchControl).toHaveAttribute('aria-checked', 'true');

    let enabled = await listOrgEnabledConnections(org.orgId);
    expect(enabled.map((c) => c.connection_id)).toContain(connectionId);

    const disableToasts = await watchToasts(page);
    await switchControl.click();
    await disableToasts.expectSuccess(updateToast);
    await expect(switchControl).toHaveAttribute('aria-checked', 'false');

    enabled = await listOrgEnabledConnections(org.orgId);
    expect(enabled.map((c) => c.connection_id)).not.toContain(connectionId);
  });
});

test.describe('Refresh button', () => {
  const seededConnectionIds: string[] = [];

  test.afterAll(async () => {
    await Promise.all(
      seededConnectionIds.map((id) => deleteSsoProvider(id).catch(() => undefined)),
    );
  });

  test('picks up a provider created in another tab after clicking Refresh', async ({
    page,
    context,
  }) => {
    const name = uniqueProviderName('refresh');
    const displayName = 'FT Refresh Provider';

    const ssoProviderTable = new SsoProviderTablePage(page);
    await ssoProviderTable.goto(reactSpaNpmApp.routes.ssoProviders);
    await expect(ssoProviderTable.providerRow(name)).toBeHidden();

    const secondPage = await context.newPage();
    const secondTabCreate = new SsoProviderCreatePage(secondPage);
    await secondTabCreate.goto(createRoute);
    await secondTabCreate.createOidcProvider({ name, displayName });

    // Wait for the row before closing: closing mid-read can kill a token refresh after the server
    // rotated it, leaving the saved session dead and failing the NEXT test instead of this one.
    await expect(new SsoProviderTablePage(secondPage).providerRow(name)).toBeVisible();
    await secondPage.close();

    const connectionId = await findSsoConnectionIdByProviderName(name);
    seededConnectionIds.push(connectionId);

    await expect(ssoProviderTable.providerRow(name)).toBeHidden();
    await ssoProviderTable.refreshButton.click();
    await expect(ssoProviderTable.providerRow(name)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  const seededConnectionIds: string[] = [];

  test.afterAll(async () => {
    await Promise.all(
      seededConnectionIds.map((id) => deleteSsoProvider(id).catch(() => undefined)),
    );
  });

  test('"Add Provider" navigates to the create wizard', async ({ page }) => {
    const ssoProviderTable = new SsoProviderTablePage(page);
    await ssoProviderTable.goto(reactSpaNpmApp.routes.ssoProviders);

    await ssoProviderTable.addProviderButton.click();
    await expect(page).toHaveURL(new RegExp(`${reactSpaNpmApp.routes.ssoProviderCreate}$`));
    await expect(new SsoProviderCreatePage(page).oidcStrategyButton).toBeVisible();
  });

  test('row menu "Edit" navigates to that provider\'s edit page', async ({ page }) => {
    const name = uniqueProviderName('editnav');
    const displayName = 'FT Edit Nav Provider';

    const ssoProviderCreate = new SsoProviderCreatePage(page);
    await ssoProviderCreate.goto(createRoute);
    await ssoProviderCreate.createOidcProvider({ name, displayName });

    const connectionId = await findSsoConnectionIdByProviderName(name);
    seededConnectionIds.push(connectionId);

    const ssoProviderTable = new SsoProviderTablePage(page);
    await ssoProviderTable.clickEditAction(name);

    await expect(page).toHaveURL(
      new RegExp(`${reactSpaNpmApp.routes.ssoProviderEdit(connectionId)}$`),
    );
    await expect(new SsoProviderEditPage(page).displayNameInput).toBeVisible();
  });
});
