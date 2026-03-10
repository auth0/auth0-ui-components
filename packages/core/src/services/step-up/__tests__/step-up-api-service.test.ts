import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import type { AuthDetails, MfaApiClient } from '../../../auth/auth-types';
import { initializeStepUpApiService } from '../step-up-api-service';

describe('step-up-api-service', () => {
  describe('initializeStepUpApiService', () => {
    describe('SPA mode', () => {
      it('should return contextInterface.mfa when authProxyUrl is not provided', () => {
        const mockMfaClient: MfaApiClient = {
          getAuthenticators: vi.fn(),
          enroll: vi.fn(),
          challenge: vi.fn(),
          verify: vi.fn(),
          getEnrollmentFactors: vi.fn(),
        };

        const auth: AuthDetails = {
          contextInterface: {
            mfa: mockMfaClient,
          } as AuthDetails['contextInterface'],
        };

        const result = initializeStepUpApiService(auth);

        expect(result).toBe(mockMfaClient);
      });

      it('should throw error when contextInterface is not initialized', () => {
        const auth: AuthDetails = {};

        expect(() => initializeStepUpApiService(auth)).toThrow(
          'StepUpApiService: contextInterface is not initialized.',
        );
      });

      it('should throw error when contextInterface is undefined', () => {
        const auth: AuthDetails = {
          contextInterface: undefined,
        };

        expect(() => initializeStepUpApiService(auth)).toThrow(
          'StepUpApiService: contextInterface is not initialized.',
        );
      });
    });

    describe('Proxy mode', () => {
      let fetchSpy: ReturnType<typeof vi.fn>;

      beforeEach(() => {
        fetchSpy = vi.fn();
        global.fetch = fetchSpy;
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      const auth: AuthDetails = {
        authProxyUrl: 'https://proxy.example.com',
      };

      it('should return proxy MFA client when authProxyUrl is provided', () => {
        const result = initializeStepUpApiService(auth);

        expect(result).toBeDefined();
        expect(result.getAuthenticators).toBeDefined();
        expect(result.enroll).toBeDefined();
        expect(result.challenge).toBeDefined();
        expect(result.verify).toBeDefined();
      });

      it('should remove trailing slash from authProxyUrl', () => {
        const auth: AuthDetails = {
          authProxyUrl: 'https://proxy.example.com/',
        };

        fetchSpy.mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue([]),
        });

        const result = initializeStepUpApiService(auth);
        result.getAuthenticators('mfa_token_123');

        expect(fetchSpy).toHaveBeenCalledWith(
          'https://proxy.example.com/auth/mfa/authenticators?mfa_token=mfa_token_123',
        );
      });

      describe('getAuthenticators', () => {
        it('should fetch authenticators with mfa_token', async () => {
          const mockAuthenticators = [
            { id: 'auth_1', type: 'otp' },
            { id: 'auth_2', type: 'oob' },
          ];

          fetchSpy.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockAuthenticators),
          });

          const client = initializeStepUpApiService(auth);
          const result = await client.getAuthenticators('mfa_token_123');

          expect(fetchSpy).toHaveBeenCalledWith(
            'https://proxy.example.com/auth/mfa/authenticators?mfa_token=mfa_token_123',
          );
          expect(result).toEqual(mockAuthenticators);
        });

        it('should throw error when response is not ok', async () => {
          const errorBody = {
            error: 'invalid_token',
            error_description: 'Invalid MFA token',
          };

          fetchSpy.mockResolvedValue({
            ok: false,
            status: 403,
            json: vi.fn().mockResolvedValue(errorBody),
          });

          const client = initializeStepUpApiService(auth);

          await expect(client.getAuthenticators('invalid_token')).rejects.toThrow(
            'Invalid MFA token',
          );
        });

        it('should handle error when json parsing fails', async () => {
          fetchSpy.mockResolvedValue({
            ok: false,
            status: 500,
            json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
          });

          const client = initializeStepUpApiService(auth);

          await expect(client.getAuthenticators('token')).rejects.toThrow('HTTP 500');
        });
      });

      describe('enroll', () => {
        it('should enroll OTP authenticator', async () => {
          const mockResponse = {
            authenticatorType: 'otp',
            secret: 'secret_123',
            barcodeUri: 'otpauth://totp/...',
          };

          fetchSpy.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
          });

          const client = initializeStepUpApiService(auth);
          const result = await client.enroll({
            mfaToken: 'mfa_token_123',
            factorType: 'otp',
          });

          expect(fetchSpy).toHaveBeenCalledWith('https://proxy.example.com/auth/mfa/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mfaToken: 'mfa_token_123',
              authenticatorTypes: ['otp'],
            }),
          });
          expect(result).toEqual(mockResponse);
        });

        it('should enroll SMS authenticator with phone number', async () => {
          const mockResponse = {
            authenticatorType: 'sms',
            id: 'auth_123',
          };

          fetchSpy.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
          });

          const client = initializeStepUpApiService(auth);
          const result = await client.enroll({
            mfaToken: 'mfa_token_123',
            factorType: 'sms',
            phoneNumber: '+1234567890',
          });

          expect(fetchSpy).toHaveBeenCalledWith('https://proxy.example.com/auth/mfa/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mfaToken: 'mfa_token_123',
              authenticatorTypes: ['sms'],
              phoneNumber: '+1234567890',
            }),
          });
          expect(result).toEqual(mockResponse);
        });

        it('should enroll voice authenticator with phone number', async () => {
          const mockResponse = {
            authenticatorType: 'voice',
            id: 'auth_123',
          };

          fetchSpy.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
          });

          const client = initializeStepUpApiService(auth);
          const result = await client.enroll({
            mfaToken: 'mfa_token_123',
            factorType: 'voice',
            phoneNumber: '+1234567890',
          });

          expect(fetchSpy).toHaveBeenCalledWith('https://proxy.example.com/auth/mfa/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mfaToken: 'mfa_token_123',
              authenticatorTypes: ['voice'],
              phoneNumber: '+1234567890',
            }),
          });
          expect(result).toEqual(mockResponse);
        });

        it('should enroll email authenticator with email', async () => {
          const mockResponse = {
            authenticatorType: 'email',
            id: 'auth_123',
          };

          fetchSpy.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
          });

          const client = initializeStepUpApiService(auth);
          const result = await client.enroll({
            mfaToken: 'mfa_token_123',
            factorType: 'email',
            email: 'user@example.com',
          });

          expect(fetchSpy).toHaveBeenCalledWith('https://proxy.example.com/auth/mfa/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mfaToken: 'mfa_token_123',
              authenticatorTypes: ['email'],
              email: 'user@example.com',
            }),
          });
          expect(result).toEqual(mockResponse);
        });

        it('should enroll email authenticator without email field', async () => {
          const mockResponse = {
            authenticatorType: 'email',
            id: 'auth_123',
          };

          fetchSpy.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
          });

          const client = initializeStepUpApiService(auth);
          const result = await client.enroll({
            mfaToken: 'mfa_token_123',
            factorType: 'email',
          });

          expect(fetchSpy).toHaveBeenCalledWith('https://proxy.example.com/auth/mfa/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mfaToken: 'mfa_token_123',
              authenticatorTypes: ['email'],
            }),
          });
          expect(result).toEqual(mockResponse);
        });

        it('should throw error when enrollment fails', async () => {
          const errorBody = {
            error: 'enrollment_failed',
            error_description: 'Failed to enroll authenticator',
          };

          fetchSpy.mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue(errorBody),
          });

          const client = initializeStepUpApiService(auth);

          await expect(
            client.enroll({
              mfaToken: 'mfa_token_123',
              factorType: 'otp',
            }),
          ).rejects.toThrow('Failed to enroll authenticator');
        });
      });

      describe('challenge', () => {
        it('should challenge authenticator', async () => {
          const mockResponse = {
            challengeType: 'oob',
            oobCode: 'oob_code_123',
          };

          fetchSpy.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
          });

          const client = initializeStepUpApiService(auth);
          const result = await client.challenge({
            mfaToken: 'mfa_token_123',
            challengeType: 'oob',
            authenticatorId: 'auth_123',
          });

          expect(fetchSpy).toHaveBeenCalledWith('https://proxy.example.com/auth/mfa/challenge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mfaToken: 'mfa_token_123',
              challengeType: 'oob',
              authenticatorId: 'auth_123',
            }),
          });
          expect(result).toEqual(mockResponse);
        });

        it('should throw error when challenge fails', async () => {
          const errorBody = {
            error: 'challenge_failed',
            error_description: 'Failed to challenge authenticator',
          };

          fetchSpy.mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue(errorBody),
          });

          const client = initializeStepUpApiService(auth);

          await expect(
            client.challenge({
              mfaToken: 'mfa_token_123',
              challengeType: 'oob',
              authenticatorId: 'auth_123',
            }),
          ).rejects.toThrow('Failed to challenge authenticator');
        });
      });

      describe('verify', () => {
        it('should verify OTP code', async () => {
          const mockResponse = {
            access_token: 'access_token_123',
            id_token: 'id_token_123',
            expires_in: 3600,
          };

          fetchSpy.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
          });

          const client = initializeStepUpApiService(auth);
          const result = await client.verify({
            mfaToken: 'mfa_token_123',
            otp: '123456',
          });

          expect(fetchSpy).toHaveBeenCalledWith('https://proxy.example.com/auth/mfa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mfaToken: 'mfa_token_123',
              otp: '123456',
            }),
          });
          expect(result).toEqual(mockResponse);
        });

        it('should verify OOB code', async () => {
          const mockResponse = {
            access_token: 'access_token_123',
            id_token: 'id_token_123',
            expires_in: 3600,
          };

          fetchSpy.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
          });

          const client = initializeStepUpApiService(auth);
          const result = await client.verify({
            mfaToken: 'mfa_token_123',
            oobCode: 'oob_code_123',
            bindingCode: 'binding_123',
          });

          expect(fetchSpy).toHaveBeenCalledWith('https://proxy.example.com/auth/mfa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mfaToken: 'mfa_token_123',
              oobCode: 'oob_code_123',
              bindingCode: 'binding_123',
            }),
          });
          expect(result).toEqual(mockResponse);
        });

        it('should verify recovery code', async () => {
          const mockResponse = {
            access_token: 'access_token_123',
            id_token: 'id_token_123',
            expires_in: 3600,
          };

          fetchSpy.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
          });

          const client = initializeStepUpApiService(auth);
          const result = await client.verify({
            mfaToken: 'mfa_token_123',
            recoveryCode: 'recovery_123',
          });

          expect(fetchSpy).toHaveBeenCalledWith('https://proxy.example.com/auth/mfa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mfaToken: 'mfa_token_123',
              recoveryCode: 'recovery_123',
            }),
          });
          expect(result).toEqual(mockResponse);
        });

        it('should throw error when verification fails', async () => {
          const errorBody = {
            error: 'invalid_code',
            error_description: 'Invalid OTP code',
          };

          fetchSpy.mockResolvedValue({
            ok: false,
            status: 401,
            json: vi.fn().mockResolvedValue(errorBody),
          });

          const client = initializeStepUpApiService(auth);

          await expect(
            client.verify({
              mfaToken: 'mfa_token_123',
              otp: '999999',
            }),
          ).rejects.toThrow('Invalid OTP code');
        });

        it('should handle error with error properties spread', async () => {
          const errorBody = {
            error: 'invalid_code',
            error_description: 'Invalid code',
            code: 'E001',
          };

          fetchSpy.mockResolvedValue({
            ok: false,
            status: 401,
            json: vi.fn().mockResolvedValue(errorBody),
          });

          const client = initializeStepUpApiService(auth);

          try {
            await client.verify({
              mfaToken: 'mfa_token_123',
              otp: '999999',
            });
          } catch (error) {
            expect(error).toHaveProperty('error', 'invalid_code');
            expect(error).toHaveProperty('error_description', 'Invalid code');
            expect(error).toHaveProperty('code', 'E001');
            expect(error).toHaveProperty('status', 401);
            expect(error).toHaveProperty('body', errorBody);
          }
        });
      });
    });
  });
});
