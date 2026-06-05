/**
 * Passkey type definitions
 * @module passkey-types
 */

import type { MyAccount } from '@auth0/myaccount-js';

export type PasskeyAuthenticationMethod = MyAccount.AuthenticationMethodPasskey;

export type ListPasskeysResponse = MyAccount.ListAuthenticationMethodsResponseContent;

export type CreatePasskeyResponse = MyAccount.PasskeyCreationResponse;

export type CreatePasskeyRequest = MyAccount.CreatePasskeyAuthenticationMethod;

export type PasskeyPublicKeyCredentialCreationOptions =
  MyAccount.PublicKeyCredentialCreationOptions;

export type VerifyPasskeyRequest = MyAccount.VerifyPasskeyAuthenticationMethod;

export type PasskeyAttestationResponse = MyAccount.AuthenticatorAttestationResponse;

export type PasskeyAttestationResponseData = MyAccount.AuthenticatorAttestationResponseData;

export type UpdatePasskeyRequest = MyAccount.UpdateAuthenticationMethodRequestContent;

export type UpdatePasskeyResponse = MyAccount.UpdateAuthenticationMethodResponseContent;
