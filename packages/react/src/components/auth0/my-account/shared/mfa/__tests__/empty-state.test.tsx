import { screen } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { MFAEmptyState } from '../empty-state';

import { renderWithProviders, createMockMFAEmptyStateProps } from '@/tests/utils';

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
