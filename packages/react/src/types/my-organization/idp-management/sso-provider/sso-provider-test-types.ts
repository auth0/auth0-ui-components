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

import type { UsePollUntilReturn } from '@/types/poll-types';

/** Lifecycle of a provider test. */
export type SsoProviderTestState =
  | 'idle'
  | 'starting'
  | 'polling'
  | 'success'
  | 'error'
  | 'timeout';

/**
 * Why a test ended in `error`:
 * - `provider`: the identity provider returned an error (see `errorMessage`).
 * - `expired`: the test no longer exists.
 * - `forbidden`: the token lacks the test scopes.
 */
export type SsoProviderTestErrorReason = 'provider' | 'expired' | 'forbidden';

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

/** Return value of useSsoProviderTestService. */
export interface UseSsoProviderTestServiceReturn {
  startTest: () => Promise<CreateIdpTestResponseContent | null>;
  isStarting: boolean;
  poll: UsePollUntilReturn<GetIdpTestResponseContent>;
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
  blockedTestUrl?: string | null;
}

/** Props for SsoProviderTestResult. */
export interface SsoProviderTestResultProps
  extends SharedComponentProps<SsoProviderTestResultMessages, SsoProviderTestClasses> {
  state: Extract<SsoProviderTestState, 'success' | 'error' | 'timeout'>;
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
}
