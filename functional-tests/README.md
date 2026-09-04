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
├── scripts/        # setup-org.ts, teardown-org.ts, run-tests.sh
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

   `create:organizations`, `read:organizations`, `delete:organizations`, `create:organization_connections`, `create:organization_members`, `read:organization_members`, `create:organization_member_roles`, `read:organization_member_roles`, `read:connections`, `read:roles`, `create:roles`, `delete:roles`, `read:users`, `create:users`, `delete:users`, `create:organization_invitations`, `read:organization_invitations`, `delete:organization_invitations`, `read:clients`, `update:clients`

   `read:clients` / `update:clients` are used for one thing: `setup-org.ts` raises the SPA client's refresh-token rotation **leeway** to 300s so overlapping exchanges don't fail with "invalid refresh token". Setup warns and continues if these grants are missing.

   **Deliberately no `update:organizations`:** only the component under test may modify org details (via the My Organization API). Admin write access would let an assertion pass while the component is broken. Kept separate from the SPA client so CI credentials rotate independently.

When swapping to a new tenant later, repeat these steps, update the secrets below, and delete the old M2M app. No code or spec changes needed; tenant identity is entirely secrets-driven.

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

In CI these six values live in a GitHub **Environment** (not repository secrets), same names. Locally, mirror them into a gitignored `.env` so local runs hit the same tenant.

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

> Kill any stale dev server on port 5173 before `pnpm exec playwright test`. Playwright reuses an existing server if one is bound, and if it predates the current `org:setup` it has the wrong org id baked in and login hangs at the org picker.

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

Workflow: `.github/workflows/functional-tests.yml`. Triggers on `pull_request` (paths-filtered); fork PRs are skipped since GitHub strips their secrets. Runs behind a `functional-tests` GitHub Environment (add required reviewers there to gate on approval).

Steps: `pnpm install --frozen-lockfile` → build the react package → `playwright install chromium ffmpeg` → `org:setup` → `playwright test` → `org:teardown` (`always()`) → upload the HTML report + traces (`always()`). Currently `continue-on-error` and `retries: 1` until the suite is proven stable across several consecutive runs.
