import { describe, it, expect, afterEach, vi } from 'vitest';

import { stubFetch } from '../../../api/__tests__/__mocks__/api-utils.mocks';
import type { ProxyAuthConfig, SpaAuthConfig } from '../../../auth/auth-types';
import {
  TEST_DOMAIN,
  createMockContextInterface,
} from '../../../internals/__mocks__/shared/api-service.mocks';
import { createProxyMfaClient, initializeMfaStepUpClient } from '../mfa-step-up-api-client';

const PROXY_URL = 'https://proxy.example.com';
const MFA_TOKEN = 'test-mfa-token';

const PROXY_AUTH: ProxyAuthConfig = { mode: 'proxy', proxyUrl: PROXY_URL };

describe('initializeMfaStepUpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('mode selection', () => {
    it('wraps contextInterface.mfa in SPA mode', async () => {
      const contextInterface = createMockContextInterface();
      vi.mocked(contextInterface.mfa.getAuthenticators).mockResolvedValue([]);
      const auth: SpaAuthConfig = { mode: 'spa', domain: TEST_DOMAIN, contextInterface };
      const client = initializeMfaStepUpClient(auth);

      await client.getAuthenticators(MFA_TOKEN);

      expect(contextInterface.mfa.getAuthenticators).toHaveBeenCalledWith(MFA_TOKEN);
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

  describe('proxy client with a custom fetch', () => {
    it('sends every request with it, to the given base URL, and never uses the global fetch', async () => {
      const globalFetch = vi.fn();
      vi.stubGlobal('fetch', globalFetch);
      const customFetch = vi.fn(
        async () => new Response(JSON.stringify([]), { status: 200 }),
      ) as unknown as typeof fetch;

      const client = createProxyMfaClient('https://my-api.example.com', customFetch);
      await client.getAuthenticators(MFA_TOKEN);

      expect(customFetch).toHaveBeenCalledTimes(1);
      expect(vi.mocked(customFetch).mock.calls[0]?.[0]).toBe(
        'https://my-api.example.com/auth/mfa/authenticators',
      );
      expect(globalFetch).not.toHaveBeenCalled();
    });
  });

  describe('proxy client - getAuthenticators', () => {
    it('makes GET request to /auth/mfa/authenticators with Authorization header', async () => {
      const mockFetch = stubFetch(true, []);

      const client = createProxyMfaClient(PROXY_URL);
      await client.getAuthenticators(MFA_TOKEN);

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_URL}/auth/mfa/authenticators`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({ Authorization: `Bearer ${MFA_TOKEN}` }),
        }),
      );
    });

    it('reads the type and the dates from a snake_case response', async () => {
      stubFetch(true, [
        {
          id: 'auth_1',
          authenticator_type: 'oob',
          type: 'email',
          active: true,
          created_at: '2026-02-01T09:15:00.000Z',
          last_auth: '2026-05-02T10:00:00.000Z',
        },
      ]);

      const [authenticator] = await createProxyMfaClient(PROXY_URL).getAuthenticators(MFA_TOKEN);

      expect(authenticator).toMatchObject({
        authenticatorType: 'oob',
        type: 'email',
        createdAt: '2026-02-01T09:15:00.000Z',
        lastAuth: '2026-05-02T10:00:00.000Z',
      });
    });

    it('returns parsed JSON response', async () => {
      const authenticators = [{ id: 'auth_1', authenticatorType: 'otp', active: true }];
      stubFetch(true, authenticators);

      const client = createProxyMfaClient(PROXY_URL);
      const result = await client.getAuthenticators(MFA_TOKEN);

      expect(result).toEqual(authenticators);
    });

    it('throws parsed error body on non-ok response', async () => {
      const errorBody = { error: 'mfa_required', error_description: 'MFA required' };
      stubFetch(false, errorBody);

      const client = createProxyMfaClient(PROXY_URL);

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

      const client = createProxyMfaClient(PROXY_URL);

      await expect(client.getAuthenticators(MFA_TOKEN)).rejects.toMatchObject({ status: 503 });
    });
  });

  describe('proxy client - enroll', () => {
    it('makes POST request to /auth/mfa/associate', async () => {
      const mockFetch = stubFetch(true, { authenticatorType: 'otp', secret: 'abc' });

      const client = createProxyMfaClient(PROXY_URL);
      await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'otp' });

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_URL}/auth/mfa/associate`,
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('sends Content-Type and Authorization headers', async () => {
      const mockFetch = stubFetch();

      const client = createProxyMfaClient(PROXY_URL);
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

      const client = createProxyMfaClient(PROXY_URL);
      await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'otp' });

      const [, init] = mockFetch.mock.calls[0]!;
      expect(JSON.parse(init.body)).toEqual({ authenticator_types: ['otp'] });
    });

    it('sends phone_number in body for SMS enrollment', async () => {
      const mockFetch = stubFetch();

      const client = createProxyMfaClient(PROXY_URL);
      await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'sms', phoneNumber: '+15551234567' });

      const [, init] = mockFetch.mock.calls[0]!;
      expect(JSON.parse(init.body)).toEqual({
        authenticator_types: ['oob'],
        oob_channels: ['sms'],
        phone_number: '+15551234567',
      });
    });

    it('includes email in body for email enrollment when provided', async () => {
      const mockFetch = stubFetch();

      const client = createProxyMfaClient(PROXY_URL);
      await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'email', email: 'user@example.com' });

      const [, init] = mockFetch.mock.calls[0]!;
      expect(JSON.parse(init.body)).toEqual({
        authenticator_types: ['oob'],
        oob_channels: ['email'],
        email: 'user@example.com',
      });
    });

    it('omits email from body for email enrollment when not provided', async () => {
      const mockFetch = stubFetch();

      const client = createProxyMfaClient(PROXY_URL);
      await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'email' });

      const [, init] = mockFetch.mock.calls[0]!;
      const body = JSON.parse(init.body);
      expect(body).toEqual({ authenticator_types: ['oob'], oob_channels: ['email'] });
      expect(body).not.toHaveProperty('email');
    });

    it.each([
      ['otp', { authenticator_types: ['otp'] }],
      ['sms', { authenticator_types: ['oob'], oob_channels: ['sms'] }],
      ['voice', { authenticator_types: ['oob'], oob_channels: ['voice'] }],
      ['email', { authenticator_types: ['oob'], oob_channels: ['email'] }],
      ['push', { authenticator_types: ['oob'], oob_channels: ['auth0'] }],
    ] as const)(
      'asks the associate route for %s with the fields it reads',
      async (factorType, fields) => {
        const mockFetch = stubFetch();

        await createProxyMfaClient(PROXY_URL).enroll({ mfaToken: MFA_TOKEN, factorType } as never);

        const [, init] = mockFetch.mock.calls[0]!;
        expect(JSON.parse(init.body)).toMatchObject(fields);
        expect(JSON.parse(init.body)).not.toHaveProperty('factor_type');
      },
    );

    it('reads recovery codes and the binding method from a snake_case response', async () => {
      stubFetch(true, {
        authenticator_type: 'oob',
        oob_channel: 'sms',
        oob_code: 'oob-1',
        binding_method: 'prompt',
        recovery_codes: ['rc-1', 'rc-2'],
      });

      const result = await createProxyMfaClient(PROXY_URL).enroll({
        mfaToken: MFA_TOKEN,
        factorType: 'sms',
        phoneNumber: '+15551234567',
      });

      expect(result).toMatchObject({
        authenticatorType: 'oob',
        oobChannel: 'sms',
        oobCode: 'oob-1',
        bindingMethod: 'prompt',
        recoveryCodes: ['rc-1', 'rc-2'],
      });
    });

    it('returns parsed JSON response', async () => {
      const enrollResponse = {
        authenticatorType: 'otp',
        secret: 'TOTP_SECRET',
        barcodeUri: 'otpauth://...',
      };
      stubFetch(true, enrollResponse);

      const client = createProxyMfaClient(PROXY_URL);
      const result = await client.enroll({ mfaToken: MFA_TOKEN, factorType: 'otp' });

      expect(result).toEqual(enrollResponse);
    });

    it('throws parsed error body on non-ok response', async () => {
      const errorBody = { error: 'invalid_grant', error_description: 'Invalid MFA token' };
      stubFetch(false, errorBody);

      const client = createProxyMfaClient(PROXY_URL);

      await expect(client.enroll({ mfaToken: MFA_TOKEN, factorType: 'otp' })).rejects.toMatchObject(
        { data: errorBody },
      );
    });
  });

  describe('proxy client - challenge', () => {
    const challenge = (client: ReturnType<typeof createProxyMfaClient>) =>
      client.challenge({ mfaToken: MFA_TOKEN, challengeType: 'oob', authenticatorId: 'auth_123' });

    it('makes POST request to /auth/mfa/challenge', async () => {
      const mockFetch = stubFetch(true, { oob_code: 'oob_abc123' });

      await challenge(createProxyMfaClient(PROXY_URL));

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_URL}/auth/mfa/challenge`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: `Bearer ${MFA_TOKEN}` }),
        }),
      );
    });

    it('sends a snake_case body with the oob challenge type and the authenticator', async () => {
      const mockFetch = stubFetch(true, { oob_code: 'oob_abc123' });

      await challenge(createProxyMfaClient(PROXY_URL));

      const [, init] = mockFetch.mock.calls[0]!;
      expect(JSON.parse(init.body)).toEqual({
        mfa_token: MFA_TOKEN,
        challenge_type: 'oob',
        authenticator_id: 'auth_123',
      });
    });

    it.each([
      ['snake_case', { oob_code: 'oob_abc123' }],
      ['camelCase', { oobCode: 'oob_abc123' }],
    ])('returns the oob code from a %s response', async (_name, body) => {
      stubFetch(true, body);

      const result = await challenge(createProxyMfaClient(PROXY_URL));

      expect(result).toMatchObject({ challengeType: 'oob', oobCode: 'oob_abc123' });
    });

    it('throws parsed error body on non-ok response', async () => {
      const errorBody = { error: 'invalid_grant', error_description: 'Bad challenge request' };
      stubFetch(false, errorBody);

      await expect(challenge(createProxyMfaClient(PROXY_URL))).rejects.toMatchObject({
        data: errorBody,
      });
    });
  });

  describe('proxy client - verify', () => {
    const verifyCalls = [
      ['verify', { mfaToken: MFA_TOKEN, otp: '123456' }, { mfa_token: MFA_TOKEN, otp: '123456' }],
      [
        'verify',
        { mfaToken: MFA_TOKEN, oobCode: 'oob_1', bindingCode: '654321' },
        { mfa_token: MFA_TOKEN, oob_code: 'oob_1', binding_code: '654321' },
      ],
      [
        'verify',
        { mfaToken: MFA_TOKEN, recoveryCode: 'ABCD' },
        { mfa_token: MFA_TOKEN, recovery_code: 'ABCD' },
      ],
    ] as const;

    const call = (
      client: ReturnType<typeof createProxyMfaClient>,
      method: (typeof verifyCalls)[number][0],
      params: (typeof verifyCalls)[number][1],
    ) => (client[method] as (p: typeof params) => Promise<unknown>)(params);

    it.each(verifyCalls)(
      '%s makes a POST to /auth/mfa/verify with a snake_case body',
      async (method, params, body) => {
        const mockFetch = stubFetch(true, { access_token: 'new-token' });

        await call(createProxyMfaClient(PROXY_URL), method, params);

        expect(mockFetch).toHaveBeenCalledWith(
          `${PROXY_URL}/auth/mfa/verify`,
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({ Authorization: `Bearer ${MFA_TOKEN}` }),
          }),
        );
        expect(JSON.parse(mockFetch.mock.calls[0]![1].body)).toEqual(body);
      },
    );

    it.each(verifyCalls)('%s returns the token response', async (method, params) => {
      const tokenResponse = {
        access_token: 'new-access-token',
        token_type: 'Bearer',
        expires_in: 86400,
      };
      stubFetch(true, tokenResponse);

      const result = await call(createProxyMfaClient(PROXY_URL), method, params);

      expect(result).toEqual(tokenResponse);
    });

    it('sends the session cookie with verify, which stores the new token there', async () => {
      const mockFetch = stubFetch(true, { success: true });

      await createProxyMfaClient(PROXY_URL).verify({ mfaToken: MFA_TOKEN, otp: '123456' });

      expect(mockFetch.mock.calls[0]![1].credentials).toBe('include');
    });

    it.each([
      [
        'asking for the authenticators',
        (client: ReturnType<typeof createProxyMfaClient>) => client.getAuthenticators(MFA_TOKEN),
      ],
      [
        'sending a challenge',
        (client: ReturnType<typeof createProxyMfaClient>) =>
          client.challenge({ mfaToken: MFA_TOKEN, challengeType: 'oob', authenticatorId: 'a' }),
      ],
    ])('does not force cookies on for %s', async (_name, call) => {
      const mockFetch = stubFetch(true, []);

      await call(createProxyMfaClient(PROXY_URL));

      expect(mockFetch.mock.calls[0]![1].credentials).toBeUndefined();
    });

    it('returns the next recovery code after a recovery code was used', async () => {
      stubFetch(true, { access_token: 'token', recovery_code: 'NEXT-CODE' });

      const result = await createProxyMfaClient(PROXY_URL).verify({
        mfaToken: MFA_TOKEN,
        recoveryCode: 'ABCD',
      });

      expect(result.recovery_code).toBe('NEXT-CODE');
    });

    it.each(verifyCalls)(
      '%s throws the parsed error body on a non-ok response',
      async (method, params) => {
        const errorBody = { error: 'invalid_grant', error_description: 'Invalid code' };
        stubFetch(false, errorBody);

        await expect(call(createProxyMfaClient(PROXY_URL), method, params)).rejects.toMatchObject({
          data: errorBody,
        });
      },
    );

    it('throws an error with the status when the error response is not JSON', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        }),
      );

      await expect(
        createProxyMfaClient(PROXY_URL).verify({ mfaToken: MFA_TOKEN, otp: '123456' }),
      ).rejects.toMatchObject({ status: 500 });
    });
  });
});
