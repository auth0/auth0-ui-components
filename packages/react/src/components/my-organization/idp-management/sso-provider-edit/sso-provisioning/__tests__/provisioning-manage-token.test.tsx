import type { IdpScimTokenBase } from '@auth0/universal-components-core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createMockI18nService } from '../../../../../../internals/__mocks__/core/i18n-service.mocks';
import { ProvisioningManageToken } from '../provisioning-manage-token';

// Mock hooks
vi.mock('../../../../../../hooks/use-translator', () => ({
  useTranslator: () => ({
    t: createMockI18nService().translator('idp_management.sso_provisioning.manage_token'),
    changeLanguage: vi.fn(),
    currentLanguage: 'en',
    fallbackLanguage: 'en',
  }),
}));

describe('ProvisioningManageToken', () => {
  const mockOnListScimTokens = vi.fn();
  const mockOnCreateScimToken = vi.fn();
  const mockOnDeleteScimToken = vi.fn();

  const defaultProps = {
    isScimTokensLoading: false,
    isScimTokenCreating: false,
    isScimTokenDeleting: false,
    onListScimTokens: mockOnListScimTokens,
    onCreateScimToken: mockOnCreateScimToken,
    onDeleteScimToken: mockOnDeleteScimToken,
  };

  const mockTokens: IdpScimTokenBase[] = [
    {
      token_id: 'token-1',
      valid_until: undefined,
      created_at: '',
    },
    {
      token_id: 'token-2',
      valid_until: '',
      created_at: '',
    },
  ];

  const expiredToken: IdpScimTokenBase = {
    token_id: 'token-expired',
    valid_until: '2020-01-01T00:00:00Z',
    created_at: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnListScimTokens.mockResolvedValue({ scim_tokens: [] });
  });

  it('should render title and description', async () => {
    render(<ProvisioningManageToken {...defaultProps} />);

    expect(await screen.findByText('title')).toBeInTheDocument();
    expect(await screen.findByText('description')).toBeInTheDocument();
  });

  it('should render generate button', async () => {
    render(<ProvisioningManageToken {...defaultProps} />);

    expect(await screen.findByText('generate_button_label')).toBeInTheDocument();
  });

  it('should load tokens on mount', async () => {
    mockOnListScimTokens.mockResolvedValue({ scim_tokens: mockTokens });
    render(<ProvisioningManageToken {...defaultProps} />);

    await waitFor(() => {
      expect(mockOnListScimTokens).toHaveBeenCalled();
    });
  });

  it('should show loading spinner when isScimTokensLoading is true', async () => {
    render(<ProvisioningManageToken {...defaultProps} isScimTokensLoading={true} />);
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('should display tokens when loaded', async () => {
    mockOnListScimTokens.mockResolvedValue({ scim_tokens: mockTokens });
    render(<ProvisioningManageToken {...defaultProps} />);

    expect(await screen.findByText(/token-1/)).toBeInTheDocument();
    expect(await screen.findByText(/token-2/)).toBeInTheDocument();
  });

  it('should show active badge for active tokens', async () => {
    mockOnListScimTokens.mockResolvedValue({ scim_tokens: mockTokens });
    render(<ProvisioningManageToken {...defaultProps} />);

    const badges = await screen.findAllByText('token_item.status_active');
    expect(badges).toHaveLength(2);
  });

  it('should show expired badge for expired tokens', async () => {
    mockOnListScimTokens.mockResolvedValue({ scim_tokens: [expiredToken] });
    render(<ProvisioningManageToken {...defaultProps} />);

    expect(await screen.findByText('token_item.status_expired')).toBeInTheDocument();
  });

  it('should show "never expire" text for tokens without valid_until', async () => {
    mockOnListScimTokens.mockResolvedValue({
      scim_tokens: [{ token_id: 'token-1', valid_until: undefined }],
    });
    render(<ProvisioningManageToken {...defaultProps} />);

    expect(await screen.findByText('token_item.never_expire')).toBeInTheDocument();
  });

  it('should call onCreateScimToken when generate button is clicked', async () => {
    const user = userEvent.setup();
    const mockCreatedToken = {
      scim_token: 'new-token-value',
      token_id: 'new-token-id',
    };
    mockOnCreateScimToken.mockResolvedValue(mockCreatedToken);
    mockOnListScimTokens.mockResolvedValue({ scim_tokens: [] });

    render(<ProvisioningManageToken {...defaultProps} />);

    const generateButton = await screen.findByText('generate_button_label');
    await user.click(generateButton);

    await waitFor(() => {
      expect(mockOnCreateScimToken).toHaveBeenCalledWith({ token_lifetime: 3600 });
    });
  });

  it('should disable generate button when max tokens reached', async () => {
    mockOnListScimTokens.mockResolvedValue({ scim_tokens: mockTokens });
    render(<ProvisioningManageToken {...defaultProps} />);

    const generateButton = await screen.findByText('generate_button_label');
    expect(generateButton).toBeDisabled();
  });

  it('should disable generate button when isScimTokenCreating is true', () => {
    render(<ProvisioningManageToken {...defaultProps} isScimTokenCreating={true} />);

    const generateButton = screen.getByText('generate_button_label');
    expect(generateButton).toBeDisabled();
  });

  it('should show spinner on generate button when creating token', async () => {
    render(<ProvisioningManageToken {...defaultProps} isScimTokenCreating={true} />);

    const spinners = await screen.findAllByText('Loading...');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('should open delete modal when delete button is clicked', async () => {
    mockOnListScimTokens.mockResolvedValue({
      scim_tokens: [{ token_id: 'token-1', valid_until: null }],
    });
    render(<ProvisioningManageToken {...defaultProps} />);

    await screen.findByText(/token-1/);

    const deleteButton = screen.findByRole('button', { name: /delete/i });
    fireEvent.click(await deleteButton);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('should call onDeleteScimToken when delete is confirmed', async () => {
    const user = userEvent.setup();
    mockOnListScimTokens.mockResolvedValue({
      scim_tokens: [{ token_id: 'token-1', valid_until: null }],
    });
    render(<ProvisioningManageToken {...defaultProps} />);

    await screen.findByText(/token-1/);

    const deleteButton = screen.findByRole('button', { name: /delete/i });
    fireEvent.click(await deleteButton);
    await screen.findByRole('dialog');

    const confirmButton = screen.findByText('delete_modal.delete_button_label');
    user.click(await confirmButton);
    await waitFor(() => {
      expect(mockOnDeleteScimToken).toHaveBeenCalledWith('token-1');
    });
  });

  it('should disable delete buttons when isScimTokenDeleting is true', async () => {
    mockOnListScimTokens.mockResolvedValue({
      scim_tokens: [{ token_id: 'token-1', valid_until: null }],
    });
    render(<ProvisioningManageToken {...defaultProps} isScimTokenDeleting={true} />);

    await screen.findByText(/token-1/);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    deleteButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('should reload tokens after successful creation', async () => {
    const user = userEvent.setup();
    const mockCreatedToken = {
      scim_token: 'new-token-value',
      token_id: 'new-token-id',
    };
    mockOnCreateScimToken.mockResolvedValue(mockCreatedToken);
    mockOnListScimTokens.mockResolvedValueOnce({ scim_tokens: [] }).mockResolvedValueOnce({
      scim_tokens: [{ token_id: 'new-token-id', valid_until: undefined }],
    });

    render(<ProvisioningManageToken {...defaultProps} />);

    const generateButton = await screen.findByText('generate_button_label');
    await user.click(generateButton);

    await waitFor(() => {
      expect(mockOnListScimTokens).toHaveBeenCalledTimes(2);
    });
  });

  it('should apply custom styling classes', async () => {
    const styling = {
      variables: { common: {}, light: {}, dark: {} },
      classes: {
        'ProvisioningManageToken-root': 'custom-root-class',
        'ProvisioningManageToken-card': 'custom-card-class',
      },
    };

    const { container } = render(<ProvisioningManageToken {...defaultProps} styling={styling} />);

    await waitFor(() => {
      expect(container.querySelector('.custom-root-class')).toBeInTheDocument();
    });
  });

  it('should not render card content when no tokens exist', async () => {
    mockOnListScimTokens.mockResolvedValue({ scim_tokens: [] });
    render(<ProvisioningManageToken {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('token_item.token_prefix')).not.toBeInTheDocument();
    });
  });

  it('should show create modal after generating token', async () => {
    const user = userEvent.setup();
    const mockCreatedToken = {
      scim_token: 'new-token-value',
      token_id: 'new-token-id',
    };
    mockOnCreateScimToken.mockResolvedValue(mockCreatedToken);
    mockOnListScimTokens.mockResolvedValue({ scim_tokens: [] });

    render(<ProvisioningManageToken {...defaultProps} />);

    const generateButton = await screen.findByText('generate_button_label');
    await user.click(generateButton);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
