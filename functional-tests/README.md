# Functional Tests

End-to-end tests for `auth0-ui-components` using Playwright against a live Auth0 tenant. No mocks: real login, real API calls, real database.

---

## Layout

```
functional-tests/
├── specs/          # Test files, one per component area
├── pages/          # Page objects; all locators live here, none in specs
├── fixtures/       # Playwright fixtures (auth, unauthenticated)
├── lib/            # Shared utilities (management-api, i18n, run-state, toast, poll)
├── scripts/        # setup-org.ts, teardown-org.ts, cleanup-stale-resources.ts, run-tests.sh
├── apps/           # App adapters (baseURL, webServer config, route map per example app)
└── plan/           # Local design notes (not shipped)
```

The suite runs against `examples/react-spa-npm`, a Vite React SPA that consumes the built packages. Tests run as an **end user** (real browser login, My Organization API). Setup and verification run as a **machine** (M2M credentials, Management API, no browser). Each run creates a throwaway org via `scripts/setup-org.ts`, runs all tests, then always deletes it via `scripts/teardown-org.ts`, pass or fail.

---

## Tenant provisioning

The suite needs a correctly configured Auth0 tenant before any env var below exists.

**Tenant-level prerequisites** (enable these in the dashboard first):

| Capability                          | Where                               | Needed for                              |
| ----------------------------------- | ----------------------------------- | --------------------------------------- |
| **My Organization API**             | Dashboard → Applications → APIs     | All tests; components call this API     |
| **`my_org_member_management` flag** | Auth0 support/dashboard tenant flag | Member-management / member-detail specs |

**Provisioning steps:**

1. Create the tenant (any name, e.g. `ft-auth0-uic`).
2. Install the Auth0 CLI: `brew install auth0/auth0-cli/auth0`.
3. Run bootstrap, choosing "Full Example App Experience" + "React with npm":
   ```bash
   cd examples/scripts && pnpm install
   pnpm run auth0:bootstrap auth0-uic-ci.<region>.auth0.com
   ```
   Creates the **SPA client** (5173 callbacks, org-login required), the demo connection, an admin role with `my_org` scopes, `demo-org`, and one admin member.
4. Create the **CI test user** in the tenant: a dedicated email (e.g. a `+ci` alias) + strong password. This is the identity Playwright logs in as; each run's `setup-org.ts` adds it to the run's ephemeral org and grants it admin, so no manual org membership is needed here.
5. Create a **separate M2M app** for setup/teardown (Applications → Create → Machine to Machine), authorized for the **Management API**, granting exactly:

   `create:organizations`, `read:organizations`, `delete:organizations`, `create:organization_connections`, `create:organization_members`, `read:organization_members`, `create:organization_member_roles`, `read:organization_member_roles`, `read:connections`, `delete:connections`, `read:roles`, `create:roles`, `delete:roles`, `read:users`, `create:users`, `delete:users`, `create:organization_invitations`, `read:organization_invitations`, `delete:organization_invitations`, `read:clients`, `update:clients`, `create:organization_discovery_domains`, `read:organization_discovery_domains`, `update:organization_discovery_domains`, `delete:organization_discovery_domains`

   The `*_organization_discovery_domains` scopes let `fixtures/domain.fixture.ts` seed pending and verified domains directly through the Management API (a verified one needs no DNS record) and clean them up, so specs that aren't about the create flow don't click through it.

   `read:clients` / `update:clients` are used for one thing: `setup-org.ts` raises the SPA client's refresh-token rotation **leeway** to 300s so overlapping exchanges don't fail with "invalid refresh token". Setup warns and continues if these grants are missing.

   **Deliberately no `update:organizations`:** only the component under test may modify org details (via the My Organization API). Admin write access would let an assertion pass while the component is broken. Kept separate from the SPA client so CI credentials rotate independently.

When swapping to a new tenant later, repeat these steps, update the secrets below, and delete the old M2M app. No code or spec changes needed; tenant identity is entirely secrets-driven.

