import type { Page } from '@playwright/test';

import { reactSpaNpmApp } from '../apps/react-spa-npm.app';
import { expect, test } from '../fixtures/auth.fixture';
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

function uniqueProviderName(label: string): string {
  return `e2e-${label}-${Date.now()}`;
}

async function seedProvider(page: Page, name: string, displayName: string): Promise<string> {
  const create = new SsoProviderCreatePage(page);
  await create.goto(createRoute);
  await create.createOidcProvider({ name, displayName });
  return findSsoConnectionIdByProviderName(name);
}

test.describe('Edit provider configuration', () => {
  const seededConnectionIds: string[] = [];

  test.afterAll(async () => {
    await Promise.all(
      seededConnectionIds.map((id) => deleteSsoProvider(id).catch(() => undefined)),
    );
  });

  test('saving a display name change persists via a real update', async ({ page }) => {
    const name = uniqueProviderName('editcfg');
    const originalDisplayName = 'FT Edit Config Provider';
    const updatedDisplayName = 'FT Edit Config Provider Updated';

    const connectionId = await seedProvider(page, name, originalDisplayName);
    seededConnectionIds.push(connectionId);

    const ssoProviderEdit = new SsoProviderEditPage(page);
    await ssoProviderEdit.goto(reactSpaNpmApp.routes.ssoProviderEdit(connectionId));

    await ssoProviderEdit.displayNameInput.fill(updatedDisplayName);
    await ssoProviderEdit.clientSecretInput.fill('ft-test-client-secret');

    const toasts = await watchToasts(page);
    await ssoProviderEdit.saveButton.click();

    // Toast reads from pre-mutation cache — shows old name when display name itself changed.
    await toasts.expectSuccess(
      t('idp_management.notifications.update_success', { providerName: originalDisplayName }),
    );

    const connection = await getConnection(connectionId);
    expect(connection.display_name).toBe(updatedDisplayName);
  });
});

test.describe('Delete provider', () => {
  test('permanently removes the connection from the tenant', async ({ page }) => {
    const name = uniqueProviderName('editdelete');
    const displayName = 'FT Edit Delete Provider';

    const connectionId = await seedProvider(page, name, displayName);

    const ssoProviderEdit = new SsoProviderEditPage(page);
    await ssoProviderEdit.goto(reactSpaNpmApp.routes.ssoProviderEdit(connectionId));

    await ssoProviderEdit.openDeleteModal(name);
    const deleteToasts = await watchToasts(page);
    await ssoProviderEdit.confirmDelete(name);
    await deleteToasts.expectSuccess(
      t('idp_management.notifications.delete_success', { providerName: displayName }),
    );

    await expect(page).toHaveURL(new RegExp(`${reactSpaNpmApp.routes.ssoProviders}$`));
    await expect(new SsoProviderTablePage(page).addProviderButton).toBeVisible();
    await expect(getConnection(connectionId)).rejects.toThrow();
  });
});

test.describe('Remove provider from organization', () => {
  const seededConnectionIds: string[] = [];

  test.afterAll(async () => {
    await Promise.all(
      seededConnectionIds.map((id) => deleteSsoProvider(id).catch(() => undefined)),
    );
  });

  test('detaches the connection from the org without deleting it', async ({ page }) => {
    const name = uniqueProviderName('editremove');
    const displayName = 'FT Edit Remove Provider';

    const connectionId = await seedProvider(page, name, displayName);
    seededConnectionIds.push(connectionId);

    const ssoProviderEdit = new SsoProviderEditPage(page);
    await ssoProviderEdit.goto(reactSpaNpmApp.routes.ssoProviderEdit(connectionId));

    await ssoProviderEdit.openRemoveModal(name);
    const removeToasts = await watchToasts(page);
    await ssoProviderEdit.confirmRemove(name, org.orgName);
    // Match on the provider name only — the org display_name can be mutated by earlier tests in the same run.
    await removeToasts.expectSuccess(`${displayName} has been removed from`);

    await expect(page).toHaveURL(new RegExp(`${reactSpaNpmApp.routes.ssoProviders}$`));
    await expect(new SsoProviderTablePage(page).addProviderButton).toBeVisible();

    const connection = await getConnection(connectionId);
    expect(connection.id).toBe(connectionId);

    const enabled = await listOrgEnabledConnections(org.orgId);
    expect(enabled.map((c) => c.connection_id)).not.toContain(connectionId);
  });
});
