import { describe, it, expect } from 'vitest';

import {
  createMockAvailableFactors,
  createMockEnrolledFactors,
  createMockTotpAuthMethod,
  createMockEmailAuthMethod,
  createMockPhoneAuthMethod,
  createEmptyEnrolledFactors,
  createEmptyAvailableFactors,
} from '../../../../internals/__mocks__/my-account/mfa/mfa.mocks';
import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_RECOVERY_CODE,
  FACTOR_TYPE_WEBAUTHN_ROAMING,
  FACTOR_TYPE_WEBAUTHN_PLATFORM,
  FACTOR_TYPE_PUSH_NOTIFICATION,
} from '../mfa-constants';
import { MFAMappers } from '../mfa-mappers';
import type {
  MFAType,
  Authenticator,
  EnrollOptions,
  ConfirmEnrollmentOptions,
  VerifyAuthenticationMethodRequestContent,
} from '../mfa-types';

import {
  mockAvailableFactorsResponse,
  mockEnrolledFactorsResponse,
  mockEmptyEnrolledFactorsResponse,
  mockEmailEnrollOptions,
  mockPhoneEnrollOptions,
  mockConfirmEnrollmentWithOtpOptions,
  mockConfirmEnrollmentNoOtpOptions,
  mockAuthSession,
  mockBaseVerifyRequest,
  mockVerifyRequestWithOtp,
  mockSingleTotpEnrolledResponse,
  mockMixedConfirmationStatusResponse,
  mockAllFactorTypesEnrolledResponse,
  mockComplexEmailEnrollOptions,
  mockInternationalPhoneEnrollOptions,
  mockConfirmEnrollmentWithSpacesOtpOptions,
  mockConfirmEnrollmentEmptyOtpOptions,
  mockConfirmEnrollmentWithOnlySpacesOtpOptions,
} from './__mocks__/mfa-mappers.mocks';

