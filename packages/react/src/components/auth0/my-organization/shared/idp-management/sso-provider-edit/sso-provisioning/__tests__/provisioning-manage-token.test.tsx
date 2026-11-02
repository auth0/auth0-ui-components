import type { IdpScimTokenBase } from '@auth0/universal-components-core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ProvisioningManageToken } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/provisioning-manage-token';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';
import {
  ALL_IDP_PERMISSIONS,
  createIdpPermissions,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';

// Mock hooks
vi.mock('@/hooks/shared/use-translator', () => ({
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
    permissions: ALL_IDP_PERMISSIONS,
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

  it('should disable generate button when max tokens reached', async () => {
    mockOnListScimTokens.mockResolvedValue({ scim_tokens: mockTokens });
    render(<ProvisioningManageToken {...defaultProps} />);

    await waitFor(() => {
      const generateButton = screen.getByText('generate_button_label');
      expect(generateButton).toBeDisabled();
    });
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

  it('should open the create modal on step 1 when generate is clicked', async () => {
    const user = userEvent.setup();
    render(<ProvisioningManageToken {...defaultProps} />);

    await user.click(await screen.findByText('generate_button_label'));

    expect(await screen.findByText('create_modal.steps.configure')).toBeInTheDocument();
    expect(mockOnCreateScimToken).not.toHaveBeenCalled();
  });

  it('should create with no lifetime when no expiration is checked, then reload tokens', async () => {
    const user = userEvent.setup();
    mockOnCreateScimToken.mockResolvedValue({
      token_id: 'tok_new',
      token: 'secret-value',
      created_at: '2026-03-14T09:12:45Z',
    });
    render(<ProvisioningManageToken {...defaultProps} />);

    await user.click(await screen.findByText('generate_button_label'));
    await user.click(screen.getByRole('checkbox', { name: 'no_expiration.label' }));
    await user.click(screen.getByRole('button', { name: /create_modal.next_button_label/ }));

    await waitFor(() => expect(mockOnCreateScimToken).toHaveBeenCalledWith({}));
    expect(await screen.findByDisplayValue('secret-value')).toBeInTheDocument();
    expect(mockOnListScimTokens).toHaveBeenCalledTimes(2);
  });

  it('should send the profile default lifetime from scimTokenConfig', async () => {
    const user = userEvent.setup();
    mockOnCreateScimToken.mockResolvedValue({
      token_id: 'tok_new',
      token: 'secret-value',
      created_at: '2026-03-14T09:12:45Z',
    });
    render(
      <ProvisioningManageToken
        {...defaultProps}
        scimTokenConfig={{ default_expiry: 7200, max_allowed_expiry: 86400 }}
      />,
    );

    await user.click(await screen.findByText('generate_button_label'));
    await user.click(screen.getByRole('button', { name: /create_modal.next_button_label/ }));

    await waitFor(() =>
      expect(mockOnCreateScimToken).toHaveBeenCalledWith({ token_lifetime: 7200 }),
    );
  });

  it('should stay on step 1 when creation fails', async () => {
    const user = userEvent.setup();
    mockOnCreateScimToken.mockResolvedValue(undefined);
    render(<ProvisioningManageToken {...defaultProps} />);

    await user.click(await screen.findByText('generate_button_label'));
    await user.click(screen.getByRole('checkbox', { name: 'no_expiration.label' }));
    await user.click(screen.getByRole('button', { name: /create_modal.next_button_label/ }));

    await waitFor(() => expect(mockOnCreateScimToken).toHaveBeenCalled());
    expect(screen.getByText('create_modal.steps.configure')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('secret-value')).toBeNull();
  });

  it('should stay on step 1 without an unhandled rejection when creation rejects', async () => {
    const user = userEvent.setup();
    mockOnCreateScimToken.mockRejectedValue(new Error('quota exceeded'));
    render(<ProvisioningManageToken {...defaultProps} />);

    await user.click(await screen.findByText('generate_button_label'));
    await user.click(screen.getByRole('checkbox', { name: 'no_expiration.label' }));
    await user.click(screen.getByRole('button', { name: /create_modal.next_button_label/ }));

    await waitFor(() => expect(mockOnCreateScimToken).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByText('create_modal.steps.configure')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create_modal.next_button_label/ })).toBeEnabled();
  });

  it('should show scopes and created date for a token', async () => {
    mockOnListScimTokens.mockResolvedValue({
      scim_tokens: [
        {
          token_id: 'token-meta',
          scopes: ['get:users', 'post:users'],
          created_at: '2026-03-14T09:12:45Z',
        },
      ],
    });

    render(<ProvisioningManageToken {...defaultProps} />);

    expect(await screen.findByText('token_item.scopes')).toBeInTheDocument();
    expect(screen.getByText('token_item.created_at')).toBeInTheDocument();
  });

  it('should not show scopes or created date when the token has none', async () => {
    mockOnListScimTokens.mockResolvedValue({
      scim_tokens: [{ token_id: 'token-bare', scopes: [], created_at: '' }],
    });

    render(<ProvisioningManageToken {...defaultProps} />);

    expect(await screen.findByText(/token-bare/)).toBeInTheDocument();
    expect(screen.queryByText('token_item.scopes')).not.toBeInTheDocument();
    expect(screen.queryByText('token_item.created_at')).not.toBeInTheDocument();
  });

  it('should show the expiry date for a token with valid_until', async () => {
    mockOnListScimTokens.mockResolvedValue({
      scim_tokens: [
        {
          token_id: 'token-expiring',
          created_at: '2026-03-14T09:12:45Z',
          valid_until: '2099-01-01T00:00:00Z',
        },
      ],
    });

    render(<ProvisioningManageToken {...defaultProps} />);

    expect(await screen.findByText('token_item.expires_on')).toBeInTheDocument();
    expect(screen.queryByText('token_item.never_expire')).not.toBeInTheDocument();
  });

  describe('granted permissions', () => {
    it('should disable the generate button without create:my_org:identity_providers_scim_tokens', () => {
      mockOnListScimTokens.mockResolvedValue({ scim_tokens: [] });
      render(
        <ProvisioningManageToken
          {...defaultProps}
          permissions={createIdpPermissions(['delete:my_org:identity_providers_scim_tokens'])}
        />,
      );

      expect(screen.getByRole('button', { name: /generate_button_label/i })).toBeDisabled();
    });

    it('should disable token delete buttons without delete:my_org:identity_providers_scim_tokens', async () => {
      mockOnListScimTokens.mockResolvedValue({
        scim_tokens: [{ token_id: 'token-1', valid_until: null }],
      });
      render(
        <ProvisioningManageToken
          {...defaultProps}
          permissions={createIdpPermissions(['create:my_org:identity_providers_scim_tokens'])}
        />,
      );

      await screen.findByText(/token-1/);

      screen
        .getAllByRole('button', { name: /delete/i })
        .forEach((button) => expect(button).toBeDisabled());
    });

    it('should show permission denied tooltip on delete button when canDeleteScimToken is missing', async () => {
      mockOnListScimTokens.mockResolvedValue({
        scim_tokens: [{ token_id: 'token-1', valid_until: null }],
      });
      render(
        <ProvisioningManageToken
          {...defaultProps}
          permissions={createIdpPermissions(['create:my_org:identity_providers_scim_tokens'])}
        />,
      );

      await screen.findByText(/token-1/);

      const deleteButton = screen.getByRole('button', { name: /delete.*token-1/i });
      expect(deleteButton.closest('span[tabindex="0"]')).toBeInTheDocument();
    });

    it('should not show permission denied tooltip on delete button when readOnly', async () => {
      mockOnListScimTokens.mockResolvedValue({
        scim_tokens: [{ token_id: 'token-1', valid_until: null }],
      });
      render(
        <ProvisioningManageToken
          {...defaultProps}
          readOnly={true}
          permissions={createIdpPermissions(['create:my_org:identity_providers_scim_tokens'])}
        />,
      );

      await screen.findByText(/token-1/);

      const deleteButton = screen.getByRole('button', { name: /delete.*token-1/i });
      expect(deleteButton.closest('span[tabindex="0"]')).not.toBeInTheDocument();
    });

    it('should show permission denied tooltip on generate button when canCreateScimToken is missing', () => {
      mockOnListScimTokens.mockResolvedValue({ scim_tokens: [] });
      render(
        <ProvisioningManageToken
          {...defaultProps}
          permissions={createIdpPermissions(['delete:my_org:identity_providers_scim_tokens'])}
        />,
      );

      const generateButton = screen.getByRole('button', { name: /generate_button_label/i });
      expect(generateButton.closest('span[tabindex="0"]')).toBeInTheDocument();
    });

    it('should not show permission denied tooltip on generate button when readOnly', () => {
      mockOnListScimTokens.mockResolvedValue({ scim_tokens: [] });
      render(
        <ProvisioningManageToken
          {...defaultProps}
          readOnly={true}
          permissions={createIdpPermissions(['delete:my_org:identity_providers_scim_tokens'])}
        />,
      );

      const generateButton = screen.getByRole('button', { name: /generate_button_label/i });
      expect(generateButton.closest('span[tabindex="0"]')).not.toBeInTheDocument();
    });

    it('should not show permission denied tooltip on generate button when at token limit', async () => {
      mockOnListScimTokens.mockResolvedValue({ scim_tokens: mockTokens });
      render(
        <ProvisioningManageToken
          {...defaultProps}
          permissions={createIdpPermissions(['delete:my_org:identity_providers_scim_tokens'])}
        />,
      );

      await waitFor(() => {
        const generateButton = screen.getByRole('button', { name: /generate_button_label/i });
        expect(generateButton).toBeDisabled();
        expect(generateButton.closest('span[tabindex="0"]')).not.toBeInTheDocument();
      });
    });
  });
});
