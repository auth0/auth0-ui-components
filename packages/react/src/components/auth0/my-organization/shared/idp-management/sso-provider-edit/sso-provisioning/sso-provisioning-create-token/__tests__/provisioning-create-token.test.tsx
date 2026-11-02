import type { IdpScimTokenConfig } from '@auth0/universal-components-core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ProvisioningCreateTokenModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-create-token/provisioning-create-token-modal';
import { ProvisioningCreateTokenModalContent } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-create-token/provisioning-create-token-modal-content';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (params?.tokenId) return `${key} ${params.tokenId}`;
      return key;
    },
  }),
}));

const formSpy = vi.hoisted(() => vi.fn());
vi.mock(
  '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-create-token/provisioning-create-token-form',
  async (importOriginal) => {
    const actual = await importOriginal<Record<string, React.ComponentType<unknown>>>();
    const Actual = actual.ProvisioningCreateTokenForm!;
    return {
      ...actual,
      ProvisioningCreateTokenForm: (props: Record<string, unknown>) => {
        formSpy(props);
        return <Actual {...props} />;
      },
    };
  },
);

describe('ProvisioningCreateTokenModalContent', () => {
  const defaultProps = {
    token: 'test-token-value-123',
    tokenId: 'token-id-1',
  };

  it('renders the token description', () => {
    render(<ProvisioningCreateTokenModalContent {...defaultProps} />);

    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('renders the token field with label and tokenId', () => {
    render(<ProvisioningCreateTokenModalContent {...defaultProps} />);

    expect(screen.getByText(/field.label/)).toBeInTheDocument();
    expect(screen.getByText(/token-id-1/)).toBeInTheDocument();
  });

  it('renders the copyable text field with the token value', () => {
    render(<ProvisioningCreateTokenModalContent {...defaultProps} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test-token-value-123');
    expect(input).toHaveAttribute('readonly');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProvisioningCreateTokenModalContent {...defaultProps} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('ProvisioningCreateTokenModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockClipboard = { writeText: vi.fn() };

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    createdToken: {
      token: 'created-token-123',
      token_id: 'token-id-1',
      created_at: '2024-01-01T00:00:00.000Z',
    },
    isLoading: false,
    onCreate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: mockClipboard });
  });

  it('renders the modal when open is true', () => {
    render(<ProvisioningCreateTokenModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render the modal when open is false', () => {
    render(<ProvisioningCreateTokenModal {...defaultProps} open={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the copy and close button', () => {
    render(<ProvisioningCreateTokenModal {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /create_modal.copy_and_close_button_label/i }),
    ).toBeInTheDocument();
  });
});

describe('ProvisioningCreateTokenModal — configure step', () => {
  const onCreate = vi.fn().mockResolvedValue(undefined);
  const baseProps = {
    open: true,
    isLoading: false,
    onOpenChange: vi.fn(),
    createdToken: null,
    onCreate,
  };
  const bounded: IdpScimTokenConfig = {
    scopes: ['get:users', 'post:users'],
    default_expiry: 3600,
    max_allowed_expiry: 86400,
  };
  const nextButton = () => screen.getByRole('button', { name: /create_modal.next_button_label/ });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the stepper and the next button on step 1', () => {
    render(<ProvisioningCreateTokenModal {...baseProps} />);

    expect(screen.getByText('create_modal.steps.configure')).toBeInTheDocument();
    expect(screen.getByText('create_modal.steps.review')).toBeInTheDocument();
    expect(nextButton()).toBeEnabled();
  });

  it('sends no lifetime when no expiration is checked', async () => {
    const user = userEvent.setup();
    render(<ProvisioningCreateTokenModal {...baseProps} />);

    await user.click(screen.getByRole('checkbox', { name: 'no_expiration.label' }));
    await user.click(nextButton());

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith({}));
  });

  it('sends the pre-filled profile default lifetime', async () => {
    const user = userEvent.setup();
    render(<ProvisioningCreateTokenModal {...baseProps} scimTokenConfig={bounded} />);

    await user.click(nextButton());

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith({ token_lifetime: 3600 }));
  });

  it('sends the typed lifetime', async () => {
    const user = userEvent.setup();
    render(<ProvisioningCreateTokenModal {...baseProps} scimTokenConfig={bounded} />);

    const field = screen.getByRole('textbox', { name: 'token_lifetime.label' });
    await user.clear(field);
    await user.type(field, '7200');
    await user.click(nextButton());

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith({ token_lifetime: 7200 }));
  });

  it('requires a lifetime when no expiration is clear and no default exists', async () => {
    const user = userEvent.setup();
    render(<ProvisioningCreateTokenModal {...baseProps} />);

    await user.click(nextButton());

    expect(
      await screen.findByText('create_modal.fields.token_lifetime.errors.required'),
    ).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('blocks a lifetime below 900 seconds', async () => {
    const user = userEvent.setup();
    render(<ProvisioningCreateTokenModal {...baseProps} scimTokenConfig={bounded} />);

    const field = screen.getByRole('textbox', { name: 'token_lifetime.label' });
    await user.clear(field);
    await user.type(field, '100');
    await user.click(nextButton());

    expect(
      await screen.findByText('create_modal.fields.token_lifetime.errors.min'),
    ).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('blocks a lifetime above max_allowed_expiry', async () => {
    const user = userEvent.setup();
    render(<ProvisioningCreateTokenModal {...baseProps} scimTokenConfig={bounded} />);

    const field = screen.getByRole('textbox', { name: 'token_lifetime.label' });
    await user.clear(field);
    await user.type(field, '90000');
    await user.click(nextButton());

    expect(
      await screen.findByText('create_modal.fields.token_lifetime.errors.max'),
    ).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('disables next when no scope is selected', async () => {
    const user = userEvent.setup();
    render(<ProvisioningCreateTokenModal {...baseProps} scimTokenConfig={bounded} />);

    await user.click(screen.getByRole('checkbox', { name: 'get:users' }));
    await user.click(screen.getByRole('checkbox', { name: 'post:users' }));

    expect(nextButton()).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: 'get:users' }));

    expect(nextButton()).toBeEnabled();
  });

  it('calls onCreate once on a rapid double click of next', async () => {
    const user = userEvent.setup();
    let resolveCreate!: () => void;
    onCreate.mockImplementationOnce(
      () => new Promise<void>((resolve) => (resolveCreate = resolve)),
    );
    render(<ProvisioningCreateTokenModal {...baseProps} scimTokenConfig={bounded} />);

    const next = nextButton();
    await user.dblClick(next);
    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    await user.click(next);

    expect(onCreate).toHaveBeenCalledTimes(1);
    resolveCreate();
  });

  it('submits once on Enter in the lifetime field and ignores Enter while loading', async () => {
    const { rerender } = render(
      <ProvisioningCreateTokenModal {...baseProps} scimTokenConfig={bounded} />,
    );
    // Form submit event is what Enter dispatches; jsdom skips implicit submission
    // because Radix checkboxes add hidden inputs.
    const field = screen.getByRole('textbox', { name: 'token_lifetime.label' });
    const submitForm = () => fireEvent.submit(field.closest('form')!);

    submitForm();
    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));

    rerender(<ProvisioningCreateTokenModal {...baseProps} scimTokenConfig={bounded} isLoading />);
    submitForm();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('does not call onCreate on Enter when no scope is selected', async () => {
    const user = userEvent.setup();
    render(<ProvisioningCreateTokenModal {...baseProps} scimTokenConfig={bounded} />);

    await user.click(screen.getByRole('checkbox', { name: 'get:users' }));
    await user.click(screen.getByRole('checkbox', { name: 'post:users' }));
    fireEvent.submit(
      screen.getByRole('textbox', { name: 'token_lifetime.label' }).closest('form')!,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onCreate).not.toHaveBeenCalled();
  });

  it('passes create_modal.fields and create_modal.content overrides to children', () => {
    const fields = { no_expiration: { label: 'Never expires' } };
    formSpy.mockClear();
    render(
      <ProvisioningCreateTokenModal {...baseProps} customMessages={{ create_modal: { fields } }} />,
    );

    expect(formSpy).toHaveBeenCalledWith(expect.objectContaining({ customMessages: fields }));
  });

  it('shows the reveal step and copy button when a token exists', () => {
    render(
      <ProvisioningCreateTokenModal
        {...baseProps}
        createdToken={{
          token_id: 'tok_1',
          token: 'secret-value',
          created_at: '2026-03-14T09:12:45Z',
        }}
      />,
    );

    expect(screen.getByDisplayValue('secret-value')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create_modal.copy_and_close_button_label/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create_modal.next_button_label/ })).toBeNull();
  });
});
