import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DomainConfigureProvidersModal } from '@/components/auth0/my-organization/shared/domain-management/domain-configure/domain-configure-providers-modal';
import {
  createMockDomain,
  createMockIdentityProviderAssociatedWithDomain,
} from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import {
  ALL_DOMAIN_PERMISSIONS,
  createDomainPermissions,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { DomainConfigureProvidersModalProps } from '@/types/my-organization/domain-management/domain-configure-types';

const googleProvider = createMockIdentityProviderAssociatedWithDomain({
  id: 'con_google123',
  display_name: 'Google Workspace',
  strategy: 'google-apps',
  is_associated: true,
});

const oktaProvider = createMockIdentityProviderAssociatedWithDomain({
  id: 'con_okta456',
  display_name: 'Okta Enterprise',
  strategy: 'okta',
  is_associated: false,
});

const unassignedProviders = [{ ...googleProvider, is_associated: false }, oktaProvider];

function createMockDomainConfigureProvidersModalProps(
  overrides: Partial<DomainConfigureProvidersModalProps> = {},
): DomainConfigureProvidersModalProps {
  return {
    isOpen: true,
    isLoading: false,
    isSaving: false,
    permissions: ALL_DOMAIN_PERMISSIONS,
    domain: createMockDomain({ status: 'verified' }),
    providers: [googleProvider, oktaProvider],
    onClose: vi.fn(),
    onAssign: vi.fn(),
    onRemove: vi.fn(),
    onOpenProvider: vi.fn(),
    onCreateProvider: vi.fn(),
    ...overrides,
  };
}

const renderModal = (overrides: Partial<DomainConfigureProvidersModalProps> = {}) => {
  const props = createMockDomainConfigureProvidersModalProps(overrides);
  const view = renderWithProviders(<DomainConfigureProvidersModal {...props} />);
  return { props, ...view };
};

const getRemoveButton = (providerLabel: string) =>
  within(screen.getByText(providerLabel).closest('li')!).getByRole('button', {
    name: 'actions.remove_button_aria_label',
  });
const querySaveButton = () => screen.queryByRole('button', { name: 'actions.save_button_text' });
const getFooterButton = (name: string) =>
  screen.getAllByRole('button', { name }).find((button) => !button.querySelector('svg'))!;

const selectProvider = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByRole('combobox'));
  await user.click(await screen.findByRole('option', { name: label }));
};

