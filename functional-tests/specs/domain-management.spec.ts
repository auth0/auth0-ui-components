import { reactSpaNpmApp } from '../apps/react-spa-npm.app';
import { expect, test, uniqueDomain } from '../fixtures/domain.fixture';
import { testUnauthenticatedRedirect } from '../fixtures/unauthenticated';
import { t } from '../lib/i18n';
import { deleteSsoProvider, findSsoConnectionIdByProviderName } from '../lib/management-api';
import { watchToasts } from '../lib/toast';
import { DomainManagementPage } from '../pages/domain-management.page';
import { SsoProviderCreatePage } from '../pages/sso-provider-create.page';

const route = reactSpaNpmApp.routes.domainManagement;

testUnauthenticatedRedirect(route, (page) => new DomainManagementPage(page).addDomainButton);

test.describe('Create domain', () => {
  test('creates a domain and shows its DNS verification details', async ({ page }) => {
    const domainName = uniqueDomain('create');
    const domainManagement = new DomainManagementPage(page);
    await domainManagement.goto(route);

    await domainManagement.addDomainButton.click();
    await expect(domainManagement.createDomainDialog).toBeVisible();
    await domainManagement.domainUrlInput.fill(domainName);

    const toasts = await watchToasts(page);
    await domainManagement.createSubmitButton.click();
    await toasts.expectSuccess(
      t('domain_management.domain_table.notifications.domain_create.success', { domainName }),
    );
    await expect(domainManagement.createDomainDialog).toBeHidden();

    const verifyDialog = domainManagement.verifyDialog(domainName);
    await expect(verifyDialog).toBeVisible();
    await expect(domainManagement.txtRecordNameField).not.toHaveValue('');
    await expect(domainManagement.txtRecordContentField).not.toHaveValue('');

    await domainManagement.verifyDoneButton.click();
    await expect(verifyDialog).toBeHidden();

    await expect(domainManagement.domainRow(domainName)).toContainText(
      t('domain_management.shared.domain_statuses.pending'),
    );
  });
});

test.describe('Configure domain', () => {
  test('associates and removes a provider for a verified domain', async ({
    page,
    verifiedDomain,
  }) => {
    const domainName = verifiedDomain.domain;
    const providerName = `e2e-domain-${Date.now()}`;
    const providerDisplayName = `FT Domain Provider ${Date.now()}`;

    // Providers created outside the wizard never appear in the Configure list, so seed through it.
    const ssoProviderCreate = new SsoProviderCreatePage(page);
    await ssoProviderCreate.goto(reactSpaNpmApp.routes.ssoProviderCreate);
    await ssoProviderCreate.createOidcProvider({
      name: providerName,
      displayName: providerDisplayName,
    });
    const connectionId = await findSsoConnectionIdByProviderName(providerName);

    try {
      const domainManagement = new DomainManagementPage(page);
      await domainManagement.goto(route);
      const row = domainManagement.domainRow(domainName);
      await expect(row).toContainText(t('domain_management.shared.domain_statuses.verified'));

      await domainManagement.clickRowAction(row, domainManagement.configureMenuItem);
      const configureDialog = domainManagement.configureDialog(domainName);
      await expect(domainManagement.providerSelect(domainName)).toBeEnabled();

      await domainManagement.selectProvider(domainName, providerDisplayName);
      const associateToasts = await watchToasts(page);
      await domainManagement.configureSaveButton(domainName).click();
      await associateToasts.expectSuccess(
        t('domain_management.domain_table.notifications.domain_associate_provider.success', {
          domainName,
          idp: providerName,
        }),
      );
      await expect(configureDialog).toBeHidden();

      // Reload so the association is read back from the API, not from the modal's local state.
      await page.reload();
      await domainManagement.clickRowAction(
        domainManagement.domainRow(domainName),
        domainManagement.configureMenuItem,
      );
      const removeButton = domainManagement.removeProviderButton(domainName, providerDisplayName);
      await expect(removeButton).toBeEnabled();
      await expect(domainManagement.providerSelect(domainName)).toBeHidden();

      const removeToasts = await watchToasts(page);
      await removeButton.click();
      await removeToasts.expectSuccess(
        t('domain_management.domain_table.notifications.domain_delete_provider.success', {
          domainName,
          idp: providerName,
        }),
      );
      await expect(removeButton).toBeHidden();
      await expect(domainManagement.providerSelect(domainName)).toBeVisible();
    } finally {
      await deleteSsoProvider(connectionId).catch(() => undefined);
    }
  });
});

test.describe('Delete domain', () => {
  test('deletes a domain and removes it from the table', async ({ page, pendingDomain }) => {
    const domainName = pendingDomain.domain;
    const domainManagement = new DomainManagementPage(page);
    await domainManagement.goto(route);

    const row = domainManagement.domainRow(domainName);
    await domainManagement.clickRowAction(row, domainManagement.deleteMenuItem);

    await expect(domainManagement.deleteDomainDialog).toContainText(
      t('domain_management.domain_delete.modal.description.pending', { domainName }),
    );
    const toasts = await watchToasts(page);
    await domainManagement.confirmDelete();
    await toasts.expectSuccess(
      t('domain_management.domain_table.notifications.domain_delete.success', { domainName }),
    );
    await expect(row).toBeHidden();
  });
});
