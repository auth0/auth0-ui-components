import type { FactorMapping, MfaFactorType } from './mfa-step-up-api-types';

export const MFA_REQUIRED_ERROR = 'mfa_required';

export const FACTOR_MAPPING: Record<MfaFactorType, FactorMapping> = {
  otp: {
    authenticatorTypes: ['otp'],
  },
  sms: {
    authenticatorTypes: ['oob'],
    oobChannels: ['sms'],
  },
  email: {
    authenticatorTypes: ['oob'],
    oobChannels: ['email'],
  },
  push: {
    authenticatorTypes: ['oob'],
    oobChannels: ['auth0'],
  },
  voice: {
    authenticatorTypes: ['oob'],
    oobChannels: ['voice'],
  },
};
