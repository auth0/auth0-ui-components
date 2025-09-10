import type { CoreClientInterface } from '../auth/auth-types';

import { createMFAController } from './my-account/mfa/mfa-controller';
import type { MFAControllerInterface } from './my-account/mfa/mfa-types';

/**
 * Interface for the Authentication API service that provides access to various authentication-related operations.
 */
export interface AuthenticationAPIServiceInterface {
  /** Multi-Factor Authentication controller for managing MFA operations */
  mfa: MFAControllerInterface;
}

/**
 * Creates an Authentication API service instance with access to various authentication operations.
 *
 * @param coreClient - The core client instance that provides authentication context and token management
 * @returns An authentication API service interface with MFA controller
 *
 * @example
 * ```typescript
 * const coreClient = await createCoreClient(authDetails);
 * const authService = createAuthenticationAPIService(coreClient);
 *
 * // Use MFA operations
 * const factors = await authService.mfa.fetchFactors();
 * ```
 */
export function createAuthenticationAPIService(
  coreClient: CoreClientInterface,
): AuthenticationAPIServiceInterface {
  return {
    mfa: createMFAController(coreClient),
  };
}
