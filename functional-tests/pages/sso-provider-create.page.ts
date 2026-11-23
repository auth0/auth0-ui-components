import { expect, type Locator, type Page } from '@playwright/test';

import { env } from '../env';
import { t } from '../lib/i18n';

/**
 * The create wizard is three steps (select strategy → details → configure) driven by
 * async react-hook-form validation, and a click that lands while a step is still
 * mounting or validating is silently dropped. Filling a later step's field straight
 * after clicking through therefore fails as "field never appeared", 30s later, with no
 * indication that the wizard simply never advanced.
 *
 * So every transition here is explicit: advance, confirm the next step rendered, and
 * re-issue the click while the previous step is still on screen.
 */

// How long a single wizard step gets to appear before the whole flow is called stuck.
const STEP_TIMEOUT_MS = 20_000;
// Per-attempt budget inside a retry loop — short, so a stalled click is retried, not awaited.
const ATTEMPT_TIMEOUT_MS = 2_000;
// Auth0 validates the OIDC discovery URL synchronously at create time (an outbound fetch on its
// side), and a token refresh can precede the write — so on a slow/loaded CI tenant the redirect can
// land past 20s. 30s matches the toast/poll budgets; errors still surface at once via the toast.
const CREATE_TIMEOUT_MS = 30_000;

