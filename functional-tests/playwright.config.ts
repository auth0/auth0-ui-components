import './load-env';

import { defineConfig } from '@playwright/test';

import { reactSpaNpmApp } from './apps/react-spa-npm.app';

export default defineConfig({
  testDir: './specs',
  // All tests share one live tenant/org, one login, and a rate-limited API. fullyParallel: false
  // serializes within a file but still runs spec files in parallel — workers: 1 prevents that,
  // avoiding display_name races, 429s, and refresh-token conflicts across files.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: process.env.CI ? 120_000 : 60_000,
  expect: {
    // Governs every bare web-first assertion, including ones that render backend data straight
    // after a write (a row appearing, a toggle's aria-checked). On a slow/loaded CI tenant those
    // my-org reads lag just like the mgmt polls, so this matches the 30s toast/poll/create budgets.
    timeout: 30_000,
  },
  use: {
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    permissions: ['clipboard-read', 'clipboard-write'],
    headless: process.env.CI ? true : process.env.HEADLESS === 'true',
  },
  projects: [
    {
      name: reactSpaNpmApp.name,
      use: { baseURL: reactSpaNpmApp.baseURL },
    },
  ],
  webServer: [
    {
      command: reactSpaNpmApp.webServer.command,
      cwd: reactSpaNpmApp.webServer.cwd,
      url: reactSpaNpmApp.baseURL,
      env: reactSpaNpmApp.webServer.env,
      reuseExistingServer: !process.env.CI,
      // CI builds the app before serving it (see react-spa-npm.app.ts), so it needs more than a
      // dev server's start-up time.
      timeout: process.env.CI ? 240_000 : 60_000,
    },
  ],
});
