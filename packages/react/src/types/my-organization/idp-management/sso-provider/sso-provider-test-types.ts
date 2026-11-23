/**
 * SSO provider test types.
 * @module sso-provider-test-types
 */

import type {
  CreateIdpTestResponseContent,
  GetIdpTestResponseContent,
  IdpKnownResponse,
  IdpTestUser,
  SharedComponentProps,
  SsoProviderNotificationMessages,
  SsoProviderTestMessages,
  SsoProviderTestOverlayMessages,
  SsoProviderTestResultMessages,
} from '@auth0/universal-components-core';
import type * as React from 'react';

import type {
  SSO_PROVIDER_TEST_ERROR_REASON,
  SSO_PROVIDER_TEST_STATE,
} from '@/lib/constants/my-organization/idp-management/idp-management-constants';

/** Lifecycle of a provider test. */
export type SsoProviderTestState =
  (typeof SSO_PROVIDER_TEST_STATE)[keyof typeof SSO_PROVIDER_TEST_STATE];

/** Internal phase of the test hook, before a result is derived from polling. */
export type SsoProviderTestPhase = Extract<
  SsoProviderTestState,
  | typeof SSO_PROVIDER_TEST_STATE.IDLE
  | typeof SSO_PROVIDER_TEST_STATE.STARTING
  | typeof SSO_PROVIDER_TEST_STATE.POLLING
>;

/**
 * Why a test ended in `error`:
 * - `provider`: the identity provider returned an error (see `errorMessage`).
 * - `expired`: the test no longer exists.
 * - `forbidden`: the token lacks the test scopes.
 */
export type SsoProviderTestErrorReason =
  (typeof SSO_PROVIDER_TEST_ERROR_REASON)[keyof typeof SSO_PROVIDER_TEST_ERROR_REASON];

/** CSS classes for SSO provider test components. */
export interface SsoProviderTestClasses {
  'SsoProviderTest-root'?: string;
  'SsoProviderTest-overlay'?: string;
  'SsoProviderTest-result'?: string;
}

/** Options for useSsoProviderTestService. */
export interface UseSsoProviderTestServiceOptions {
  customMessages?: Partial<SsoProviderNotificationMessages>;
}

/**
 * Poll state for the current test. `error` is set only by a fatal (403 or 404) error;
 * `timedOut` is set when the attempt or duration cap is reached.
 */
export interface SsoProviderTestPoll {
  data: GetIdpTestResponseContent | undefined;
  error: unknown;
  isPolling: boolean;
  timedOut: boolean;
  stop: () => void;
}

/** Return value of useSsoProviderTestService. */
export interface UseSsoProviderTestServiceReturn {
  startTest: () => Promise<CreateIdpTestResponseContent | null>;
  isStarting: boolean;
  poll: SsoProviderTestPoll;
}

/** Options for useSsoProviderTest. */
export interface UseSsoProviderTestOptions {
  customMessages?: Partial<SsoProviderNotificationMessages>;
}

/** Return value of useSsoProviderTest. */
export interface UseSsoProviderTestReturn {
  state: SsoProviderTestState;
  user: IdpTestUser | null;
  errorReason: SsoProviderTestErrorReason | null;
  errorMessage: string | null;
  blockedTestUrl: string | null;
  start: () => Promise<void>;
  retry: () => Promise<void>;
  cancel: () => void;
}

/** Props for SsoProviderTestPollingOverlay. */
export interface SsoProviderTestPollingOverlayProps
  extends SharedComponentProps<SsoProviderTestOverlayMessages, SsoProviderTestClasses> {
  open: boolean;
  onRetry: () => void;
  retryDisabled?: boolean;
  onCloseAutoFocus?: (event: Event) => void;
  blockedTestUrl?: string | null;
}

/** Props for SsoProviderTestResult. */
export interface SsoProviderTestResultProps
  extends SharedComponentProps<SsoProviderTestResultMessages, SsoProviderTestClasses> {
  state: Extract<
    SsoProviderTestState,
    | typeof SSO_PROVIDER_TEST_STATE.SUCCESS
    | typeof SSO_PROVIDER_TEST_STATE.ERROR
    | typeof SSO_PROVIDER_TEST_STATE.TIMEOUT
  >;
  user?: IdpTestUser | null;
  errorReason?: SsoProviderTestErrorReason | null;
  errorMessage?: string | null;
  copyable?: boolean;
  actions?: React.ReactNode;
}

/** Props for SsoProviderTestCard. */
export interface SsoProviderTestCardProps
  extends SharedComponentProps<SsoProviderTestMessages, SsoProviderTestClasses> {
  provider: IdpKnownResponse;
  permissionDenied?: boolean;
  notificationMessages?: Partial<SsoProviderNotificationMessages>;
  variant?: 'card' | 'inline';
  details?: React.ReactNode;
}
