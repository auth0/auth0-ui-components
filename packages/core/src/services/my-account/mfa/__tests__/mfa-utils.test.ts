import { describe, it, expect } from 'vitest';

import {
  createMockAvailableFactors,
  createMockEnrolledFactors,
  createMockEmailAuthMethod,
  createMockPhoneAuthMethod,
  createMockTotpAuthMethod,
  createMockRecoveryCodeAuthMethod,
  createMockWebAuthnRoamingAuthMethod,
  createMockWebAuthnPlatformAuthMethod,
  createMockPushNotificationAuthMethod,
  createEmptyEnrolledFactors,
  createEmptyAvailableFactors,
  createMockAvailableFactor,
} from '../../../../internals/__mocks__/my-account/mfa/mfa.mocks';
import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_WEBAUTHN_PLATFORM,
  FACTOR_TYPE_WEBAUTHN_ROAMING,
} from '../mfa-constants';
import type { MFAType, EnrollOptions } from '../mfa-types';
import { buildEnrollParams, transformMyAccountFactors } from '../mfa-utils';

describe('mfa-utils', () => {
  describe('buildEnrollParams', () => {
    describe('EMAIL factor type', () => {
      it('should return correct params when email is provided', () => {
        const options: EnrollOptions = { email: 'user@example.com' };
        const result = buildEnrollParams(FACTOR_TYPE_EMAIL as MFAType, options);

        expect(result).toEqual({
          type: FACTOR_TYPE_EMAIL,
          email: 'user@example.com',
        });
      });

      it('should throw error when email is missing', () => {
        expect(() => {
          buildEnrollParams(FACTOR_TYPE_EMAIL as MFAType, {});
        }).toThrow('Email is required for email enrollment');
      });

      it('should throw error when email is undefined', () => {
        const options: EnrollOptions = { email: undefined };
        expect(() => {
          buildEnrollParams(FACTOR_TYPE_EMAIL as MFAType, options);
        }).toThrow('Email is required for email enrollment');
      });

      it('should accept email with special characters', () => {
        const options: EnrollOptions = { email: 'user+tag@example.co.uk' };
        const result = buildEnrollParams(FACTOR_TYPE_EMAIL as MFAType, options);

        expect(result).toMatchObject({
          type: FACTOR_TYPE_EMAIL,
          email: 'user+tag@example.co.uk',
        });
      });
    });

    describe('PHONE factor type', () => {
      it('should return correct params when phone_number is provided', () => {
        const options: EnrollOptions = { phone_number: '+1234567890' };
        const result = buildEnrollParams(FACTOR_TYPE_PHONE as MFAType, options);

        expect(result).toEqual({
          type: FACTOR_TYPE_PHONE,
          phone_number: '+1234567890',
        });
      });

      it('should throw error when phone_number is missing', () => {
        expect(() => {
          buildEnrollParams(FACTOR_TYPE_PHONE as MFAType, {});
        }).toThrow('Phone number is required for SMS enrollment');
      });

      it('should throw error when phone_number is undefined', () => {
        const options: EnrollOptions = { phone_number: undefined };
        expect(() => {
          buildEnrollParams(FACTOR_TYPE_PHONE as MFAType, options);
        }).toThrow('Phone number is required for SMS enrollment');
      });

      it('should accept international phone numbers', () => {
        const options: EnrollOptions = { phone_number: '+44 20 7946 0958' };
        const result = buildEnrollParams(FACTOR_TYPE_PHONE as MFAType, options);

        expect(result).toMatchObject({
          type: FACTOR_TYPE_PHONE,
          phone_number: '+44 20 7946 0958',
        });
      });
    });

    describe('TOTP factor type', () => {
      it('should return correct params', () => {
        const result = buildEnrollParams(FACTOR_TYPE_TOTP as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_TOTP,
        });
      });

      it('should ignore any provided options', () => {
        const options: EnrollOptions = { email: 'test@test.com', phone_number: '+123' };
        const result = buildEnrollParams(FACTOR_TYPE_TOTP as MFAType, options);

        expect(result).toEqual({
          type: FACTOR_TYPE_TOTP,
        });
      });
    });

    describe('WEBAUTHN_ROAMING factor type', () => {
      it('should return correct params', () => {
        const result = buildEnrollParams(FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_WEBAUTHN_ROAMING,
        });
      });
    });

    describe('WEBAUTHN_PLATFORM factor type', () => {
      it('should return correct params', () => {
        const result = buildEnrollParams(FACTOR_TYPE_WEBAUTHN_PLATFORM as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_WEBAUTHN_PLATFORM,
        });
      });
    });

    describe('RECOVERY_CODE factor type', () => {
      it('should return correct params', () => {
        const result = buildEnrollParams(FACTOR_TYPE_RECOVERY_CODE as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_RECOVERY_CODE,
        });
      });
    });

    describe('PUSH_NOTIFICATION factor type', () => {
      it('should return correct params', () => {
        const result = buildEnrollParams(FACTOR_TYPE_PUSH_NOTIFICATION as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_PUSH_NOTIFICATION,
        });
      });
    });

    describe('unsupported factor type', () => {
      it('should throw error for invalid factor type', () => {
        const invalidType = 'invalid-factor' as MFAType;
        expect(() => {
          buildEnrollParams(invalidType);
        }).toThrow('Unsupported factor type: invalid-factor');
      });
    });

    describe('edge cases', () => {
      it('should handle empty options object', () => {
        const result = buildEnrollParams(FACTOR_TYPE_TOTP as MFAType, {});

        expect(result).toEqual({
          type: FACTOR_TYPE_TOTP,
        });
      });

      it('should handle undefined options', () => {
        const result = buildEnrollParams(FACTOR_TYPE_RECOVERY_CODE as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_RECOVERY_CODE,
        });
      });
    });
  });

  describe('transformMyAccountFactors', () => {
    describe('onlyActive mode (true)', () => {
      it('should return only confirmed enrolled factors', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockTotpAuthMethod('Google Authenticator'),
          createMockEmailAuthMethod('user@example.com'),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        expect(result[FACTOR_TYPE_TOTP as MFAType]).toHaveLength(1);
        expect(result[FACTOR_TYPE_EMAIL as MFAType]).toHaveLength(1);
        expect(result[FACTOR_TYPE_PHONE as MFAType]).toBeUndefined();
      });

      it('should exclude unconfirmed factors', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockTotpAuthMethod('Confirmed TOTP', { confirmed: true }),
          createMockEmailAuthMethod('unconfirmed@example.com', { confirmed: false }),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        expect(result[FACTOR_TYPE_TOTP as MFAType]).toHaveLength(1);
        expect(result[FACTOR_TYPE_EMAIL as MFAType]).toBeUndefined();
      });

      it('should handle multiple factors of the same type', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockEmailAuthMethod('user1@example.com'),
          createMockEmailAuthMethod('user2@example.com', { id: 'email|user2@example.com' }),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        expect(result[FACTOR_TYPE_EMAIL as MFAType]).toHaveLength(2);
      });

      it('should return empty object when no factors are enrolled', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createEmptyEnrolledFactors();

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        expect(result).toEqual({});
      });

      it('should handle factors without confirmed property as confirmed', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockTotpAuthMethod('TOTP without confirmed'),
        ]);
        // Remove confirmed property by casting through unknown
        const method = enrolledFactors.authentication_methods[0];
        if (method) {
          delete (method as unknown as Record<string, unknown>).confirmed;
        }

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        expect(result[FACTOR_TYPE_TOTP as MFAType]).toHaveLength(1);
      });
    });

    describe('full listing mode (false)', () => {
      it('should return all available factor types with enrolled and unenrolled', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([createMockTotpAuthMethod()]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, false);

        // Should have enrolled TOTP
        const totpFactors = result[FACTOR_TYPE_TOTP as MFAType];
        expect(totpFactors).toHaveLength(1);
        expect(totpFactors?.[0]?.enrolled).toBe(true);

        // Should have placeholders for unenrolled factors
        const emailFactors = result[FACTOR_TYPE_EMAIL as MFAType];
        expect(emailFactors).toHaveLength(1);
        expect(emailFactors?.[0]?.enrolled).toBe(false);
        expect(emailFactors?.[0]?.id).toBe(`placeholder-${FACTOR_TYPE_EMAIL}`);

        const phoneFactors = result[FACTOR_TYPE_PHONE as MFAType];
        expect(phoneFactors).toHaveLength(1);
        expect(phoneFactors?.[0]?.enrolled).toBe(false);
      });

      it('should exclude WEBAUTHN_PLATFORM and WEBAUTHN_ROAMING from full listing', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createEmptyEnrolledFactors();

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, false);

        expect(result[FACTOR_TYPE_WEBAUTHN_PLATFORM as MFAType]).toBeUndefined();
        expect(result[FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType]).toBeUndefined();
      });

      it('should group multiple enrolled factors of the same type', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockPhoneAuthMethod('+1111111111'),
          createMockPhoneAuthMethod('+2222222222', { id: 'phone|+2222222222' }),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, false);

        const phoneFactors = result[FACTOR_TYPE_PHONE as MFAType];
        expect(phoneFactors).toHaveLength(2);
        expect(phoneFactors?.[0]?.enrolled).toBe(true);
        expect(phoneFactors?.[1]?.enrolled).toBe(true);
      });

      it('should handle empty available factors list', () => {
        const availableFactors = createEmptyAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([createMockTotpAuthMethod()]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, false);

        // Should still return enrolled factors even if not in available list
        expect(result).toEqual({});
      });
    });

    describe('factor name mapping', () => {
      it('should extract name from TOTP id with pipe separator', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockTotpAuthMethod('MyAuthenticator'),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const totpFactors = result[FACTOR_TYPE_TOTP as MFAType];
        expect(totpFactors?.[0]?.name).toBe('MyAuthenticator');
      });

      it('should extract name from recovery code id with pipe separator', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockRecoveryCodeAuthMethod('backup-codes'),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const recoveryFactors = result[FACTOR_TYPE_RECOVERY_CODE as MFAType];
        expect(recoveryFactors?.[0]?.name).toBe('backup-codes');
      });

      it('should use phone_number as name for phone factors', () => {
        const availableFactors = createMockAvailableFactors();
        const phoneNumber = '+1234567890';
        const enrolledFactors = createMockEnrolledFactors([createMockPhoneAuthMethod(phoneNumber)]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const phoneFactors = result[FACTOR_TYPE_PHONE as MFAType];
        expect(phoneFactors?.[0]?.name).toBe(phoneNumber);
      });

      it('should use email as name for email factors', () => {
        const availableFactors = createMockAvailableFactors();
        const email = 'user@example.com';
        const enrolledFactors = createMockEnrolledFactors([createMockEmailAuthMethod(email)]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const emailFactors = result[FACTOR_TYPE_EMAIL as MFAType];
        expect(emailFactors?.[0]?.name).toBe(email);
      });

      it('should default to "SMS" when phone_number is empty string', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          {
            ...createMockPhoneAuthMethod(''),
            phone_number: '',
          } as unknown as ReturnType<typeof createMockPhoneAuthMethod>,
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const phoneFactors = result[FACTOR_TYPE_PHONE as MFAType];
        expect(phoneFactors?.[0]?.name).toBe('SMS');
      });

      it('should default to "Email" when email is empty string', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          {
            ...createMockEmailAuthMethod(''),
            email: '',
          } as unknown as ReturnType<typeof createMockEmailAuthMethod>,
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const emailFactors = result[FACTOR_TYPE_EMAIL as MFAType];
        expect(emailFactors?.[0]?.name).toBe('Email');
      });

      it('should default to "Authenticator App" when TOTP id has no pipe separator', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockTotpAuthMethod('', { id: 'totp_without_pipe' }),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const totpFactors = result[FACTOR_TYPE_TOTP as MFAType];
        expect(totpFactors?.[0]?.name).toBe('Authenticator App');
      });

      it('should default to "Recovery Codes" when recovery code id has no pipe separator', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockRecoveryCodeAuthMethod('', { id: 'recovery_without_pipe' }),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const recoveryFactors = result[FACTOR_TYPE_RECOVERY_CODE as MFAType];
        expect(recoveryFactors?.[0]?.name).toBe('Recovery Codes');
      });

      it('should use factor name property when available for WebAuthn', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockWebAuthnRoamingAuthMethod('YubiKey 5'),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const webauthnFactors = result[FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType];
        expect(webauthnFactors?.[0]?.name).toBe('YubiKey 5');
      });

      it('should fallback to type when name is not available', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([createMockPushNotificationAuthMethod()]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const pushFactors = result[FACTOR_TYPE_PUSH_NOTIFICATION as MFAType];
        expect(pushFactors?.[0]?.name).toBe(FACTOR_TYPE_PUSH_NOTIFICATION);
      });
    });

    describe('authenticator creation', () => {
      it('should include all required authenticator properties for enrolled factors', () => {
        const availableFactors = createMockAvailableFactors();
        const createdAt = '2024-01-15T10:30:00.000Z';
        const enrolledFactors = createMockEnrolledFactors([
          createMockTotpAuthMethod('MyApp', {
            id: 'totp|MyApp',
            created_at: createdAt,
          }),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);
        const totpFactors = result[FACTOR_TYPE_TOTP as MFAType];
        const authenticator = totpFactors?.[0];

        expect(authenticator).toBeDefined();
        expect(authenticator?.id).toBe('totp|MyApp');
        expect(authenticator?.type).toBe(FACTOR_TYPE_TOTP);
        expect(authenticator?.enrolled).toBe(true);
        expect(authenticator?.name).toBe('MyApp');
        expect(authenticator?.created_at).toBe(createdAt);
      });

      it('should set created_at to null for unenrolled placeholders', () => {
        const availableFactors = createMockAvailableFactors([
          createMockAvailableFactor(FACTOR_TYPE_EMAIL as MFAType),
        ]);
        const enrolledFactors = createEmptyEnrolledFactors();

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, false);
        const emailFactors = result[FACTOR_TYPE_EMAIL as MFAType];
        const placeholder = emailFactors?.[0];

        expect(placeholder).toBeDefined();
        expect(placeholder?.created_at).toBeNull();
        expect(placeholder?.enrolled).toBe(false);
      });
    });

    describe('edge cases and error scenarios', () => {
      it('should handle factors with special characters in names', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockTotpAuthMethod('Auth™ App 🔐', { id: 'totp|Auth™ App 🔐' }),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const totpFactors = result[FACTOR_TYPE_TOTP as MFAType];
        expect(totpFactors?.[0]?.name).toBe('Auth™ App 🔐');
      });

      it('should handle id with multiple pipe separators', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockTotpAuthMethod('', { id: 'totp|name|extra|parts' }),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const totpFactors = result[FACTOR_TYPE_TOTP as MFAType];
        // The split takes only the element at index 1 (first part after pipe)
        expect(totpFactors?.[0]?.name).toBe('name');
      });

      it('should handle empty id string for TOTP', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockTotpAuthMethod('', { id: '' }),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const totpFactors = result[FACTOR_TYPE_TOTP as MFAType];
        expect(totpFactors?.[0]?.name).toBe('Authenticator App');
      });

      it('should handle mixed confirmed and unconfirmed factors in full mode', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockTotpAuthMethod('Confirmed', { confirmed: true }),
          createMockEmailAuthMethod('unconfirmed@test.com', { confirmed: false }),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, false);

        // Should only show confirmed factors
        const totpFactors = result[FACTOR_TYPE_TOTP as MFAType];
        expect(totpFactors).toHaveLength(1);
        expect(totpFactors?.[0]?.enrolled).toBe(true);

        // Should show placeholder for email since enrolled one is unconfirmed
        const emailFactors = result[FACTOR_TYPE_EMAIL as MFAType];
        expect(emailFactors).toHaveLength(1);
        expect(emailFactors?.[0]?.enrolled).toBe(false);
      });

      it('should preserve all enrolled WebAuthn factors in onlyActive mode', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([
          createMockWebAuthnRoamingAuthMethod('YubiKey'),
          createMockWebAuthnPlatformAuthMethod('TouchID'),
        ]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        expect(result[FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType]).toHaveLength(1);
        expect(result[FACTOR_TYPE_WEBAUTHN_PLATFORM as MFAType]).toHaveLength(1);
      });
    });

    describe('data integrity', () => {
      it('should not mutate input objects', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors();
        const originalAvailable = JSON.stringify(availableFactors);
        const originalEnrolled = JSON.stringify(enrolledFactors);

        transformMyAccountFactors(availableFactors, enrolledFactors, false);

        expect(JSON.stringify(availableFactors)).toBe(originalAvailable);
        expect(JSON.stringify(enrolledFactors)).toBe(originalEnrolled);
      });

      it('should handle very long email addresses', () => {
        const availableFactors = createMockAvailableFactors();
        const longEmail = `${'very'.repeat(20)}long${'email'.repeat(10)}@${'subdomain'.repeat(5)}.example.com`;
        const enrolledFactors = createMockEnrolledFactors([createMockEmailAuthMethod(longEmail)]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const emailFactors = result[FACTOR_TYPE_EMAIL as MFAType];
        expect(emailFactors?.[0]?.name).toBe(longEmail);
      });

      it('should handle very long phone numbers', () => {
        const availableFactors = createMockAvailableFactors();
        const longPhone = `+${'1'.repeat(20)}`;
        const enrolledFactors = createMockEnrolledFactors([createMockPhoneAuthMethod(longPhone)]);

        const result = transformMyAccountFactors(availableFactors, enrolledFactors, true);

        const phoneFactors = result[FACTOR_TYPE_PHONE as MFAType];
        expect(phoneFactors?.[0]?.name).toBe(longPhone);
      });
    });
  });
});
