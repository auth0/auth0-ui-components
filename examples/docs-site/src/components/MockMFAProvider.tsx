import type { ReactNode } from 'react';
import React, { createContext, useState } from 'react';

// Define types locally since we're creating mock data
export type MFAType =
  | 'sms'
  | 'push-notification'
  | 'totp'
  | 'email'
  | 'duo'
  | 'webauthn-roaming'
  | 'webauthn-platform'
  | 'recovery-code';

export interface Authenticator {
  id: string;
  authenticator_type: 'oob' | 'otp' | 'webauthn';
  oob_channel: string[];
  active: boolean;
  factorName: MFAType;
  phone_number?: string;
  email?: string;
  name?: string;
}

export interface EnrollMfaResponse {
  authenticator_type: 'oob' | 'otp' | 'webauthn';
  recovery_codes: string[];
  oob_code?: string;
  phone_number?: string;
  email?: string;
  secret?: string;
  barcode_uri?: string;
  challenge?: string;
}

export interface EnrollOptions {
  phone_number?: string;
  email?: string;
}

// Mock MFA data
const MOCK_MFA_FACTORS: Authenticator[] = [
  {
    id: 'sms|123456789',
    authenticator_type: 'oob',
    oob_channel: ['sms'],
    active: true,
    factorName: 'sms' as MFAType,
    name: '+1234567890',
    phone_number: '+1234567890',
  },
  {
    id: 'totp|987654321',
    authenticator_type: 'otp',
    oob_channel: [],
    active: true,
    factorName: 'totp' as MFAType,
    name: 'Authenticator App',
  },
  {
    id: 'email|567890123',
    authenticator_type: 'oob',
    oob_channel: ['email'],
    active: false,
    factorName: 'email' as MFAType,
    name: 'user@example.com',
    email: 'user@example.com',
  },
  {
    id: 'webauthn-platform|111222333',
    authenticator_type: 'webauthn',
    oob_channel: [],
    active: false,
    factorName: 'webauthn-platform' as MFAType,
    name: 'Platform Authenticator',
  },
  {
    id: 'recovery-code|444555666',
    authenticator_type: 'otp',
    oob_channel: [],
    active: true,
    factorName: 'recovery-code' as MFAType,
    name: 'Recovery Codes',
  },
];

// Mock MFA Context
interface MockMFAContextType {
  factors: Authenticator[];
  fetchFactors: (onlyActive?: boolean) => Promise<Authenticator[]>;
  enrollMfa: (factorName: MFAType, options?: EnrollOptions) => Promise<EnrollMfaResponse>;
  deleteMfa: (authenticatorId: string) => Promise<void>;
  confirmEnrollment: (
    factorName: MFAType,
    options: { oobCode?: string; userOtpCode?: string; userEmailOtpCode?: string },
  ) => Promise<unknown>;
}

const MockMFAContext = createContext<MockMFAContextType | null>(null);

export { MockMFAContext };

interface MockMFAProviderProps {
  children: ReactNode;
}

export function MockMFAProvider({ children }: MockMFAProviderProps) {
  const [factors, setFactors] = useState<Authenticator[]>(MOCK_MFA_FACTORS);

  const fetchFactors = async (onlyActive = false): Promise<Authenticator[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (onlyActive) {
      return factors.filter((factor) => factor.active);
    }
    return factors;
  };

  const enrollMfa = async (
    factorName: MFAType,
    options?: EnrollOptions,
  ): Promise<EnrollMfaResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newId = `${factorName}|${Date.now()}`;

    // Create mock enrollment response based on factor type
    let enrollmentResponse: EnrollMfaResponse = {
      authenticator_type: 'oob',
      recovery_codes: [],
    };

    switch (factorName) {
      case 'sms':
        enrollmentResponse = {
          ...enrollmentResponse,
          oob_code: 'mock-oob-code-sms',
          phone_number: options?.phone_number || '+1234567890',
        };
        break;
      case 'email':
        enrollmentResponse = {
          ...enrollmentResponse,
          oob_code: 'mock-oob-code-email',
          email: options?.email || 'user@example.com',
        };
        break;
      case 'totp':
        enrollmentResponse = {
          ...enrollmentResponse,
          authenticator_type: 'otp',
          secret: 'JBSWY3DPEHPK3PXP',
          barcode_uri: 'otpauth://totp/Auth0:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Auth0',
        };
        break;
      case 'webauthn-platform':
      case 'webauthn-roaming':
        enrollmentResponse = {
          ...enrollmentResponse,
          authenticator_type: 'webauthn',
          challenge: 'mock-webauthn-challenge',
        };
        break;
    }

    // Add new factor to the list (inactive until confirmed)
    const newFactor: Authenticator = {
      id: newId,
      authenticator_type: enrollmentResponse.authenticator_type,
      oob_channel: factorName === 'sms' ? ['sms'] : factorName === 'email' ? ['email'] : [],
      active: false,
      factorName,
      ...(factorName === 'sms' && { phone_number: options?.phone_number }),
      ...(factorName === 'email' && { email: options?.email }),
    };

    setFactors((prev) => [...prev, newFactor]);

    return enrollmentResponse;
  };

  const deleteMfa = async (authenticatorId: string): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setFactors((prev) => prev.filter((factor) => factor.id !== authenticatorId));
  };

  const confirmEnrollment = async (factorName: MFAType): Promise<unknown> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Find the most recent inactive factor of this type and activate it
    setFactors((prev) =>
      prev.map((factor) => {
        if (factor.factorName === factorName && !factor.active) {
          return { ...factor, active: true };
        }
        return factor;
      }),
    );

    return { success: true };
  };

  const contextValue: MockMFAContextType = {
    factors,
    fetchFactors,
    enrollMfa,
    deleteMfa,
    confirmEnrollment,
  };

  return <MockMFAContext.Provider value={contextValue}>{children}</MockMFAContext.Provider>;
}
