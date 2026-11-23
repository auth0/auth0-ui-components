import type {
  MfaFlowFacts,
  MfaRequiredError,
  MfaStepUpMachine,
  MfaStepUpSnapshot,
} from '@auth0/universal-components-core';
import { vi } from 'vitest';

export const mockMfaRequiredError = {
  mfa_token: 'test-mfa-token',
  error: 'mfa_required' as const,
  error_description: 'MFA required',
  name: 'MfaRequiredError',
  message: 'MFA required',
} satisfies MfaRequiredError;

export const mock5xxError = { status: 503 };

export const createMockFacts = (overrides: Partial<MfaFlowFacts> = {}): MfaFlowFacts => ({
  optionCount: 0,
  enrollment: { hasRecoveryCodes: false },
  isVerified: false,
  round: 1,
  hasNewRecoveryCode: false,
  ...overrides,
});

export const createMockSnapshot = (
  overrides: Partial<MfaStepUpSnapshot> = {},
): MfaStepUpSnapshot => ({
  status: 'active',
  step: 'list',
  canBack: true,
  canChooseAnotherFactor: false,
  canResend: false,
  round: 1,
  options: [],
  facts: {
    optionCount: 0,
    enrollment: { hasRecoveryCodes: false },
    isVerified: false,
    round: 1,
    hasNewRecoveryCode: false,
  },
  request: { isLoading: false },
  contact: '',
  enrollment: {},
  ...overrides,
});

export const createMockStepUpMachine = (): MfaStepUpMachine => ({
  start: vi.fn().mockResolvedValue(undefined),
  getSnapshot: vi.fn(),
  subscribe: vi.fn(),
  next: vi.fn().mockResolvedValue(undefined),
  back: vi.fn(),
  chooseAnotherFactor: vi.fn(),
  resend: vi.fn().mockResolvedValue(undefined),
  switchToCode: vi.fn(),
  switchToPush: vi.fn().mockResolvedValue(undefined),
  cancel: vi.fn(),
  dispose: vi.fn(),
});
