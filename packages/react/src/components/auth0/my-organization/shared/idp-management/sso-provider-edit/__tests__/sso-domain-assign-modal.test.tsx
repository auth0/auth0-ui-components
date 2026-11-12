import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoDomainAssignModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-domain-assign-modal';
import { createMockVerifiedSsoDomain } from '@/tests/utils/__mocks__/my-organization/idp-management/sso-domain.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { SsoDomainAssignModalProps } from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string) => key,
  }),
}));

const acme = createMockVerifiedSsoDomain({ id: 'domain-1', domain: 'acme.com' });
const globex = createMockVerifiedSsoDomain({ id: 'domain-2', domain: 'globex.com' });

function createProps(
  overrides: Partial<SsoDomainAssignModalProps> = {},
): SsoDomainAssignModalProps {
  return {
    isOpen: true,
    isLoading: false,
    isAssigning: false,
    domains: [acme, globex],
    onClose: vi.fn(),
    onAssign: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

const renderModal = (overrides: Partial<SsoDomainAssignModalProps> = {}) => {
  const props = createProps(overrides);
  const view = renderWithProviders(<SsoDomainAssignModal {...props} />);
  return { props, ...view };
};

const getAssignButton = () => screen.getByRole('button', { name: 'actions.assign_button_text' });
const getField = () => screen.getByLabelText('field.label');

const openDropdown = (user: ReturnType<typeof userEvent.setup>) => user.click(getField());

const chooseDomain = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
  await user.click(await screen.findByRole('button', { name }));
};

const pickDomain = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
  await openDropdown(user);
  await chooseDomain(user, name);
};

describe('SsoDomainAssignModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('content', () => {
    it('should render the title, description, field label, placeholder and helper text', () => {
      renderModal();

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('description')).toBeInTheDocument();
      expect(screen.getByText('field.label')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('field.placeholder')).toBeInTheDocument();
      expect(screen.getByText('field.helper_text')).toBeInTheDocument();
    });

    it('should link "Learn more" to the documentation in a new tab', () => {
      renderModal();

      const link = screen.getByRole('link', { name: 'learn_more.link_text' });
      expect(link).toHaveAttribute(
        'href',
        'https://auth0.com/docs/get-started/universal-components/web/components/configure-org-domains',
      );
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
      expect(screen.getByText(/learn_more.text/)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      renderModal({ isOpen: false });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should list only the domains it is given', async () => {
      const user = userEvent.setup();
      renderModal();

      await openDropdown(user);

      expect(await screen.findByRole('button', { name: 'acme.com' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'globex.com' })).toBeInTheDocument();
    });

    it('should show the empty message when no domain is available', async () => {
      const user = userEvent.setup();
      renderModal({ domains: [] });

      await openDropdown(user);

      expect(await screen.findByText('field.empty_message')).toBeInTheDocument();
    });
  });

  describe('selecting domains', () => {
    it('should disable Assign until a domain is selected', async () => {
      const user = userEvent.setup();
      renderModal();

      expect(getAssignButton()).toBeDisabled();
      await pickDomain(user, 'acme.com');

      expect(getAssignButton()).toBeEnabled();
    });

    it('should show selected domains as chips that can be removed', async () => {
      const user = userEvent.setup();
      renderModal();

      await pickDomain(user, 'acme.com');
      const chip = document.querySelector('[data-slot="chip"]');
      expect(chip).toHaveTextContent('acme.com');
      expect(getAssignButton()).toBeEnabled();

      await user.click(chip!.querySelector('button')!);

      expect(document.querySelector('[data-slot="chip"]')).not.toBeInTheDocument();
      expect(getAssignButton()).toBeDisabled();
    });

    it('should allow selecting several domains', async () => {
      const user = userEvent.setup();
      const { props } = renderModal();

      await pickDomain(user, 'acme.com');
      await chooseDomain(user, 'globex.com');
      await user.click(getAssignButton());

      expect(props.onAssign).toHaveBeenCalledWith([acme, globex]);
    });
  });

  describe('assigning', () => {
    it('should close the modal when every domain was assigned', async () => {
      const user = userEvent.setup();
      const { props } = renderModal();

      await pickDomain(user, 'acme.com');
      await user.click(getAssignButton());

      expect(props.onAssign).toHaveBeenCalledWith([acme]);
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('should stay open when a domain could not be assigned', async () => {
      const user = userEvent.setup();
      const { props } = renderModal({ onAssign: vi.fn().mockResolvedValue(false) });

      await pickDomain(user, 'acme.com');
      await user.click(getAssignButton());

      expect(props.onClose).not.toHaveBeenCalled();
    });

    it('should drop domains that are no longer available from the selection', async () => {
      const user = userEvent.setup();
      const { props, rerender } = renderModal({ onAssign: vi.fn().mockResolvedValue(false) });

      await pickDomain(user, 'acme.com');
      await chooseDomain(user, 'globex.com');
      rerender(<SsoDomainAssignModal {...props} domains={[globex]} />);
      await user.click(getAssignButton());

      expect(props.onAssign).toHaveBeenCalledWith([globex]);
    });

    it('should disable the field and actions while assigning', () => {
      renderModal({ isAssigning: true });

      expect(getField()).toBeDisabled();
      expect(
        screen.queryByRole('button', { name: 'actions.assign_button_text' }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'actions.cancel_button_text' })).toBeDisabled();
    });
  });

  describe('closing', () => {
    it('should call onClose from Cancel without assigning', async () => {
      const user = userEvent.setup();
      const { props } = renderModal();

      await pickDomain(user, 'acme.com');
      await user.click(screen.getByRole('button', { name: 'actions.cancel_button_text' }));

      expect(props.onClose).toHaveBeenCalledTimes(1);
      expect(props.onAssign).not.toHaveBeenCalled();
    });

    it('should clear the selection when it is reopened', async () => {
      const user = userEvent.setup();
      const { props, rerender } = renderModal();

      await pickDomain(user, 'acme.com');
      rerender(<SsoDomainAssignModal {...props} isOpen={false} />);
      rerender(<SsoDomainAssignModal {...props} isOpen />);

      expect(getAssignButton()).toBeDisabled();
    });
  });
});
