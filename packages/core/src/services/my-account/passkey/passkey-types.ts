/**
 * Passkey type definitions, re-exported from the myaccount-js SDK.
 * @module passkey-types
 */

import type { MyAccount } from '@auth0/myaccount-js';

/** SDK type for the passkey authentication method. */
export type PasskeyAuthenticationMethod = MyAccount.AuthenticationMethodPasskey;

/** SDK response type for listing authentication methods. */
export type ListPasskeysResponse = MyAccount.ListAuthenticationMethodsResponseContent;

/** SDK response type for creating (starting) passkey enrollment. */
export type CreatePasskeyResponse = MyAccount.PasskeyCreationResponse;

/** SDK request type for creating a passkey authentication method. */
export type CreatePasskeyRequest = MyAccount.CreatePasskeyAuthenticationMethod;

/** SDK type for the public key options returned by the server during enrollment. */
export type PasskeyPublicKeyCredentialCreationOptions =
  MyAccount.PublicKeyCredentialCreationOptions;

/** SDK request type for verifying (completing) passkey enrollment. */
export type VerifyPasskeyRequest = MyAccount.VerifyPasskeyAuthenticationMethod;

/** SDK type for the attestation response sent to the server during enrollment. */
export type PasskeyAttestationResponse = MyAccount.AuthenticatorAttestationResponse;

/** SDK type for the attestation response data payload. */
export type PasskeyAttestationResponseData = MyAccount.AuthenticatorAttestationResponseData;

/** SDK request type for renaming an authentication method. */
export type UpdatePasskeyRequest = MyAccount.UpdateAuthenticationMethodRequestContent;

/** SDK response type for renaming an authentication method. */
export type UpdatePasskeyResponse = MyAccount.UpdateAuthenticationMethodResponseContent;
