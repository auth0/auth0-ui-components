import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoGuidedSetupTestConnection } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup-test-connection';
import { useSsoProviderTest } from '@/hooks/my-organization/use-sso-provider-test';
import { createMockSsoProvider } from '@/tests/utils/__mocks__/my-organization/idp-management/sso-domain.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { UseSsoProviderTestReturn } from '@/types/my-organization/idp-management/sso-provider/sso-provider-test-types';

vi.mock('@/hooks/my-organization/use-sso-provider-test');

const createHookReturn = (
  overrides: Partial<UseSsoProviderTestReturn> = {},
): UseSsoProviderTestReturn => ({
  state: 'idle',
  user: null,
  errorReason: null,
  errorMessage: null,
  blockedTestUrl: null,
  start: vi.fn().mockResolvedValue(undefined),
  retry: vi.fn().mockResolvedValue(undefined),
  cancel: vi.fn(),
  ...overrides,
});

const provider = createMockSsoProvider();

const renderTest = (canTest = true) =>
  renderWithProviders(<SsoGuidedSetupTestConnection provider={provider} canTest={canTest} />);

describe('SsoGuidedSetupTestConnection', () => {
  let hookReturn: UseSsoProviderTestReturn;

  beforeEach(() => {
    vi.clearAllMocks();
    hookReturn = createHookReturn();
    vi.mocked(useSsoProviderTest).mockImplementation(() => hookReturn);
  });

  it('starts a test for the provider without the edit page card heading', async () => {
    renderTest();

    await userEvent.click(screen.getByRole('button', { name: 'test_button_label' }));

    expect(useSsoProviderTest).toHaveBeenCalledWith(provider.id);
    expect(hookReturn.start).toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: 'title' })).not.toBeInTheDocument();
  });

  it('disables the test without permission to test providers', () => {
    renderTest(false);

    expect(screen.getByRole('button', { name: 'test_button_label' })).toBeDisabled();
  });

  it('disables the test while it runs', () => {
    hookReturn = createHookReturn({ state: 'polling' });
    renderTest();

    expect(screen.getByRole('button', { name: 'test_button_label', hidden: true })).toBeDisabled();
  });

  it('shows the result once the test finishes', () => {
    hookReturn = createHookReturn({ state: 'success', user: { email: 'bob@acme.corp' } });
    renderTest();

    expect(screen.getByText('success_title')).toBeInTheDocument();
  });
});
