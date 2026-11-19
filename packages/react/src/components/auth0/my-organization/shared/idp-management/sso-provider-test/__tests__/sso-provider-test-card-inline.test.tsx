import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoProviderTestCard } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-test/sso-provider-test-card';
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

describe('SsoProviderTestCard inline variant', () => {
  let hookReturn: UseSsoProviderTestReturn;

  beforeEach(() => {
    vi.clearAllMocks();
    hookReturn = createHookReturn();
    vi.mocked(useSsoProviderTest).mockImplementation(() => hookReturn);
  });

  it('shows the description, details and test button without the card title', async () => {
    renderWithProviders(
      <SsoProviderTestCard
        provider={createMockSsoProvider()}
        variant="inline"
        details={<p>extra guidance</p>}
      />,
    );

    expect(screen.queryByRole('heading', { name: 'title' })).not.toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(screen.getByText('extra guidance')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'test_button_label' }));
    expect(hookReturn.start).toHaveBeenCalled();
  });

  it('shows the result once the test finishes', () => {
    hookReturn = createHookReturn({ state: 'success', user: { email: 'bob@acme.corp' } });
    renderWithProviders(
      <SsoProviderTestCard provider={createMockSsoProvider()} variant="inline" />,
    );

    expect(screen.getByText('success_title')).toBeInTheDocument();
  });

  it('keeps the card title in the default variant', () => {
    renderWithProviders(
      <SsoProviderTestCard provider={createMockSsoProvider()} details={<p>extra guidance</p>} />,
    );

    expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument();
    expect(screen.getByText('extra guidance')).toBeInTheDocument();
  });
});
