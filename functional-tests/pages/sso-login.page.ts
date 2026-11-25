import type { Locator, Page } from '@playwright/test';

import { reactSpaNpmApp } from '../apps/react-spa-npm.app';
import { env } from '../env';

const appOrigin = new URL(reactSpaNpmApp.baseURL).origin;

export class SsoLoginPage {
  constructor(
    private readonly page: Page,
    private readonly connectionName: string,
  ) {}

  get signInButton(): Locator {
    return this.page.getByRole('button', { name: /sign in/i });
  }

  private get connectionButton(): Locator {
    return this.page.getByRole('button', { name: new RegExp(this.connectionName, 'i') });
  }

  private isOnOkta(): boolean {
    return new URL(this.page.url()).hostname === env.FT_OKTA_DOMAIN;
  }

  private isOnApp(): boolean {
    return new URL(this.page.url()).origin === appOrigin;
  }

  async gotoInvitation(invitation: string, organization: string): Promise<void> {
    const params = new URLSearchParams({ invitation, organization });
    await this.page.goto(`${reactSpaNpmApp.baseURL}/auth/login?${params}`);
  }

  async gotoOrganizationLogin(organization: string, connection: string): Promise<void> {
    const params = new URLSearchParams({ organization, connection });
    await this.page.goto(`${reactSpaNpmApp.baseURL}/auth/login?${params}`);
  }

  private get acceptButton(): Locator {
    return this.page.getByRole('button', { name: /^(accept invitation|accept|continue)$/i });
  }

  private isSignedInLanding(): boolean {
    const url = new URL(this.page.url());
    return url.origin === appOrigin && !url.pathname.startsWith('/auth/');
  }

  async completeSsoLogin(): Promise<void> {
    for (let step = 0; step < 6; step += 1) {
      await Promise.any([
        this.page.waitForURL((url) => url.hostname === env.FT_OKTA_DOMAIN),
        this.page.waitForURL(
          (url) => url.origin === appOrigin && !url.pathname.startsWith('/auth/'),
        ),
        this.connectionButton.waitFor({ state: 'visible' }),
        this.acceptButton.waitFor({ state: 'visible' }),
      ]);

      if (this.isSignedInLanding()) return;
      if (new URL(this.page.url()).pathname.startsWith('/u/login')) {
        throw new Error(
          `Landed on the email login page instead of the SSO connection: ${this.page.url()}`,
        );
      }
      if (this.isOnOkta()) {
        await this.signInToOkta();
        await this.page.waitForURL((url) => url.hostname !== env.FT_OKTA_DOMAIN);
        continue;
      }

      const before = this.page.url();
      const next = (await this.connectionButton.isVisible())
        ? this.connectionButton
        : this.acceptButton;
      await Promise.all([this.page.waitForURL((url) => url.href !== before), next.click()]);
    }
    throw new Error(`SSO login did not complete; stuck at ${this.page.url()}`);
  }

  private async signInToOkta(): Promise<void> {
    const username = this.page.getByLabel(/username/i);
    await Promise.any([
      username.waitFor({ state: 'visible' }),
      this.page.waitForURL((url) => url.origin === appOrigin),
    ]);
    if (this.isOnApp()) return;

    await username.fill(env.FT_OKTA_SSO_USER_EMAIL);

    const next = this.page.getByRole('button', { name: /^next$/i });
    if (await next.isVisible()) await next.click();

    await this.page.locator('input[type="password"]').fill(env.FT_OKTA_SSO_USER_PASSWORD);
    await this.page.getByRole('button', { name: /^(verify|sign in)$/i }).click();
  }

  async signOut(): Promise<void> {
    await this.page
      .locator('header')
      .getByRole('button')
      .filter({ has: this.page.locator('svg.lucide-user, img') })
      .click();
    await this.page.getByRole('button', { name: /sign out/i }).click();
  }
}