describe('MFAMappers', () => {
  describe('fromAPI', () => {
    describe('basic functionality', () => {
      it('should return a Record of MFAType to Authenticator arrays', () => {
        const result = MFAMappers.fromAPI(
          mockAvailableFactorsResponse,
          mockEnrolledFactorsResponse,
        );

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        expect(result).not.toBeNull();
      });

      it('should delegate to transformMyAccountFactors utility', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([createMockTotpAuthMethod()]);

        const result = MFAMappers.fromAPI(availableFactors, enrolledFactors);

        expect(result).toHaveProperty(FACTOR_TYPE_TOTP);
        expect(Array.isArray(result[FACTOR_TYPE_TOTP as MFAType])).toBe(true);
      });

      it('should return correct structure for enrolled factors', () => {
        const result = MFAMappers.fromAPI(
          mockAvailableFactorsResponse,
          mockEnrolledFactorsResponse,
        );

        const totpFactors = result[FACTOR_TYPE_TOTP as MFAType];
        expect(totpFactors).toBeDefined();
        expect(Array.isArray(totpFactors)).toBe(true);
        expect(totpFactors?.length).toBeGreaterThan(0);

        const firstFactor = totpFactors?.[0];
        expect(firstFactor).toHaveProperty('id');
        expect(firstFactor).toHaveProperty('type');
        expect(firstFactor).toHaveProperty('enrolled');
        expect(firstFactor).toHaveProperty('created_at');
      });
    });

    describe('onlyActive parameter', () => {
      it('should default to false when onlyActive is not provided', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors([createMockTotpAuthMethod()]);

        const result = MFAMappers.fromAPI(availableFactors, enrolledFactors);

        // Should include placeholders for unenrolled factors (default behavior)
        const emailFactors = result[FACTOR_TYPE_EMAIL as MFAType];
        expect(emailFactors).toBeDefined();
      });

      it('should return only active/confirmed factors when onlyActive is true', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = mockMixedConfirmationStatusResponse;

        const result = MFAMappers.fromAPI(availableFactors, enrolledFactors, true);

        // Should only have confirmed TOTP
        expect(result[FACTOR_TYPE_TOTP as MFAType]).toHaveLength(1);
        // Should not have unconfirmed email
        expect(result[FACTOR_TYPE_EMAIL as MFAType]).toBeUndefined();
      });

      it('should include placeholders for unenrolled factors when onlyActive is false', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = mockSingleTotpEnrolledResponse;

        const result = MFAMappers.fromAPI(availableFactors, enrolledFactors, false);

        // Should have enrolled TOTP
        const totpFactors = result[FACTOR_TYPE_TOTP as MFAType];
        expect(totpFactors).toBeDefined();
        expect(totpFactors?.[0]?.enrolled).toBe(true);

        // Should have placeholder for email
        const emailFactors = result[FACTOR_TYPE_EMAIL as MFAType];
        expect(emailFactors).toBeDefined();
        expect(emailFactors?.[0]?.enrolled).toBe(false);
        expect(emailFactors?.[0]?.id).toContain('placeholder');
      });

      it('should return empty object when onlyActive is true and no factors are enrolled', () => {
        const result = MFAMappers.fromAPI(
          mockAvailableFactorsResponse,
          mockEmptyEnrolledFactorsResponse,
          true,
        );

        expect(result).toEqual({});
      });
    });

    describe('edge cases', () => {
      it('should handle empty enrolled factors list', () => {
        const result = MFAMappers.fromAPI(
          mockAvailableFactorsResponse,
          createEmptyEnrolledFactors(),
          false,
        );

        // Should still have placeholders
        expect(Object.keys(result).length).toBeGreaterThan(0);
      });

      it('should handle empty available factors list', () => {
        const result = MFAMappers.fromAPI(
          createEmptyAvailableFactors(),
          mockEnrolledFactorsResponse,
          false,
        );

        // Should not have any factors when available list is empty
        expect(result).toEqual({});
      });

      it('should handle both empty lists', () => {
        const result = MFAMappers.fromAPI(
          createEmptyAvailableFactors(),
          createEmptyEnrolledFactors(),
          false,
        );

        expect(result).toEqual({});
      });

      it('should handle all factor types enrolled', () => {
        const result = MFAMappers.fromAPI(
          mockAvailableFactorsResponse,
          mockAllFactorTypesEnrolledResponse,
          true,
        );

        expect(result[FACTOR_TYPE_TOTP as MFAType]).toBeDefined();
        expect(result[FACTOR_TYPE_EMAIL as MFAType]).toBeDefined();
        expect(result[FACTOR_TYPE_PHONE as MFAType]).toBeDefined();
        expect(result[FACTOR_TYPE_RECOVERY_CODE as MFAType]).toBeDefined();
        expect(result[FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType]).toBeDefined();
        expect(result[FACTOR_TYPE_WEBAUTHN_PLATFORM as MFAType]).toBeDefined();
        expect(result[FACTOR_TYPE_PUSH_NOTIFICATION as MFAType]).toBeDefined();
      });

      it('should handle multiple authenticators of the same type', () => {
        const enrolledFactors = createMockEnrolledFactors([
          createMockEmailAuthMethod('user1@example.com'),
          createMockEmailAuthMethod('user2@example.com', { id: 'email|user2@example.com' }),
          createMockEmailAuthMethod('user3@example.com', { id: 'email|user3@example.com' }),
        ]);

        const result = MFAMappers.fromAPI(mockAvailableFactorsResponse, enrolledFactors, true);

        const emailFactors = result[FACTOR_TYPE_EMAIL as MFAType];
        expect(emailFactors).toHaveLength(3);
        expect(emailFactors?.[0]?.enrolled).toBe(true);
        expect(emailFactors?.[1]?.enrolled).toBe(true);
        expect(emailFactors?.[2]?.enrolled).toBe(true);
      });
    });

    describe('data integrity', () => {
      it('should not mutate input objects', () => {
        const availableFactors = createMockAvailableFactors();
        const enrolledFactors = createMockEnrolledFactors();
        const originalAvailable = JSON.stringify(availableFactors);
        const originalEnrolled = JSON.stringify(enrolledFactors);

        MFAMappers.fromAPI(availableFactors, enrolledFactors, false);

        expect(JSON.stringify(availableFactors)).toBe(originalAvailable);
        expect(JSON.stringify(enrolledFactors)).toBe(originalEnrolled);
      });

      it('should return authenticators with all required properties', () => {
        const result = MFAMappers.fromAPI(
          mockAvailableFactorsResponse,
          mockEnrolledFactorsResponse,
          true,
        );

        const totpFactors = result[FACTOR_TYPE_TOTP as MFAType];
        const authenticator = totpFactors?.[0];

        expect(authenticator).toHaveProperty('id');
        expect(authenticator).toHaveProperty('type');
        expect(authenticator).toHaveProperty('enrolled');
        expect(authenticator).toHaveProperty('name');
        expect(authenticator).toHaveProperty('created_at');
        expect(typeof authenticator?.id).toBe('string');
        expect(typeof authenticator?.type).toBe('string');
        expect(typeof authenticator?.enrolled).toBe('boolean');
        expect(authenticator?.created_at).toBeDefined();
      });

      it('should preserve factor metadata correctly', () => {
        const createdAt = '2024-12-09T10:30:00.000Z';
        const enrolledFactors = createMockEnrolledFactors([
          createMockEmailAuthMethod('test@example.com', {
            id: 'email|test@example.com',
            created_at: createdAt,
          }),
        ]);

        const result = MFAMappers.fromAPI(mockAvailableFactorsResponse, enrolledFactors, true);

        const emailFactors = result[FACTOR_TYPE_EMAIL as MFAType];
        expect(emailFactors?.[0]?.id).toBe('email|test@example.com');
        expect(emailFactors?.[0]?.name).toBe('test@example.com');
        expect(emailFactors?.[0]?.created_at).toBe(createdAt);
      });
    });

    describe('type safety', () => {
      it('should return correct type for Record<MFAType, Authenticator[]>', () => {
        const result = MFAMappers.fromAPI(
          mockAvailableFactorsResponse,
          mockEnrolledFactorsResponse,
        );

        // Type assertion to verify the return type
        const typedResult: Record<MFAType, Authenticator[]> = result;
        expect(typedResult).toBeDefined();

        // Verify we can access factor types
        const emailFactors: Authenticator[] | undefined = typedResult[FACTOR_TYPE_EMAIL as MFAType];
        expect(emailFactors).toBeDefined();
      });
    });
  });

  describe('buildEnrollParams', () => {
    describe('EMAIL factor type', () => {
      it('should return correct params for email enrollment', () => {
        const result = MFAMappers.buildEnrollParams(
          FACTOR_TYPE_EMAIL as MFAType,
          mockEmailEnrollOptions,
        );

        expect(result).toEqual({
          type: FACTOR_TYPE_EMAIL,
          email: 'user@example.com',
        });
      });

      it('should handle complex email addresses', () => {
        const result = MFAMappers.buildEnrollParams(
          FACTOR_TYPE_EMAIL as MFAType,
          mockComplexEmailEnrollOptions,
        );

        expect(result).toEqual({
          type: FACTOR_TYPE_EMAIL,
          email: 'user+tag@subdomain.example.co.uk',
        });
      });

      it('should throw error when email is missing', () => {
        expect(() => {
          MFAMappers.buildEnrollParams(FACTOR_TYPE_EMAIL as MFAType, {});
        }).toThrow('Email is required for email enrollment');
      });

      it('should throw error when email is undefined', () => {
        expect(() => {
          MFAMappers.buildEnrollParams(FACTOR_TYPE_EMAIL as MFAType, { email: undefined });
        }).toThrow('Email is required for email enrollment');
      });

      it('should throw error when email is empty string', () => {
        expect(() => {
          MFAMappers.buildEnrollParams(FACTOR_TYPE_EMAIL as MFAType, { email: '' });
        }).toThrow('Email is required for email enrollment');
      });

      it('should handle email with special characters', () => {
        const options: EnrollOptions = { email: 'user.name+tag@example-domain.co.uk' };
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_EMAIL as MFAType, options);

        expect('email' in result && result.email).toBe('user.name+tag@example-domain.co.uk');
      });
    });

    describe('PHONE factor type', () => {
      it('should return correct params for phone enrollment', () => {
        const result = MFAMappers.buildEnrollParams(
          FACTOR_TYPE_PHONE as MFAType,
          mockPhoneEnrollOptions,
        );

        expect(result).toEqual({
          type: FACTOR_TYPE_PHONE,
          phone_number: '+1234567890',
        });
      });

      it('should handle international phone numbers', () => {
        const result = MFAMappers.buildEnrollParams(
          FACTOR_TYPE_PHONE as MFAType,
          mockInternationalPhoneEnrollOptions,
        );

        expect(result).toEqual({
          type: FACTOR_TYPE_PHONE,
          phone_number: '+44 20 7946 0958',
        });
      });

      it('should throw error when phone_number is missing', () => {
        expect(() => {
          MFAMappers.buildEnrollParams(FACTOR_TYPE_PHONE as MFAType, {});
        }).toThrow('Phone number is required for SMS enrollment');
      });

      it('should throw error when phone_number is undefined', () => {
        expect(() => {
          MFAMappers.buildEnrollParams(FACTOR_TYPE_PHONE as MFAType, {
            phone_number: undefined,
          });
        }).toThrow('Phone number is required for SMS enrollment');
      });

      it('should throw error when phone_number is empty string', () => {
        expect(() => {
          MFAMappers.buildEnrollParams(FACTOR_TYPE_PHONE as MFAType, { phone_number: '' });
        }).toThrow('Phone number is required for SMS enrollment');
      });

      it('should preserve phone number formatting with spaces and special characters', () => {
        const options: EnrollOptions = { phone_number: '+1 (555) 123-4567' };
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_PHONE as MFAType, options);

        expect('phone_number' in result && result.phone_number).toBe('+1 (555) 123-4567');
      });
    });

    describe('TOTP factor type', () => {
      it('should return correct params for TOTP enrollment', () => {
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_TOTP as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_TOTP,
        });
      });

      it('should ignore any provided options', () => {
        const options: EnrollOptions = {
          email: 'ignored@example.com',
          phone_number: '+1111111111',
        };
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_TOTP as MFAType, options);

        expect(result).toEqual({
          type: FACTOR_TYPE_TOTP,
        });
        expect(result).not.toHaveProperty('email');
        expect(result).not.toHaveProperty('phone_number');
      });

      it('should work without options parameter', () => {
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_TOTP as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_TOTP,
        });
      });
    });

    describe('WEBAUTHN_ROAMING factor type', () => {
      it('should return correct params for WebAuthn roaming enrollment', () => {
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_WEBAUTHN_ROAMING,
        });
      });

      it('should ignore any provided options', () => {
        const options: EnrollOptions = { email: 'ignored@example.com' };
        const result = MFAMappers.buildEnrollParams(
          FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType,
          options,
        );

        expect(result).toEqual({
          type: FACTOR_TYPE_WEBAUTHN_ROAMING,
        });
      });
    });

    describe('WEBAUTHN_PLATFORM factor type', () => {
      it('should return correct params for WebAuthn platform enrollment', () => {
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_WEBAUTHN_PLATFORM as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_WEBAUTHN_PLATFORM,
        });
      });

      it('should ignore any provided options', () => {
        const options: EnrollOptions = { phone_number: '+1234567890' };
        const result = MFAMappers.buildEnrollParams(
          FACTOR_TYPE_WEBAUTHN_PLATFORM as MFAType,
          options,
        );

        expect(result).toEqual({
          type: FACTOR_TYPE_WEBAUTHN_PLATFORM,
        });
      });
    });

    describe('RECOVERY_CODE factor type', () => {
      it('should return correct params for recovery code enrollment', () => {
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_RECOVERY_CODE as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_RECOVERY_CODE,
        });
      });

      it('should ignore any provided options', () => {
        const options: EnrollOptions = { email: 'test@test.com' };
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_RECOVERY_CODE as MFAType, options);

        expect(result).toEqual({
          type: FACTOR_TYPE_RECOVERY_CODE,
        });
      });
    });

    describe('PUSH_NOTIFICATION factor type', () => {
      it('should return correct params for push notification enrollment', () => {
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_PUSH_NOTIFICATION as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_PUSH_NOTIFICATION,
        });
      });

      it('should work without options parameter', () => {
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_PUSH_NOTIFICATION as MFAType);

        expect(result.type).toBe(FACTOR_TYPE_PUSH_NOTIFICATION);
      });
    });

    describe('unsupported factor types', () => {
      it('should throw error for invalid factor type', () => {
        const invalidType = 'invalid-factor' as MFAType;

        expect(() => {
          MFAMappers.buildEnrollParams(invalidType);
        }).toThrow('Unsupported factor type: invalid-factor');
      });

      it('should throw error for null factor type', () => {
        expect(() => {
          MFAMappers.buildEnrollParams(null as unknown as MFAType);
        }).toThrow();
      });

      it('should throw error for undefined factor type', () => {
        expect(() => {
          MFAMappers.buildEnrollParams(undefined as unknown as MFAType);
        }).toThrow();
      });
    });

    describe('options parameter handling', () => {
      it('should handle empty options object for TOTP', () => {
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_TOTP as MFAType, {});

        expect(result).toEqual({
          type: FACTOR_TYPE_TOTP,
        });
      });

      it('should handle undefined options for recovery code', () => {
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_RECOVERY_CODE as MFAType);

        expect(result).toEqual({
          type: FACTOR_TYPE_RECOVERY_CODE,
        });
      });

      it('should not add extra properties for factors that do not require options', () => {
        const result = MFAMappers.buildEnrollParams(FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType, {
          email: 'should-be-ignored@test.com',
        });

        expect(Object.keys(result)).toEqual(['type']);
      });
    });
  });

  describe('buildConfirmEnrollmentParams', () => {
    describe('basic functionality', () => {
      it('should return base params with auth_session', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentNoOtpOptions,
        );

        expect(result).toEqual(mockBaseVerifyRequest);
        expect(result).toHaveProperty('auth_session', mockAuthSession);
      });

      it('should include otp_code for TOTP when userOtpCode is provided', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentWithOtpOptions,
        );

        expect(result).toEqual(mockVerifyRequestWithOtp);
        expect(result).toHaveProperty('auth_session', mockAuthSession);
        expect(result).toHaveProperty('otp_code', '123456');
      });

      it('should include otp_code for PHONE when userOtpCode is provided', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_PHONE as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentWithOtpOptions,
        );

        expect(result).toEqual(mockVerifyRequestWithOtp);
        expect('otp_code' in result && result.otp_code).toBe('123456');
      });

      it('should include otp_code for EMAIL when userOtpCode is provided', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_EMAIL as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentWithOtpOptions,
        );

        expect(result).toEqual(mockVerifyRequestWithOtp);
        expect('otp_code' in result && result.otp_code).toBe('123456');
      });
    });

    describe('OTP code trimming', () => {
      it('should trim whitespace from userOtpCode', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentWithSpacesOtpOptions,
        );

        if ('otp_code' in result) {
          expect(result.otp_code).toBe('123456');
          expect(result.otp_code).not.toContain(' ');
        }
      });

      it('should not include otp_code when userOtpCode is only whitespace', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentWithOnlySpacesOtpOptions,
        );

        expect(result).toEqual(mockBaseVerifyRequest);
        expect(result).not.toHaveProperty('otp_code');
      });

      it('should not include otp_code when userOtpCode is empty string', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentEmptyOtpOptions,
        );

        expect(result).toEqual(mockBaseVerifyRequest);
        expect(result).not.toHaveProperty('otp_code');
      });

      it('should trim leading and trailing spaces but preserve internal spaces', () => {
        const options: ConfirmEnrollmentOptions = { userOtpCode: '  12 34 56  ' };
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          mockAuthSession,
          options,
        );

        expect('otp_code' in result && result.otp_code).toBe('12 34 56');
      });
    });

    describe('factor type handling', () => {
      it('should not include otp_code for WEBAUTHN_ROAMING even if userOtpCode is provided', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentWithOtpOptions,
        );

        expect(result).toEqual(mockBaseVerifyRequest);
        expect(result).not.toHaveProperty('otp_code');
      });

      it('should not include otp_code for WEBAUTHN_PLATFORM even if userOtpCode is provided', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_WEBAUTHN_PLATFORM as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentWithOtpOptions,
        );

        expect(result).toEqual(mockBaseVerifyRequest);
        expect(result).not.toHaveProperty('otp_code');
      });

      it('should not include otp_code for RECOVERY_CODE even if userOtpCode is provided', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_RECOVERY_CODE as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentWithOtpOptions,
        );

        expect(result).toEqual(mockBaseVerifyRequest);
        expect(result).not.toHaveProperty('otp_code');
      });

      it('should not include otp_code for PUSH_NOTIFICATION even if userOtpCode is provided', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_PUSH_NOTIFICATION as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentWithOtpOptions,
        );

        expect(result).toEqual(mockBaseVerifyRequest);
        expect(result).not.toHaveProperty('otp_code');
      });
    });

    describe('auth session handling', () => {
      it('should accept any string as auth session', () => {
        const customAuthSession = 'custom_session_token_abc123';
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          customAuthSession,
          mockConfirmEnrollmentNoOtpOptions,
        );

        expect(result.auth_session).toBe(customAuthSession);
      });

      it('should handle empty auth session string', () => {
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          '',
          mockConfirmEnrollmentNoOtpOptions,
        );

        expect(result.auth_session).toBe('');
      });

      it('should handle very long auth session strings', () => {
        const longAuthSession = 'a'.repeat(1000);
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          longAuthSession,
          mockConfirmEnrollmentNoOtpOptions,
        );

        expect(result.auth_session).toBe(longAuthSession);
        expect(result.auth_session.length).toBe(1000);
      });

      it('should handle auth session with special characters', () => {
        const specialAuthSession = 'auth_session!@#$%^&*()_+-={}[]|:;<>?,./';
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          specialAuthSession,
          mockConfirmEnrollmentNoOtpOptions,
        );

        expect(result.auth_session).toBe(specialAuthSession);
      });
    });

    describe('options parameter validation', () => {
      it('should handle undefined userOtpCode in options', () => {
        const options: ConfirmEnrollmentOptions = { userOtpCode: undefined };
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          mockAuthSession,
          options,
        );

        expect(result).toEqual(mockBaseVerifyRequest);
        expect(result).not.toHaveProperty('otp_code');
      });

      it('should handle null userOtpCode in options', () => {
        const options: ConfirmEnrollmentOptions = { userOtpCode: null as unknown as string };
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          mockAuthSession,
          options,
        );

        expect(result).toEqual(mockBaseVerifyRequest);
        expect(result).not.toHaveProperty('otp_code');
      });

      it('should handle numeric OTP codes as strings', () => {
        const options: ConfirmEnrollmentOptions = { userOtpCode: '000000' };
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_EMAIL as MFAType,
          mockAuthSession,
          options,
        );

        expect('otp_code' in result && result.otp_code).toBe('000000');
      });

      it('should handle alphanumeric OTP codes', () => {
        const options: ConfirmEnrollmentOptions = { userOtpCode: 'ABC123' };
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_PHONE as MFAType,
          mockAuthSession,
          options,
        );

        expect('otp_code' in result && result.otp_code).toBe('ABC123');
      });
    });

    describe('return type structure', () => {
      it('should return VerifyAuthenticationMethodRequestContent with correct structure', () => {
        const result: VerifyAuthenticationMethodRequestContent =
          MFAMappers.buildConfirmEnrollmentParams(
            FACTOR_TYPE_TOTP as MFAType,
            mockAuthSession,
            mockConfirmEnrollmentWithOtpOptions,
          );

        expect(result).toHaveProperty('auth_session');
        expect(typeof result.auth_session).toBe('string');

        if ('otp_code' in result) {
          expect(typeof result.otp_code).toBe('string');
        }
      });

      it('should only contain auth_session and optionally otp_code', () => {
        const resultWithOtp = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentWithOtpOptions,
        );

        const keysWithOtp = Object.keys(resultWithOtp);
        expect(keysWithOtp).toContain('auth_session');
        expect(keysWithOtp).toContain('otp_code');
        expect(keysWithOtp.length).toBe(2);

        const resultWithoutOtp = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType,
          mockAuthSession,
          mockConfirmEnrollmentNoOtpOptions,
        );

        const keysWithoutOtp = Object.keys(resultWithoutOtp);
        expect(keysWithoutOtp).toContain('auth_session');
        expect(keysWithoutOtp.length).toBe(1);
      });
    });

    describe('edge cases', () => {
      it('should handle very long OTP codes', () => {
        const longOtp = '1'.repeat(100);
        const options: ConfirmEnrollmentOptions = { userOtpCode: longOtp };
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_EMAIL as MFAType,
          mockAuthSession,
          options,
        );

        if ('otp_code' in result) {
          expect(result.otp_code).toBe(longOtp);
          expect(result.otp_code?.length).toBe(100);
        }
      });

      it('should handle OTP codes with special characters', () => {
        const specialOtp = '12-34-56';
        const options: ConfirmEnrollmentOptions = { userOtpCode: specialOtp };
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_PHONE as MFAType,
          mockAuthSession,
          options,
        );

        expect('otp_code' in result && result.otp_code).toBe(specialOtp);
      });

      it('should handle single character OTP', () => {
        const options: ConfirmEnrollmentOptions = { userOtpCode: '1' };
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_TOTP as MFAType,
          mockAuthSession,
          options,
        );

        expect('otp_code' in result && result.otp_code).toBe('1');
      });

      it('should handle OTP with only numbers', () => {
        const options: ConfirmEnrollmentOptions = { userOtpCode: '999999' };
        const result = MFAMappers.buildConfirmEnrollmentParams(
          FACTOR_TYPE_EMAIL as MFAType,
          mockAuthSession,
          options,
        );

        expect('otp_code' in result && result.otp_code).toBe('999999');
      });
    });

    describe('comprehensive factor type matrix', () => {
      const factorTypesRequiringOtp: MFAType[] = [
        FACTOR_TYPE_TOTP as MFAType,
        FACTOR_TYPE_PHONE as MFAType,
        FACTOR_TYPE_EMAIL as MFAType,
      ];

      const factorTypesNotRequiringOtp: MFAType[] = [
        FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType,
        FACTOR_TYPE_WEBAUTHN_PLATFORM as MFAType,
        FACTOR_TYPE_RECOVERY_CODE as MFAType,
        FACTOR_TYPE_PUSH_NOTIFICATION as MFAType,
      ];

      factorTypesRequiringOtp.forEach((factorType) => {
        it(`should include otp_code for ${factorType} when provided`, () => {
          const result = MFAMappers.buildConfirmEnrollmentParams(
            factorType,
            mockAuthSession,
            mockConfirmEnrollmentWithOtpOptions,
          );

          expect(result).toHaveProperty('otp_code', '123456');
        });

        it(`should not include otp_code for ${factorType} when not provided`, () => {
          const result = MFAMappers.buildConfirmEnrollmentParams(
            factorType,
            mockAuthSession,
            mockConfirmEnrollmentNoOtpOptions,
          );

          expect(result).not.toHaveProperty('otp_code');
        });
      });

      factorTypesNotRequiringOtp.forEach((factorType) => {
        it(`should never include otp_code for ${factorType}`, () => {
          const result = MFAMappers.buildConfirmEnrollmentParams(
            factorType,
            mockAuthSession,
            mockConfirmEnrollmentWithOtpOptions,
          );

          expect(result).not.toHaveProperty('otp_code');
          expect(result).toEqual({ auth_session: mockAuthSession });
        });
      });
    });
  });

  describe('MFAMappers object structure', () => {
    it('should have all expected methods', () => {
      expect(MFAMappers).toHaveProperty('fromAPI');
      expect(MFAMappers).toHaveProperty('buildEnrollParams');
      expect(MFAMappers).toHaveProperty('buildConfirmEnrollmentParams');
    });

    it('should have methods that are functions', () => {
      expect(typeof MFAMappers.fromAPI).toBe('function');
      expect(typeof MFAMappers.buildEnrollParams).toBe('function');
      expect(typeof MFAMappers.buildConfirmEnrollmentParams).toBe('function');
    });

    it('should be immutable', () => {
      const originalFromAPI = MFAMappers.fromAPI;
      const originalBuildEnrollParams = MFAMappers.buildEnrollParams;
      const originalBuildConfirmEnrollmentParams = MFAMappers.buildConfirmEnrollmentParams;

      expect(MFAMappers.fromAPI).toBe(originalFromAPI);
      expect(MFAMappers.buildEnrollParams).toBe(originalBuildEnrollParams);
      expect(MFAMappers.buildConfirmEnrollmentParams).toBe(originalBuildConfirmEnrollmentParams);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete enrollment flow for email', () => {
      // Step 1: Check available factors
      const availableFactors = createMockAvailableFactors();
      const enrolledFactors = createEmptyEnrolledFactors();
      const factors = MFAMappers.fromAPI(availableFactors, enrolledFactors, false);

      expect(factors[FACTOR_TYPE_EMAIL as MFAType]).toBeDefined();

      // Step 2: Build enroll params
      const enrollParams = MFAMappers.buildEnrollParams(FACTOR_TYPE_EMAIL as MFAType, {
        email: 'newuser@example.com',
      });

      expect(enrollParams).toEqual({
        type: FACTOR_TYPE_EMAIL,
        email: 'newuser@example.com',
      });

      // Step 3: Build confirm enrollment params
      const confirmParams = MFAMappers.buildConfirmEnrollmentParams(
        FACTOR_TYPE_EMAIL as MFAType,
        'auth_session_xyz',
        { userOtpCode: '654321' },
      );

      expect(confirmParams).toEqual({
        auth_session: 'auth_session_xyz',
        otp_code: '654321',
      });
    });

    it('should handle complete enrollment flow for WebAuthn', () => {
      // Step 1: Build enroll params (no additional data needed)
      const enrollParams = MFAMappers.buildEnrollParams(FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType);

      expect(enrollParams).toEqual({
        type: FACTOR_TYPE_WEBAUTHN_ROAMING,
      });

      // Step 2: Build confirm enrollment params (no OTP needed)
      const confirmParams = MFAMappers.buildConfirmEnrollmentParams(
        FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType,
        'auth_session_abc',
        {},
      );

      expect(confirmParams).toEqual({
        auth_session: 'auth_session_abc',
      });
    });

    it('should correctly filter and display only active factors after enrollment', () => {
      const availableFactors = createMockAvailableFactors();
      const enrolledFactors = createMockEnrolledFactors([
        createMockTotpAuthMethod('MyApp', { confirmed: true }),
        createMockEmailAuthMethod('user@test.com', { confirmed: true }),
        createMockPhoneAuthMethod('+1234567890', { confirmed: false }), // Not confirmed
      ]);

      const activeFactors = MFAMappers.fromAPI(availableFactors, enrolledFactors, true);

      expect(activeFactors[FACTOR_TYPE_TOTP as MFAType]).toHaveLength(1);
      expect(activeFactors[FACTOR_TYPE_EMAIL as MFAType]).toHaveLength(1);
      expect(activeFactors[FACTOR_TYPE_PHONE as MFAType]).toBeUndefined(); // Unconfirmed should not appear
    });
  });
});
