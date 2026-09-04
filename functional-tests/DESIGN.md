# Functional Tests Design

We ship **auth0-ui-components**, a library of pre-built React components for Auth0's My Organization and My Account self-service UIs. In practice that means drop-in components for org self-service: display name, branding, members, SSO, and more, all wired to live Auth0 APIs with no backend code required from the consumer.

Unit tests cover rendering, validation, and component logic well, but they stub the API layer, so they can never prove a real token was issued, a real API call went through, or that a write actually landed. This suite covers that gap, and nothing more: every test here exists because something in it can't be faked. If a mock would do, it doesn't belong here.

This doc explains the key design decisions: how the run is structured, how we handled token rotation, and what tradeoffs shaped the approach.

Code lives in [auth0/auth0-ui-components](https://github.com/auth0/auth0-ui-components) under
[`functional-tests/`](https://github.com/auth0/auth0-ui-components/tree/main/functional-tests).
Follow the links to dig into any part.

---

## The shape of a run

Playwright owns the whole run: it drives the browser as a real user and manages the test lifecycle. Everything outside the browser (org creation, verification, cleanup) is plain TypeScript calling the Auth0 Management API directly.

```
  [ setup-org ]  ──▶  [ example app ]  ──▶  [ tests ]  ──▶  [ teardown-org ]
```

Two identities drive everything:

- **End user**: real browser, real Auth0 login. Drives the components as an org member would.
- **Machine**: M2M credentials, Management API, no browser. Everything around the components: setup, teardown, and verification.

**Setup** (`scripts/setup-org.ts`) creates a throwaway org for the run with all fields pre-filled, adds the CI user, grants admin, and writes the org id to `.run-state.json`. It's a fresh org every run, so a run only ever sees state it set up itself, never leftovers from an earlier one. Playwright then passes it to the dev server as an environment variable (`VITE_AUTH0_ORGANIZATION`), pinning the app to that org for the whole run.

**Example app** is built and served exactly as a consumer would; `npm install`, import the published package, wire up the SDK. The suite runs against that built artifact, not source, so if a build step silently breaks something it shows up here before a customer sees it.

**Tests** drive the browser as the end user and verify writes independently via the Management API as the machine. A component claiming success isn't enough; the data has to actually be there. A setup step logs in through the real Universal Login screen and saves the session; subsequent tests reuse it. How that works (and almost didn't) is the subject of the next two sections.

**Teardown** (`scripts/teardown-org.ts`) deletes the org, always, even on failure. It's an explicit shell step, not a Playwright hook, so a job timeout can't skip it.

---

## Sharing login across tests

Logging in per-test would cost 5–10 seconds each. Instead, Playwright's `storageState` (a snapshot of cookies and localStorage) captures the session once and reuses it. Every test starts from that snapshot in its own fresh browser context: isolated, but no extra login cost. The suite runs single-worker and serialized (`workers: 1`), so after each test the fixture writes the context's storage state back to disk, and the next test picks up exactly where the last one left off.

Injecting a token into localStorage directly doesn't work here. The SDK's token cache is an implementation detail with no stable shape to inject; real login is the only path in.

That sharing mechanism is what the next section is about, because saving and reloading the session is exactly where the tenant's refresh-token rotation policy introduced a subtle race.

---

## The token problem that nearly sank it

With refresh token rotation, the moment a token is used to mint a new one, the old one is destroyed. Tests mostly run from a warm cache, but a token exchange fires whenever a test first touches a new API scope. If the snapshot lands mid-exchange, it captures a token that's about to be burned:

```
  test A:  loads R1  →  first-touch scope fires an exchange  →  R1 burned, R2 issued
                        ↑ snapshot saved HERE still holds R1
  test B:  loads the snapshot → R1 → "invalid refresh token"
```

We couldn't just turn rotation off: for a browser-based SPA, Auth0 only issues a refresh token _when_ rotation is on. Our first instinct was to police the timing: wait for token traffic to quiet down before snapshotting, probe the reloaded session, retry when it looked stale. It worked, but it was a pile of heuristics guarding a race we'd chosen to run into. The real fix was to stop racing. `scripts/setup-org.ts` widens the SPA client's rotation **grace period** (`leeway`) to 300 seconds during setup (only when the client actually rotates and its leeway is lower), so a just-burned token keeps working for a while:

```
  test B:  loads the snapshot → R1  →  R1 still valid (within grace)  →  exchange → R2
                                                                          ↑ snapshot now saves R2
```

The torn snapshot still happens. The next test loads it, and its first exchange heals the session forward to a fresh token within the grace window. The race stopped mattering, and an entire layer of timing code came out.

---

## A few problems worth calling out

**Toasts vanish before you can assert them.** Under CI load, a toast can appear and auto-dismiss before the next poll tick. `locator.innerText()` simply misses it. A `MutationObserver` injected into the page captures every toast synchronously on DOM insertion, so a toast that disappears in 100ms is still recorded. As a bonus: if an error toast appears before the expected success toast, the assertion fails immediately rather than waiting out the full timeout.

**Hardcoded strings silently go stale.** A component's copy changes, the test keeps asserting the old string, and it passes against nothing real. Instead, every assertion goes through a `t('some.key')` helper that loads the actual `en-US.json` translation catalog at test time. If a key is renamed or its copy changes, the test fails at `t()` with a clear "key not found" error, not a silent mismatch.

**Management API rate limits turn CI-only flakes invisible.** Verification polls fire rapid back-to-back reads, and under CI's slower propagation they poll longer and harder than they do locally, enough to trip the per-tenant rate limit. A 429 that kills a poll looks identical to "the write never happened." The fix: a throttle tracks when the next request may be sent and sleeps the difference before every call, so the limit is never reached in the first place. A retry path handles the rare 429 that slips through.

**CI failures are hard to debug without a replay.** Locally you have Playwright's trace viewer, headed mode, slow-motion. In CI you only have what you captured intentionally. Every run uploads the full HTML report and a video recording of the browser as a CI artifact on failure, so you get a frame-by-frame replay of exactly what broke without reproducing it locally.

---

## The one rule underneath all of it

**Cache identity, read anything editable live.** The org's id and name never change during a run, so we hold on to them. But its display name, branding, members (anything a component can change mid-run) we re-read from the API at the moment we assert, never from a cached copy. We learned this the hard way. A test compared against a value it had cached earlier; another test had since changed that value for real; the first test failed while nothing was broken. The fix wasn't a cleverer cache. It was dropping the mutable fields from the shared state type entirely, so reaching for a stale display name isn't a judgment call, it just doesn't type-check. The mistake became a compile error instead of a 3am flake.

---

For setup instructions, commands, and contribution guidelines see the [README](./README.md).