export class SsoProviderCreatePage {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('main');
  }

  async goto(routePath: string): Promise<void> {
    await this.page.goto(routePath);
  }

  // Strategy button names are hardcoded in the component (no translation key).
  get oidcStrategyButton(): Locator {
    return this.root.getByRole('button', { name: /Custom OIDC/i });
  }

  get oktaStrategyButton(): Locator {
    return this.root.getByRole('button', { name: /Okta/i });
  }

  get oktaDomainInput(): Locator {
    return this.root.getByRole('textbox', {
      name: t('idp_management.create_sso_provider.provider_configure.fields.okta.domain.label'),
    });
  }

  get nameInput(): Locator {
    return this.root.getByRole('textbox', {
      name: t('idp_management.create_sso_provider.provider_details.fields.name.label'),
      exact: true,
    });
  }

  get displayNameInput(): Locator {
    return this.root.getByRole('textbox', {
      name: t('idp_management.create_sso_provider.provider_details.fields.display_name.label'),
    });
  }

  get nextButton(): Locator {
    return this.root.getByRole('button', {
      name: t('idp_management.create_sso_provider.nextButtonLabel'),
    });
  }

  get discoveryUrlInput(): Locator {
    return this.root.getByRole('textbox', {
      name: t(
        'idp_management.create_sso_provider.provider_configure.fields.oidc.discovery_url.label',
      ),
    });
  }

  get clientIdInput(): Locator {
    return this.root.getByRole('textbox', {
      name: t('idp_management.create_sso_provider.provider_configure.fields.oidc.client_id.label'),
    });
  }

  get clientSecretInput(): Locator {
    return this.root.getByRole('textbox', {
      name: t(
        'idp_management.create_sso_provider.provider_configure.fields.oidc.client_secret.label',
      ),
    });
  }

  get createProviderButton(): Locator {
    return this.root.getByRole('button', {
      name: t('idp_management.create_sso_provider.completeButtonLabel'),
    });
  }

  // Inline react-hook-form messages, collected only to explain a stuck step.
  private async validationMessages(): Promise<string[]> {
    return this.root.locator('p[data-slot="form-message"]').allInnerTexts();
  }

  // Clicks `advance` until `nextStepField` is on screen, re-clicking only while the current step is still displayed.
  private async advanceStep(advance: Locator, nextStepField: Locator, step: string): Promise<void> {
    await expect(advance).toBeVisible();
    await advance.click();

    try {
      await expect(async () => {
        if (await nextStepField.isVisible()) return;
        if (await advance.isVisible()) {
          await advance.click({ timeout: ATTEMPT_TIMEOUT_MS });
        }
        await expect(nextStepField).toBeVisible({ timeout: ATTEMPT_TIMEOUT_MS });
      }).toPass({ timeout: STEP_TIMEOUT_MS });
    } catch (error) {
      const messages = await this.validationMessages();
      throw new Error(
        `SSO create wizard never advanced to ${step}` +
          (messages.length > 0 ? `; form validation says: ${messages.join(' | ')}` : '') +
          `\n${String(error)}`,
      );
    }
  }

  async selectOidcStrategy(): Promise<void> {
    // The strategy grid renders a spinner until the strategy list resolves.
    await expect(this.oidcStrategyButton).toBeVisible({ timeout: STEP_TIMEOUT_MS });
    await this.advanceStep(this.oidcStrategyButton, this.nameInput, 'the provider details step');
  }

  async fillProviderDetails(
    input: { name: string; displayName: string },
    nextStepField: Locator = this.discoveryUrlInput,
  ): Promise<void> {
    await this.nameInput.fill(input.name);
    await this.displayNameInput.fill(input.displayName);
    // Read both values back, because a re-render can quietly wipe the form and the only clue later
    // is a "field is required" error on a field we know we filled.
    await expect(this.nameInput).toHaveValue(input.name);
    await expect(this.displayNameInput).toHaveValue(input.displayName);
    await this.advanceStep(this.nextButton, nextStepField, 'the configuration step');
  }

  async fillOidcConfiguration(input: {
    discoveryUrl: string;
    clientId: string;
    clientSecret: string;
  }): Promise<void> {
    await this.discoveryUrlInput.fill(input.discoveryUrl);
    await this.clientIdInput.fill(input.clientId);
    await this.clientSecretInput.fill(input.clientSecret);
  }

  // Submits and waits for the redirect; surfaces any error toast immediately so failures don't look like timeouts.
  async submitCreate(): Promise<void> {
    await expect(this.createProviderButton).toBeEnabled();

    const errorToast = this.page.locator('[data-sonner-toast][data-type="error"]');
    // An error toast from earlier in the wizard is not this submit's failure, so ignore those.
    const preexistingErrors = await errorToast.allInnerTexts();

    await this.createProviderButton.click();

    const newErrors = async () =>
      (await errorToast.allInnerTexts()).filter((text) => !preexistingErrors.includes(text));
    const status = async () => {
      if (new URL(this.page.url()).pathname.endsWith('/sso-providers')) return 'done';
      return (await newErrors()).length > 0 ? 'error' : 'waiting';
    };

    let outcome: string | undefined;
    try {
      await expect
        .poll(async () => (outcome = await status()), {
          timeout: CREATE_TIMEOUT_MS,
          intervals: [200],
        })
        .not.toBe('waiting');
    } catch {
      const messages = await this.validationMessages();
      throw new Error(
        'SSO provider create did not navigate to the providers list' +
          (messages.length > 0 ? `; form validation says: ${messages.join(' | ')}` : ''),
      );
    }

    if (outcome === 'error') {
      throw new Error(`SSO provider create failed: ${(await newErrors()).join(' | ')}`);
    }
  }

  // discoveryUrl defaults to this tenant's own .well-known/openid-configuration —
  // Auth0 validates it synchronously at create time, must be a real OIDC document.
  async createOidcProvider(input: {
    name: string;
    displayName: string;
    clientId?: string;
    clientSecret?: string;
    discoveryUrl?: string;
  }): Promise<void> {
    await this.selectOidcStrategy();
    await this.fillProviderDetails({ name: input.name, displayName: input.displayName });
    await this.fillOidcConfiguration({
      discoveryUrl:
        input.discoveryUrl ?? `https://${env.FT_AUTH0_DOMAIN}/.well-known/openid-configuration`,
      clientId: input.clientId ?? 'ft-test-client-id',
      clientSecret: input.clientSecret ?? 'ft-test-client-secret',
    });
    await this.submitCreate();
  }

  async createOktaProvider(input: {
    name: string;
    displayName: string;
    domain: string;
    clientId: string;
    clientSecret: string;
  }): Promise<void> {
    await expect(this.oktaStrategyButton).toBeVisible({ timeout: STEP_TIMEOUT_MS });
    await this.advanceStep(this.oktaStrategyButton, this.nameInput, 'the provider details step');
    await this.fillProviderDetails(
      { name: input.name, displayName: input.displayName },
      this.oktaDomainInput,
    );
    await this.oktaDomainInput.fill(input.domain);
    await this.clientIdInput.fill(input.clientId);
    await this.clientSecretInput.fill(input.clientSecret);
    await this.submitCreate();
  }
}
