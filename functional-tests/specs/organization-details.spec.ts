import { reactSpaNpmApp } from '../apps/react-spa-npm.app';
import { expect, test } from '../fixtures/auth.fixture';
import { testUnauthenticatedRedirect } from '../fixtures/unauthenticated';
import { getOrganization } from '../lib/management-api';
import { requireRunState } from '../lib/run-state';
import { OrganizationDetailsPage } from '../pages/organization-details.page';

const org = requireRunState();
const route = reactSpaNpmApp.routes.organizationManagement;

function uniqueDisplayName(): string {
  return `FT Updated ${Date.now()}`;
}

testUnauthenticatedRedirect(route, (page) => new OrganizationDetailsPage(page).nameInput);

test.describe('OrganizationDetailsEdit', () => {
  test("renders the form populated with the organization's real values", async ({ page }) => {
    const orgDetails = new OrganizationDetailsPage(page);

    // display_name and logo are editable — read live so this spec isn't order-dependent.
    const live = await getOrganization(org.orgId);

    await orgDetails.goto(route);

    await expect(orgDetails.root).toBeVisible();
    await expect(orgDetails.nameInput).toHaveValue(org.orgName);
    await expect(orgDetails.displayNameInput).toHaveValue(live.display_name ?? '');
    await expect(orgDetails.logoUrlInput).toHaveValue(live.branding?.logo_url ?? '');
  });

  test('persists an edited display name, verified independently via the Management API', async ({
    page,
  }) => {
    const orgDetails = new OrganizationDetailsPage(page);
    const newDisplayName = uniqueDisplayName();

    await orgDetails.goto(route);
    await expect(orgDetails.root).toBeVisible();

    await orgDetails.setDisplayName(newDisplayName);
    await orgDetails.save();

    await expect(orgDetails.saveSuccessToast(newDisplayName)).toBeVisible();
    await expect
      .poll(async () => (await getOrganization(org.orgId)).display_name, { timeout: 10_000 })
      .toBe(newDisplayName);
  });

  test('shows the persisted display name after a reload', async ({ page }) => {
    const orgDetails = new OrganizationDetailsPage(page);
    const newDisplayName = uniqueDisplayName();

    await orgDetails.goto(route);
    await expect(orgDetails.root).toBeVisible();

    await orgDetails.setDisplayName(newDisplayName);
    await orgDetails.save();
    await expect(orgDetails.saveSuccessToast(newDisplayName)).toBeVisible();

    await page.reload();

    await expect(orgDetails.displayNameInput).toHaveValue(newDisplayName);
  });
});
