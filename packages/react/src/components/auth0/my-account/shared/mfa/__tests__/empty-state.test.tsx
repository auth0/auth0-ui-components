import { screen } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { MFAEmptyState } from '@/components/auth0/my-account/shared/mfa/empty-state';
import { createMockMFAEmptyStateProps } from '@/tests/utils/__mocks__/my-account/mfa/empty-state.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

// ===== Test Suite =====
describe('MFAEmptyState', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render message when is provided', async () => {
    renderWithProviders(<MFAEmptyState {...createMockMFAEmptyStateProps()} />);

    // When default message is used, should display it
    expect(await screen.findByText('Test Message')).toBeInTheDocument();
  });

  it('should render with the className when is provided', async () => {
    renderWithProviders(
      <MFAEmptyState {...createMockMFAEmptyStateProps({ className: 'Custom Class' })} />,
    );

    // When description is provided, should display it
    const element = await screen.findByText('Test Message');
    expect(element).toHaveClass('Custom Class');
  });
});