---

## Okta console setup (SSO invitation spec)

One Okta app serves both strategies: the `oidc` test points Auth0's `Custom OIDC` connection at the org's discovery URL (`https://<okta host>/.well-known/openid-configuration`), and the `okta` test points Auth0's `Okta` connection at the org host. Both use the same client ID and secret. Nothing is set up by hand in Auth0; the test creates and deletes its connection through the SSO wizard. The Okta org is shared, so scope every change to this one app and user, and don't edit built-in or shared policies.

### 1. Create the app

Admin console > Applications > Applications > Create App Integration > **Classic experience** tab > Sign-in method **OIDC - OpenID Connect** > Application type **Web Application** > Next. (Not Single-Page Application: Auth0 is a confidential client and sends a client secret.)

| Setting                                 | Value                                                                                                                                                                      |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App integration name                    | `auth0-ui-components e2e`                                                                                                                                                  |
| Client definition                       | Okta-generated client ID (not CIMD)                                                                                                                                        |
| Grant type                              | Authorization Code only. Client Credentials, Refresh Token and DPoP unchecked                                                                                              |
| Sign-in redirect URI                    | `https://<your-tenant>.<region>.auth0.com/login/callback` (the Auth0 tenant callback, shared by all connections). Replace the default `localhost:8080`; wildcard unchecked |
| Sign-out redirect URIs, Trusted Origins | leave empty                                                                                                                                                                |
| Assignments                             | Skip group assignment (keeps the app off other people's dashboards); "Allow everyone in your organization" also works                                                      |
| Federation Broker Mode                  | leave **unchecked** (it disables dashboard and provisioning features, not needed)                                                                                          |

Save, then copy the client ID and secret from the General tab into `.env` (never print or paste them) and fill the other `FT_OKTA_*` variables under [Environment](#environment). The domain is the org host without `-admin`: users sign in there, and the test matches the browser hostname against it.

### 2. Sign-in policy: password only

Security > Authentication Policies > App sign-in. Attach the org's built-in `Password only` policy (its Catch-all Rule allows password only, no MFA): open the policy > Apps tab > Add app > `auth0-ui-components e2e`, or app > Sign On > User authentication > Edit. The policy list should then show "1 app". If your org has no such policy, create one and set its Catch-all Rule Access to "Allowed with password". The other built-ins (`Any two factors`, `Classic Migrated`, etc.) require more than a password and can't be used.

### 3. Test user

Directory > People > Add person:

- User type `User`, first name `FT`, last name `E2E`.
- Username and primary email both `<sso-test-user>@example.com` (use the reserved `example.com` domain so no email can reach a real person). `FT_OKTA_SSO_USER_EMAIL` must be this exact string, because the test invites that address and Auth0 rejects a mismatch.
- No groups. Activation `Activate now`.
- Check "I will set password" and set a strong password (store it in a password manager). **Uncheck** "User must change password on first login". Status must be Active.

Then open the app > Assignments > Assign > Assign to People > the test user.

### 4. One-time authenticator enrollment

The oktapreview org's authenticator Enrollment policy requires a Security Question for every user, separate from the app sign-in policy. Without it Okta shows "Set up security methods, Required now" after the password and the test stalls. Enroll once by hand:

1. In a private browser window open `https://<your-okta-org>.oktapreview.com/` and sign in as the test user.
2. Click **Set up** next to Security Question, choose a question, set the answer, and save the answer in a password manager.
3. Finish the sign-in.

Enrollment is stored on the user, so later logins don't prompt and the answer doesn't go in `.env`. Repeat it if the user is recreated or an admin resets its authenticators. To avoid the manual step, use a group-scoped Enrollment policy for a group containing only this user, with only Password required (more setup, adds shared-org objects).

### 5. Verify

Run `HEADLESS=false pnpm test specs/sso-invitation.spec.ts` twice. The second run confirms the enrollment was a one-time prompt.

---

## Environment

Copy `.env.example` to `.env` and fill in:

```
FT_AUTH0_DOMAIN
FT_AUTH0_SPA_CLIENT_ID
FT_AUTH0_MGMT_CLIENT_ID
FT_AUTH0_MGMT_CLIENT_SECRET
FT_TEST_USER_EMAIL
FT_TEST_USER_PASSWORD
```

The connection and admin role are looked up by name at runtime, using the defaults below. Override them only if you used different names in bootstrap:

```
FT_CONNECTION_NAME  # default "Universal-Components-Demo"
FT_ADMIN_ROLE_NAME  # default "admin"
```

In CI these six values are GitHub repository secrets with the same names. Locally, mirror them into a gitignored `.env` so local runs hit the same tenant.

**Required by the SSO invitation spec** (`specs/sso-invitation.spec.ts`). Any missing variable fails the run before it starts, naming the missing ones:

```
FT_OKTA_DOMAIN               # Okta org host without "-admin", e.g. <your-okta-org>.oktapreview.com
FT_OKTA_CLIENT_ID
FT_OKTA_CLIENT_SECRET
FT_OKTA_SSO_USER_EMAIL       # also the invited email; must match the Okta username exactly
FT_OKTA_SSO_USER_PASSWORD
```

These need a real Okta app and test user. Console setup: [Okta console setup](#okta-console-setup-sso-invitation-spec). In CI they are five more repository secrets.

Read required variables through `env` from `env.ts`, never `process.env`. Each one is checked when it's first read, so a standalone script like the cleanup only needs the variables it uses; `setup-org.ts` still checks the full list up front, so a test run fails before it starts. Optional variables and flags (`FT_CONNECTION_NAME`, `CI`, `HEADLESS`, …) are read from `process.env` directly.

---

## Running

```bash
# First time / after package changes (from repo root)
pnpm install
pnpm build          # required: the example app runs dist/, not source

# Then from functional-tests/
nvm use             # pins Node 22.22.3
pnpm test           # org:setup → playwright test → org:teardown
```

**Fast iteration**, when working on a spec and you don't want a fresh org every run:

```bash
pnpm run org:setup
pnpm exec playwright test                      # repeat as needed
pnpm exec playwright test --grep "spec name"
pnpm run org:teardown
```

`pnpm test` forwards args straight through, so `pnpm test --grep "..."` works too (it just wraps a fresh org around the run).

**Headless** (default is headed locally):

```bash
HEADLESS=true pnpm exec playwright test
```

> Kill any stale dev server on port 5173 before `pnpm exec playwright test`. Playwright reuses an existing server if one is bound, and if it predates the current `org:setup` it has a deleted org id baked in. Login then ends at `http://localhost:5173/?error=invalid_request&error_description=parameter organization is invalid`. Kill it with `lsof -ti tcp:5173 -sTCP:LISTEN | xargs kill`.

**Report** after a run: `pnpm run report`.

---

## Env vars injected by the harness

The example app reads these at server start; they are injected via Playwright's `webServer.env`, never written to `.env.local`.

| Variable                   | Source                                        | Purpose                                                                                                                                     |
| -------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_AUTH0_DOMAIN`        | `FT_AUTH0_DOMAIN`                             | Required; SPA config throws at load if missing                                                                                              |
| `VITE_AUTH0_CLIENT_ID`     | `FT_AUTH0_SPA_CLIENT_ID`                      | Required                                                                                                                                    |
| `VITE_AUTH0_ORGANIZATION`  | `setup-org.ts` per run, via `.run-state.json` | Pins the app to the throwaway org, skips the org picker                                                                                     |
| `VITE_QUERY_STALE_TIME_MS` | set to `2000` by the harness                  | Short enough that the Refresh button becomes clickable, but not `0`; at `0` a response landing while a row menu is open closes it mid-click |

One running server = one org value, so the org is pinned per run, not per worker.

---

## Adding a spec

**Before writing anything:** name the thing that is impossible to mock. If that's hard to write, it belongs in the unit suite. The bar is real: a save-button-disabled check was cut in favour of the existing unit test.

1. **Page object** in `pages/`: all locators here, none in the spec. Selector priority: form-control ids + `getByLabel` → role + accessible name via `lib/i18n.ts`'s `t(key)` → existing testid as scope root → new testid only as last resort.
2. **Spec** in `specs/`: use `test` from `fixtures/auth.fixture.ts`. Scope queries to `page.getByRole('main')`, not the document root. Dialogs and menus are portalled, so scope those to `page`.
3. **Independent verification** via `lib/management-api.ts`: after the end user writes, the machine reads it back. A test that only checks the UI's own feedback can pass against a no-op.
4. **Re-fetch, never cache:** anything a component can edit must be read live from the Management API at assertion time. Identity-only values (org id, connection name, role id) can be hoisted into `beforeAll`.

`.run-state.json` holds `orgId` and `orgName` only, both immutable for the run. Mutable fields (`display_name`, `branding`, members) are deliberately absent from the type, so reaching for a stale value is a compile error, not a 3am flake.

**Deliberately not built** (don't re-add without a real gap):

- Pagination/sorting: forwarding logic is fully mockable; E2E version needs exact row counts against a shared org
- Member role filter/search: non-functional, no backend API support, UI intentionally hidden
- SSO provider create: planned specs were mockable wizard-state checks
- Anything gated on a verified DNS domain: needs a real TXT record + up to 48h propagation

---

## CI

Workflow: `.github/workflows/functional-tests.yml`. It does not run on every push. Add the `run-ft` label to a PR to start a run (the workflow removes the label once it starts, so re-add it to re-run). It can also be started manually (`workflow_dispatch`) or called from the release workflow as a gate. Fork PRs are skipped since GitHub strips their secrets.

Steps: `pnpm install --frozen-lockfile` → build the react package → `playwright install chromium ffmpeg` → `org:setup` → `playwright test` → `org:teardown` (`always()`) → upload the HTML report and `test-results/` (`always()`). Playwright retries failed tests twice in CI, and traces are off in CI.

### Leaked resource cleanup

Teardown and each spec's `afterAll` clean up after themselves, but a cancelled run, crashed runner, local Ctrl-C or failed delete can leave things behind. `.github/workflows/functional-tests-cleanup.yml` runs `scripts/cleanup-stale-resources.ts` every Monday at 03:17 UTC and deletes:

| Resource      | Matched by                                                         |
| ------------- | ------------------------------------------------------------------ |
| Organizations | `ci-org-<ms>-<suffix>`                                             |
| Connections   | `con-org-<orgId>-*` whose org is being deleted or no longer exists |
| Users         | `ft-<label>-<ms>@example.com` on `FT_CONNECTION_NAME`              |
| Okta SSO user | `FT_OKTA_SSO_USER_EMAIL` with no database identity                 |
| Roles         | `ft-role-<ms>`                                                     |

Only resources older than 24h are deleted (age comes from the timestamp in the name, or `created_at` for the SSO user), so live CI runs and local sessions are safe. Each type is capped at 100 deletions per run; the rest wait for the next run. Orgs and users are read one page of 100 at a time, which assumes the FT tenant is dedicated: a tenant with 100+ other orgs or users on the connection could keep leaks off that page. The job fails if any delete fails, and the step summary lists counts.

**Keep the patterns in sync.** If you change how a test resource is named (`generateOrgName` in `setup-org.ts`, `uniqueEmail` or the `ft-role-` name in the specs) or start creating a new kind of resource, update the patterns in `scripts/cleanup-stale-resources.ts` in the same PR. Anything that doesn't match is skipped silently and left on the tenant. Run `pnpm run cleanup:stale --dry-run` to check.

Run it manually from the Actions tab (`dry_run` defaults to on), or locally:

```bash
pnpm run cleanup:stale --dry-run   # list only
pnpm run cleanup:stale             # delete
```
