import { reactSpaNpmApp } from '../apps/react-spa-npm.app';
import { expect, test } from '../fixtures/auth.fixture';
import { testUnauthenticatedRedirect } from '../fixtures/unauthenticated';
import { t } from '../lib/i18n';
import { DomainManagementPage } from '../pages/domain-management.page';

const route = reactSpaNpmApp.routes.domainManagement;

testUnauthenticatedRedirect(route, (page) => new DomainManagementPage(page).addDomainButton);

function uniqueDomain(label: string): string {
  return `ft-${label}-${Date.now()}.com`;
}

async function deleteDomainRow(domainManagement: DomainManagementPage, domainName: string) {
  const row = domainManagement.domainRow(domainName);
  await domainManagement.rowActionsMenuButton(row).click();
  await domainManagement.deleteMenuItem.click();
  await domainManagement.confirmDelete();
  await expect(domainManagement.domainRow(domainName)).toBeHidden();
}

test.describe('Create domain', () => {
  test('creates a real domain and surfaces its real DNS verification details', async ({ page }) => {
    const domainName = uniqueDomain('create');
    const domainManagement = new DomainManagementPage(page);
    await domainManagement.goto(route);

    await domainManagement.addDomainButton.click();
    await expect(domainManagement.createDomainDialog).toBeVisible();
    await domainManagement.domainUrlInput.fill(domainName);
    await domainManagement.createSubmitButton.click();

    await expect(
      domainManagement.toast(
        t('domain_management.domain_table.notifications.domain_create.success', { domainName }),
      ),
    ).toBeVisible();
    await expect(domainManagement.createDomainDialog).toBeHidden();

    const verifyDialog = domainManagement.verifyDialog(domainName);
    await expect(verifyDialog).toBeVisible();
    await expect(domainManagement.txtRecordNameField(domainName)).not.toHaveValue('');
    await expect(domainManagement.txtRecordContentField(domainName)).not.toHaveValue('');

    // No real DNS record was published — verifying reliably fails, automatable negative path.
    await domainManagement.verifySubmitButton(domainName).click();
    await expect(domainManagement.verifyErrorAlert(domainName)).toContainText(
      t('domain_management.domain_verify.modal.errors.verification_failed', { domainName }),
    );
    await expect(verifyDialog).toBeVisible();

    await domainManagement.verifyDoneButton(domainName).click();
    await expect(verifyDialog).toBeHidden();

    const row = domainManagement.domainRow(domainName);
    await expect(row).toContainText(t('domain_management.shared.domain_statuses.pending'));

    await deleteDomainRow(domainManagement, domainName);
  });
});

test.describe('Pending domain row actions', () => {
  test('offers view and verify, but not configure, for a pending domain', async ({ page }) => {
    const domainName = uniqueDomain('actions');
    const domainManagement = new DomainManagementPage(page);
    await domainManagement.goto(route);

    await domainManagement.addDomainButton.click();
    await domainManagement.domainUrlInput.fill(domainName);
    await domainManagement.createSubmitButton.click();

    const verifyDialog = domainManagement.verifyDialog(domainName);
    await expect(verifyDialog).toBeVisible();
    await domainManagement.verifyDoneButton(domainName).click();
    await expect(verifyDialog).toBeHidden();

    const row = domainManagement.domainRow(domainName);
    await expect(row).toBeVisible();
    await domainManagement.rowActionsMenuButton(row).click();

    await expect(domainManagement.viewMenuItem).toBeVisible();
    await expect(domainManagement.verifyMenuItem).toBeVisible();
    await expect(domainManagement.deleteMenuItem).toBeVisible();
    await expect(domainManagement.configureMenuItem).toBeHidden();

    await page.keyboard.press('Escape');
    await deleteDomainRow(domainManagement, domainName);
  });
});

test.describe('Delete domain', () => {
  test('deletes a pending domain, with copy warning about its pending status', async ({ page }) => {
    const domainName = uniqueDomain('delete');
    const domainManagement = new DomainManagementPage(page);
    await domainManagement.goto(route);

    await domainManagement.addDomainButton.click();
    await domainManagement.domainUrlInput.fill(domainName);
    await domainManagement.createSubmitButton.click();

    const verifyDialog = domainManagement.verifyDialog(domainName);
    await expect(verifyDialog).toBeVisible();
    await domainManagement.verifyDoneButton(domainName).click();
    await expect(verifyDialog).toBeHidden();

    const row = domainManagement.domainRow(domainName);
    await domainManagement.rowActionsMenuButton(row).click();
    await domainManagement.deleteMenuItem.click();

    await expect(domainManagement.deleteDomainDialog).toBeVisible();
    await expect(domainManagement.deleteDomainDialog).toContainText(
      t('domain_management.domain_delete.modal.description.pending', { domainName }),
    );
    await domainManagement.confirmDelete();

    await expect(
      domainManagement.toast(
        t('domain_management.domain_table.notifications.domain_delete.success', { domainName }),
      ),
    ).toBeVisible();
    await expect(row).toBeHidden();
  });
});
