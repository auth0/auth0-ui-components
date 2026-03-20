import { type MfaRequiredError } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { useMfaRequirements } from '@/hooks/shared/use-mfa-requirements';
import { useMfaStepUp } from '@/hooks/shared/use-mfa-step-up';

export const mockMfaRequiredError = {
  mfa_token: 'test-mfa-token',
  error: 'mfa_required' as const,
  error_description: 'MFA required',
  name: 'MfaRequiredError',
  message: 'MFA required',
} satisfies MfaRequiredError;

export const mock5xxError = { status: 503 };

export const mockUseMfaRequirements = (
  overrides: Partial<ReturnType<typeof useMfaRequirements>> = {},
) => {
  vi.mocked(useMfaRequirements).mockReturnValue({
    factors: [],
    authenticators: [],
    isEnrollMode: false,
    isLoading: false,
    ...overrides,
  });
};

export const mockUseMfaStepUp = (overrides: Partial<ReturnType<typeof useMfaStepUp>> = {}) => {
  vi.mocked(useMfaStepUp).mockReturnValue({
    enroll: vi.fn(),
    challenge: vi.fn(),
    verify: vi.fn(),
    isLoading: false,
    ...overrides,
  });
};
