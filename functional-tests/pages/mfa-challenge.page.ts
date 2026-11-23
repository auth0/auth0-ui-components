import type { Locator, Page } from '@playwright/test';

// Universal Login's one-time-code challenge, which auth0-spa-js opens in a popup on mfa_required.
export class MfaChallengePage {
  constructor(readonly page: Page) {}

  get codeInput(): Locator {
    return this.page.getByRole('textbox', { name: /code/i });
  }

  get continueButton(): Locator {
    return this.page.getByRole('button', { name: 'Continue', exact: true });
  }

  // The SDK closes the popup itself once it has the new token.
  async submitCode(code: string): Promise<void> {
    const closed = this.page.waitForEvent('close');
    await this.codeInput.fill(code);
    await this.continueButton.click();
    await closed;
  }
}
