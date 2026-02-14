import { FACTOR_TYPE_EMAIL, FACTOR_TYPE_PHONE } from '@auth0/universal-components-core';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useContactEnrollment } from '@/hooks/my-account/use-contact-enrollment';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { ENROLL } from '@/lib/constants/my-account/mfa/mfa-constants';
import { mockCore, setupAllCommonMocks } from '@/tests/utils';

// ===== Mock packages =====
const { initMockCoreClient } = mockCore();
let mockCoreClient: ReturnType<typeof initMockCoreClient>;

describe('useContactEnrollment', () => {
  const mockEnrollMfa = vi.fn();
  const mockOnError = vi.fn();
  mockCoreClient = initMockCoreClient();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup all common hook mocks
    setupAllCommonMocks({
      useTranslatorModule,
      coreClient: mockCoreClient,
      useCoreClientModule,
      useErrorHandlerModule,
    });
  });

  it('should return initial state', () => {
    const { result } = renderHook(() =>
      useContactEnrollment({
        factorType: FACTOR_TYPE_EMAIL,
        enrollMfa: mockEnrollMfa,
        onError: mockOnError,
      }),
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.contactData).toEqual({
      contact: '',
      authSession: '',
      authenticationMethodId: '',
    });
  });

  it('should enroll with email factor type', async () => {
    mockEnrollMfa.mockResolvedValue({
      id: 'auth-method-123',
      auth_session: 'session-456',
    });

    const { result } = renderHook(() =>
      useContactEnrollment({
        factorType: FACTOR_TYPE_EMAIL,
        enrollMfa: mockEnrollMfa,
        onError: mockOnError,
      }),
    );

    await act(async () => {
      await result.current.onSubmitContact({ contact: 'test@example.com' });
    });

    expect(mockEnrollMfa).toHaveBeenCalledWith(FACTOR_TYPE_EMAIL, {
      email: 'test@example.com',
    });
    expect(result.current.contactData).toEqual({
      contact: 'test@example.com',
      authenticationMethodId: 'auth-method-123',
      authSession: 'session-456',
    });
    expect(result.current.loading).toBe(false);
  });

  it('should enroll with phone factor type', async () => {
    mockEnrollMfa.mockResolvedValue({
      id: 'auth-method-789',
      auth_session: 'session-101',
    });

    const { result } = renderHook(() =>
      useContactEnrollment({
        factorType: FACTOR_TYPE_PHONE,
        enrollMfa: mockEnrollMfa,
        onError: mockOnError,
      }),
    );

    await act(async () => {
      await result.current.onSubmitContact({ contact: '+1234567890' });
    });

    expect(mockEnrollMfa).toHaveBeenCalledWith(FACTOR_TYPE_PHONE, {
      phone_number: '+1234567890',
    });
    expect(result.current.contactData).toEqual({
      contact: '+1234567890',
      authenticationMethodId: 'auth-method-789',
      authSession: 'session-101',
    });
  });

  it('should handle enrollment error', async () => {
    const error = new Error('Enrollment failed');
    mockEnrollMfa.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useContactEnrollment({
        factorType: FACTOR_TYPE_EMAIL,
        enrollMfa: mockEnrollMfa,
        onError: mockOnError,
      }),
    );

    await act(async () => {
      await result.current.onSubmitContact({ contact: 'test@example.com' });
    });

    expect(mockOnError).toHaveBeenCalledWith(expect.any(Error), ENROLL);
    expect(result.current.loading).toBe(false);
  });

  it('should not submit when already loading', async () => {
    let resolveEnroll: (value: unknown) => void;
    mockEnrollMfa.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveEnroll = resolve;
        }),
    );

    const { result } = renderHook(() =>
      useContactEnrollment({
        factorType: FACTOR_TYPE_EMAIL,
        enrollMfa: mockEnrollMfa,
        onError: mockOnError,
      }),
    );

    act(() => {
      result.current.onSubmitContact({ contact: 'test@example.com' });
    });

    expect(result.current.loading).toBe(true);

    // Try to submit again while loading
    await act(async () => {
      await result.current.onSubmitContact({ contact: 'test2@example.com' });
    });

    // Should only have been called once
    expect(mockEnrollMfa).toHaveBeenCalledTimes(1);

    // Cleanup
    await act(async () => {
      resolveEnroll!({ id: 'id', auth_session: 'session' });
    });
  });

  it('should handle response without id', async () => {
    mockEnrollMfa.mockResolvedValue({
      auth_session: 'session-no-id',
    });

    const { result } = renderHook(() =>
      useContactEnrollment({
        factorType: FACTOR_TYPE_EMAIL,
        enrollMfa: mockEnrollMfa,
        onError: mockOnError,
      }),
    );

    await act(async () => {
      await result.current.onSubmitContact({ contact: 'test@example.com' });
    });

    expect(result.current.contactData).toEqual({
      contact: 'test@example.com',
      authenticationMethodId: '',
      authSession: 'session-no-id',
    });
  });

  it('should update contactData with setContactData', () => {
    const { result } = renderHook(() =>
      useContactEnrollment({
        factorType: FACTOR_TYPE_EMAIL,
        enrollMfa: mockEnrollMfa,
        onError: mockOnError,
      }),
    );

    act(() => {
      result.current.setContactData({
        contact: 'updated@example.com',
        authenticationMethodId: 'updated-id',
        authSession: 'updated-session',
      });
    });

    expect(result.current.contactData).toEqual({
      contact: 'updated@example.com',
      authenticationMethodId: 'updated-id',
      authSession: 'updated-session',
    });
  });
});
