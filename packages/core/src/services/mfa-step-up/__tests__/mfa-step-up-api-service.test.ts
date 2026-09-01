import { describe, it, expect, afterEach, vi } from 'vitest';

import { stubFetch } from '../../../api/__tests__/__mocks__/api-utils.mocks';
import type { ProxyAuthConfig, SpaAuthConfig } from '../../../auth/auth-types';
import {
  TEST_DOMAIN,
  createMockContextInterface,
} from '../../../internals/__mocks__/shared/api-service.mocks';
import { initializeMfaStepUpClient } from '../mfa-step-up-api-service';

const PROXY_URL = 'https://proxy.example.com';
const MFA_TOKEN = 'test-mfa-token';

const PROXY_AUTH: ProxyAuthConfig = { mode: 'proxy', proxyUrl: PROXY_URL };

describe('initializeMfaStepUpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('mode selection', () => {
    it('returns contextInterface.mfa in SPA mode', () => {
      const contextInterface = createMockContextInterface();
      const auth: SpaAuthConfig = { mode: 'spa', domain: TEST_DOMAIN, contextInterface };
      const client = initializeMfaStepUpClient(auth);

      expect(client).toBe(contextInterface.mfa);
    });

    it('returns a proxy client in proxy mode', () => {
      const client = initializeMfaStepUpClient(PROXY_AUTH);

      expect(client).toBeDefined();
      expect(typeof client.getAuthenticators).toBe('function');
      expect(typeof client.enroll).toBe('function');
      expect(typeof client.challenge).toBe('function');
      expect(typeof client.verify).toBe('function');
    });
  });

  describe('proxy client - getAuthenticators', () => {
    it('makes GET request to /auth/mfa/authenticators with Authorization header', async () => {
      const mockFetch = stubFetch(true, []);

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.getAuthenticators(MFA_TOKEN);

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_URL}/auth/mfa/authenticators`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({ Authorization: `Bearer ${MFA_TOKEN}` }),
        }),
      );
    });

    it('returns parsed JSON response', async () => {
      const authenticators = [{ id: 'auth_1', authenticatorType: 'otp', active: true }];
      stubFetch(true, authenticators);

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      const result = await client.getAuthenticators(MFA_TOKEN);

      expect(result).toEqual(authenticators);
    });

    it('throws parsed error body on non-ok response', async () => {
      const errorBody = { error: 'mfa_required', error_description: 'MFA required' };
      stubFetch(false, errorBody);

      const client = initializeMfaStepUpClient(PROXY_AUTH);

      await expect(client.getAuthenticators(MFA_TOKEN)).rejects.toMatchObject({ data: errorBody });
    });

    it('throws error with status when error response JSON parse fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 503,
          json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        }),
      );

      const client = initializeMfaStepUpClient(PROXY_AUTH);

      await expect(client.getAuthenticators(MFA_TOKEN)).rejects.toMatchObject({ status: 503 });
    });
  });

  describe('proxy client - enroll', () => {
    it('makes POST request to /auth/mfa/associate', async () => {
      const mockFetch = stubFetch(true, { authenticatorType: 'otp', secret: 'abc' });

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'otp' });

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_URL}/auth/mfa/associate`,
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('sends Content-Type and Authorization headers', async () => {
      const mockFetch = stubFetch();

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'otp' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${MFA_TOKEN}`,
          }),
        }),
      );
    });

    it('sends correct body for OTP enrollment', async () => {
      const mockFetch = stubFetch();

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'otp' });

      const [, init] = mockFetch.mock.calls[0]!;
      expect(JSON.parse(init.body)).toEqual({ factor_type: 'otp' });
    });

    it('sends phone_number in body for SMS enrollment', async () => {
      const mockFetch = stubFetch();

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'sms', phoneNumber: '+15551234567' });

      const [, init] = mockFetch.mock.calls[0]!;
      expect(JSON.parse(init.body)).toEqual({
        factor_type: 'sms',
        phone_number: '+15551234567',
      });
    });

    it('includes email in body for email enrollment when provided', async () => {
      const mockFetch = stubFetch();

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'email', email: 'user@example.com' });

      const [, init] = mockFetch.mock.calls[0]!;
      expect(JSON.parse(init.body)).toEqual({
        factor_type: 'email',
        email: 'user@example.com',
      });
    });

    it('omits email from body for email enrollment when not provided', async () => {
      const mockFetch = stubFetch();

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'email' });

      const [, init] = mockFetch.mock.calls[0]!;
      const body = JSON.parse(init.body);
      expect(body).toEqual({ factor_type: 'email' });
      expect(body).not.toHaveProperty('email');
    });

    it('returns parsed JSON response', async () => {
      const enrollResponse = {
        authenticatorType: 'otp',
        secret: 'TOTP_SECRET',
        barcodeUri: 'otpauth://...',
      };
      stubFetch(true, enrollResponse);

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      const result = await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'otp' });

      expect(result).toEqual(enrollResponse);
    });

    it('throws parsed error body on non-ok response', async () => {
      const errorBody = { error: 'invalid_grant', error_description: 'Invalid MFA token' };
      stubFetch(false, errorBody);

      const client = initializeMfaStepUpClient(PROXY_AUTH);

      await expect(client.enroll({ mfaToken: MFA_TOKEN, factorType: 'otp' })).rejects.toMatchObject(
        { data: errorBody },
      );
    });
  });

  describe('proxy client - challenge', () => {
    it('makes POST request to /auth/mfa/challenge', async () => {
      const mockFetch = stubFetch(true, { challengeType: 'otp' });

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.challenge({ mfaToken: MFA_TOKEN, challengeType: 'otp' });

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_URL}/auth/mfa/challenge`,
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('sends correct body with mfa_token and challenge_type', async () => {
      const mockFetch = stubFetch();

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.challenge({ mfaToken: MFA_TOKEN, challengeType: 'oob' });

      const [, init] = mockFetch.mock.calls[0]!;
      expect(JSON.parse(init.body)).toEqual({
        mfa_token: MFA_TOKEN,
        challenge_type: 'oob',
      });
    });

    it('includes authenticator_id in body when provided', async () => {
      const mockFetch = stubFetch();

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.challenge({
        mfaToken: MFA_TOKEN,
        challengeType: 'oob',
        authenticatorId: 'auth_123',
      });

      const [, init] = mockFetch.mock.calls[0]!;
      expect(JSON.parse(init.body)).toEqual({
        mfa_token: MFA_TOKEN,
        challenge_type: 'oob',
        authenticator_id: 'auth_123',
      });
    });

    it('returns parsed JSON response', async () => {
      const challengeResponse = { challengeType: 'oob', oobCode: 'oob_abc123' };
      stubFetch(true, challengeResponse);

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      const result = await client.challenge({ mfaToken: MFA_TOKEN, challengeType: 'oob' });

      expect(result).toEqual(challengeResponse);
    });

    it('throws parsed error body on non-ok response', async () => {
      const errorBody = { error: 'invalid_grant', error_description: 'Bad challenge request' };
      stubFetch(false, errorBody);

      const client = initializeMfaStepUpClient(PROXY_AUTH);

      await expect(
        client.challenge({ mfaToken: MFA_TOKEN, challengeType: 'otp' }),
      ).rejects.toMatchObject({ data: errorBody });
    });
  });

  describe('proxy client - verify', () => {
    it('makes POST request to /auth/mfa/verify', async () => {
      const mockFetch = stubFetch(true, { access_token: 'new-token' });

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.verify({ mfaToken: MFA_TOKEN, otp: '123456' });

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_URL}/auth/mfa/verify`,
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('sends snake_case request body', async () => {
      const mockFetch = stubFetch();

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      await client.verify({ mfaToken: MFA_TOKEN, otp: '654321' });

      const [, init] = mockFetch.mock.calls[0]!;
      expect(JSON.parse(init.body)).toEqual({ mfa_token: MFA_TOKEN, otp: '654321' });
    });

    it('returns parsed token response', async () => {
      const tokenResponse = {
        access_token: 'new-access-token',
        token_type: 'Bearer',
        expires_in: 86400,
      };
      stubFetch(true, tokenResponse);

      const client = initializeMfaStepUpClient(PROXY_AUTH);
      const result = await client.verify({ mfaToken: MFA_TOKEN, otp: '123456' });

      expect(result).toEqual(tokenResponse);
    });

    it('throws parsed error body on non-ok response', async () => {
      const errorBody = { error: 'invalid_grant', error_description: 'Invalid OTP' };
      stubFetch(false, errorBody);

      const client = initializeMfaStepUpClient(PROXY_AUTH);

      await expect(client.verify({ mfaToken: MFA_TOKEN, otp: '000000' })).rejects.toMatchObject({
        data: errorBody,
      });
    });

    it('throws error with status when error response JSON parse fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        }),
      );

      const client = initializeMfaStepUpClient(PROXY_AUTH);

      await expect(client.verify({ mfaToken: MFA_TOKEN, otp: '123456' })).rejects.toMatchObject({
        status: 500,
      });
    });
  });
});