describe('DomainConfigureProvidersModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the title and description', () => {
      renderModal();

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('description')).toBeInTheDocument();
    });

    describe('when isOpen is false', () => {
      it('should not render the modal', () => {
        renderModal({ isOpen: false });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    describe('when domain is null', () => {
      it('should not render content', () => {
        renderModal({ domain: null });

        expect(screen.queryByText('description')).not.toBeInTheDocument();
      });
    });

    it('should apply custom styling classes', () => {
      renderModal({ styling: { classes: { 'DomainTable-configureModal': 'custom-class' } } });

      expect(screen.getByText('description').closest('div')).toHaveClass('custom-class');
    });

    it('should render custom messages', () => {
      renderModal({ customMessages: { title: 'Custom Title', description: 'Custom description' } });

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom description')).toBeInTheDocument();
    });

    it('should not render a switch per provider', () => {
      renderModal();

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });
  });

  describe('when the domain is assigned to a provider', () => {
    it('should show the assigned provider as display name and strategy', () => {
      renderModal();

      expect(screen.getByText('Google Workspace (google-apps)')).toBeInTheDocument();
      expect(screen.queryByText('Okta Enterprise (okta)')).not.toBeInTheDocument();
    });

    it('should explain how to associate a different connection', () => {
      renderModal();

      expect(screen.getByText('assigned_helper_text')).toBeInTheDocument();
    });

    it('should show only Close, without the provider field or Save', () => {
      renderModal();

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      expect(querySaveButton()).not.toBeInTheDocument();
      expect(getFooterButton('actions.close_button_text')).toBeInTheDocument();
    });

    it('should call onRemove with the assigned provider', async () => {
      const user = userEvent.setup();
      const { props } = renderModal();

      await user.click(getRemoveButton('Google Workspace (google-apps)'));

      expect(props.onRemove).toHaveBeenCalledWith(
        props.domain,
        expect.objectContaining({ id: 'con_google123' }),
      );
    });

    it('should fall back to the provider name when display name is missing', () => {
      renderModal({
        providers: [{ ...googleProvider, display_name: undefined, name: 'google-conn' }],
      });

      expect(screen.getByText('google-conn (google-apps)')).toBeInTheDocument();
    });

    it('should disable Remove while saving', () => {
      renderModal({ isSaving: true });

      expect(getRemoveButton('Google Workspace (google-apps)')).toBeDisabled();
    });

    it('should disable Remove without the delete scope', () => {
      renderModal({
        permissions: createDomainPermissions(['create:my_org:identity_providers_domains']),
      });

      expect(getRemoveButton('Google Workspace (google-apps)')).toBeDisabled();
    });

    it('should open the assigned provider from View', async () => {
      const user = userEvent.setup();
      const { props } = renderModal();

      await user.click(
        screen.getByRole('button', { name: 'table.actions.view_provider_button_text' }),
      );

      expect(props.onOpenProvider).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'con_google123' }),
      );
    });

    it('should not render View when onOpenProvider is not provided', () => {
      renderModal({ onOpenProvider: undefined });

      expect(
        screen.queryByRole('button', { name: 'table.actions.view_provider_button_text' }),
      ).not.toBeInTheDocument();
    });

    it('should show the field once the provider is removed', () => {
      const { props, rerender } = renderModal();

      rerender(<DomainConfigureProvidersModal {...props} providers={unassignedProviders} />);

      expect(screen.getByRole('combobox')).toHaveTextContent('field.placeholder');
      expect(screen.queryByText('Google Workspace (google-apps)')).not.toBeInTheDocument();
    });
  });

  describe('when the domain is assigned to more than one provider', () => {
    const providers = [googleProvider, { ...oktaProvider, is_associated: true }];

    it('should list every assigned provider with Remove and a warning', () => {
      renderModal({ providers });

      expect(screen.getByText('legacy_warning')).toBeInTheDocument();
      expect(getRemoveButton('Google Workspace (google-apps)')).toBeInTheDocument();
      expect(getRemoveButton('Okta Enterprise (okta)')).toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('should not show the warning for a single assignment', () => {
      renderModal();

      expect(screen.queryByText('legacy_warning')).not.toBeInTheDocument();
    });
  });

  describe('when the domain has no provider', () => {
    it('should show the provider field with a placeholder and helper text', () => {
      renderModal({ providers: unassignedProviders });

      expect(screen.getByText('field.label')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveTextContent('field.placeholder');
      expect(screen.getByText('field.helper_text')).toBeInTheDocument();
    });

    it('should show Cancel and Save', () => {
      renderModal({ providers: unassignedProviders });

      expect(getFooterButton('actions.cancel_button_text')).toBeInTheDocument();
      expect(querySaveButton()).toBeInTheDocument();
    });

    it('should list every provider as display name and strategy', async () => {
      const user = userEvent.setup();
      renderModal({ providers: unassignedProviders });

      await user.click(screen.getByRole('combobox'));

      expect(
        await screen.findByRole('option', { name: 'Google Workspace (google-apps)' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Okta Enterprise (okta)' })).toBeInTheDocument();
    });

    it('should disable Save until a provider is selected', async () => {
      const user = userEvent.setup();
      renderModal({ providers: unassignedProviders });

      expect(querySaveButton()).toBeDisabled();
      await selectProvider(user, 'Okta Enterprise (okta)');

      expect(querySaveButton()).toBeEnabled();
    });

    it('should call onClose from Cancel without assigning', async () => {
      const user = userEvent.setup();
      const { props } = renderModal({ providers: unassignedProviders });

      await selectProvider(user, 'Okta Enterprise (okta)');
      await user.click(getFooterButton('actions.cancel_button_text'));

      expect(props.onClose).toHaveBeenCalledTimes(1);
      expect(props.onAssign).not.toHaveBeenCalled();
    });

    it('should call onAssign with the selected provider on Save', async () => {
      const user = userEvent.setup();
      const { props } = renderModal({ providers: unassignedProviders });

      await selectProvider(user, 'Okta Enterprise (okta)');
      await user.click(querySaveButton()!);

      expect(props.onAssign).toHaveBeenCalledTimes(1);
      expect(props.onAssign).toHaveBeenCalledWith(
        props.domain,
        expect.objectContaining({ id: 'con_okta456' }),
      );
      expect(props.onRemove).not.toHaveBeenCalled();
    });

    it('should disable the field while saving', () => {
      renderModal({ providers: unassignedProviders, isSaving: true });

      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should disable the field without the create scope', () => {
      renderModal({
        providers: unassignedProviders,
        permissions: createDomainPermissions(['delete:my_org:identity_providers_domains']),
      });

      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should clear the selection when the modal reopens', async () => {
      const user = userEvent.setup();
      const { props, rerender } = renderModal({ providers: unassignedProviders });

      await selectProvider(user, 'Okta Enterprise (okta)');
      rerender(<DomainConfigureProvidersModal {...props} isOpen={false} />);
      rerender(<DomainConfigureProvidersModal {...props} isOpen={true} />);

      expect(screen.getByRole('combobox')).toHaveTextContent('field.placeholder');
      expect(querySaveButton()).toBeDisabled();
    });
  });

  describe('when no providers are available', () => {
    it('should render the empty state instead of the field', () => {
      renderModal({ providers: [] });

      expect(screen.getByText('table.empty_message')).toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('should render Add a Provider when onCreateProvider is provided', async () => {
      const user = userEvent.setup();
      const { props } = renderModal({ providers: [] });

      await user.click(
        screen.getByRole('button', { name: 'table.actions.add_provider_button_text' }),
      );

      expect(props.onCreateProvider).toHaveBeenCalledTimes(1);
    });

    it('should not render Add a Provider when onCreateProvider is not provided', () => {
      renderModal({ providers: [], onCreateProvider: undefined });

      expect(
        screen.queryByRole('button', { name: 'table.actions.add_provider_button_text' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('close', () => {
    it('should call onClose from the Close button', async () => {
      const user = userEvent.setup();
      const { props } = renderModal();

      await user.click(getFooterButton('actions.close_button_text'));

      expect(props.onClose).toHaveBeenCalledTimes(1);
      expect(props.onAssign).not.toHaveBeenCalled();
      expect(props.onRemove).not.toHaveBeenCalled();
    });

    it('should call onClose when the dialog is dismissed with Escape', async () => {
      const user = userEvent.setup();
      const { props } = renderModal();

      await user.keyboard('{Escape}');

      expect(props.onClose).toHaveBeenCalled();
    });
  });
});
