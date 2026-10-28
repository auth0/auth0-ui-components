import type { UserOrganization } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationSwitcher } from '@/components/auth0/my-account/organization-switcher';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockUserOrganization,
  createMockUserOrganizations,
  createMockUserOrganizationsPage,
} from '@/tests/utils/__mocks__/my-account/organization-management/organization-table.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore } from '@/tests/utils/test-setup';
import type { OrganizationSwitcherProps } from '@/types/my-account/organization-management/organization-switcher-types';

const { initMockCoreClient } = mockCore();

describe('OrganizationSwitcher', () => {
  const organizations = createMockUserOrganizations();
  let listOrganizations: ReturnType<typeof vi.fn>;
  let onSwitchOrganization: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const mockCoreClient = initMockCoreClient();
    listOrganizations = mockCoreClient.getMyAccountApiClient().organizations.list as ReturnType<
      typeof vi.fn
    >;
    listOrganizations.mockResolvedValue(createMockUserOrganizationsPage(organizations));
    onSwitchOrganization = vi.fn();
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  const renderSwitcher = (props: Partial<OrganizationSwitcherProps> = {}) =>
    renderWithProviders(
      <OrganizationSwitcher onSwitchOrganization={onSwitchOrganization} {...props} />,
    );

  const findTrigger = () => screen.findByRole('button', { name: /^trigger_(label|placeholder)$/ });

  const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(await findTrigger());
    return screen.findByRole('menu');
  };

  describe('when the current organization is loaded', () => {
    it('shows its display name on the trigger', async () => {
      renderSwitcher({ currentOrganizationId: 'org_abc123' });

      expect(await screen.findByRole('button', { name: 'trigger_label' })).toHaveTextContent(
        'Acme Corp.',
      );
    });

    it('marks only the current organization in the list', async () => {
      const user = userEvent.setup();
      renderSwitcher({ currentOrganizationId: 'org_abc123' });

      await openMenu(user);

      expect(screen.getByRole('menuitem', { name: 'Acme Corp.' })).toHaveAttribute(
        'aria-current',
        'true',
      );
      expect(screen.getByRole('menuitem', { name: 'Fabrikam Inc.' })).not.toHaveAttribute(
        'aria-current',
      );
    });
  });

  describe('when the current organization is unknown', () => {
    it('shows the placeholder on the trigger', async () => {
      renderSwitcher();

      expect(await findTrigger()).toHaveTextContent('trigger_placeholder');
    });
  });

  describe('when a current organization name is provided', () => {
    it('prefers the loaded display name', async () => {
      renderSwitcher({ currentOrganizationId: 'org_abc123', currentOrganizationName: 'acme' });

      expect(await screen.findByRole('button', { name: 'trigger_label' })).toHaveTextContent(
        'Acme Corp.',
      );
    });

    it('shows it when the current organization is not in the loaded list', async () => {
      renderSwitcher({ currentOrganizationId: 'org_other', currentOrganizationName: 'zeta-org' });

      expect(await screen.findByRole('button', { name: 'trigger_label' })).toHaveTextContent(
        'zeta-org',
      );
    });

    it('shows the placeholder instead of a blank trigger when the name is empty', async () => {
      renderSwitcher({ currentOrganizationId: 'org_other', currentOrganizationName: '' });

      expect(await findTrigger()).toHaveTextContent('trigger_placeholder');
    });

    it('shows it when loading the list fails', async () => {
      const user = userEvent.setup();
      listOrganizations.mockRejectedValueOnce(new Error('Network error'));
      renderSwitcher({ currentOrganizationId: 'org_abc123', currentOrganizationName: 'acme' });

      // The trigger appears once loading has failed, and still names the current organization.
      expect(await screen.findByRole('button', { name: 'trigger_label' })).toHaveTextContent(
        'acme',
      );

      await openMenu(user);

      expect(await screen.findByText('error_message')).toBeInTheDocument();
    });
  });

  describe('when the user selects another organization', () => {
    it('calls onSwitchOrganization with that organization', async () => {
      const user = userEvent.setup();
      renderSwitcher({ currentOrganizationId: 'org_abc123' });

      await openMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Fabrikam Inc.' }));

      expect(onSwitchOrganization).toHaveBeenCalledWith(organizations[1]);
    });
  });

  describe('when the user selects the current organization', () => {
    it('does not switch', async () => {
      const user = userEvent.setup();
      renderSwitcher({ currentOrganizationId: 'org_abc123' });

      await openMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Acme Corp.' }));

      expect(onSwitchOrganization).not.toHaveBeenCalled();
    });
  });

  describe('when the user belongs to one organization or none', () => {
    it.each<[string, UserOrganization[]]>([
      ['one', [createMockUserOrganization()]],
      ['none', []],
    ])('renders nothing with %s organization and no create item', async (_label, page) => {
      listOrganizations.mockResolvedValue(createMockUserOrganizationsPage(page));

      renderSwitcher();

      await waitFor(() => expect(listOrganizations).toHaveBeenCalled());
      await waitFor(() =>
        expect(
          screen.queryByRole('button', { name: /^trigger_(label|placeholder)$/ }),
        ).not.toBeInTheDocument(),
      );
    });

    it('still renders when the single loaded organization has a next page', async () => {
      listOrganizations.mockResolvedValue(
        createMockUserOrganizationsPage([createMockUserOrganization()], 'next_token'),
      );

      renderSwitcher();

      expect(await findTrigger()).toBeInTheDocument();
    });

    it('still renders with one organization when there is a create item', async () => {
      const user = userEvent.setup();
      listOrganizations.mockResolvedValue(
        createMockUserOrganizationsPage([createMockUserOrganization()]),
      );

      renderSwitcher({ onCreateOrganization: vi.fn() });
      await openMenu(user);

      expect(screen.getByRole('menuitem', { name: 'Acme Corp.' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'create_button_text' })).toBeInTheDocument();
    });

    it('shows only the create item when there are no organizations', async () => {
      const user = userEvent.setup();
      listOrganizations.mockResolvedValue(createMockUserOrganizationsPage([]));

      renderSwitcher({ onCreateOrganization: vi.fn() });
      await openMenu(user);

      expect(screen.getByRole('menuitem', { name: 'create_button_text' })).toBeInTheDocument();
      expect(screen.getAllByRole('menuitem')).toHaveLength(1);
      expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });
  });

  describe('when there are more organizations', () => {
    it('appends the next page on load more', async () => {
      const user = userEvent.setup();
      listOrganizations
        .mockResolvedValueOnce(createMockUserOrganizationsPage(organizations, 'next_token'))
        .mockResolvedValueOnce(
          createMockUserOrganizationsPage([
            createMockUserOrganization({ id: 'org_xyz', name: 'initech', display_name: 'Initech' }),
          ]),
        );
      renderSwitcher();

      await openMenu(user);
      await user.click(await screen.findByRole('menuitem', { name: 'load_more_button_text' }));

      expect(await screen.findByRole('menuitem', { name: 'Initech' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Acme Corp.' })).toBeInTheDocument();
      expect(listOrganizations).toHaveBeenLastCalledWith(
        expect.objectContaining({ from: 'next_token' }),
      );
      expect(
        screen.queryByRole('menuitem', { name: 'load_more_button_text' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('when onCreateOrganization is provided', () => {
    it('shows the create item and calls the callback', async () => {
      const user = userEvent.setup();
      const onCreateOrganization = vi.fn();
      renderSwitcher({ onCreateOrganization });

      await openMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'create_button_text' }));

      expect(onCreateOrganization).toHaveBeenCalledTimes(1);
      // The menu event must not leak into the host's callback.
      expect(onCreateOrganization).toHaveBeenCalledWith();
    });
  });

  describe('when onCreateOrganization is not provided', () => {
    it('hides the create item', async () => {
      const user = userEvent.setup();
      renderSwitcher();

      await openMenu(user);

      expect(
        screen.queryByRole('menuitem', { name: 'create_button_text' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('when loading fails', () => {
    it('shows the error and retries', async () => {
      const user = userEvent.setup();
      listOrganizations.mockRejectedValueOnce(new Error('Network error'));
      renderSwitcher();

      await openMenu(user);
      expect(await screen.findByText('error_message')).toBeInTheDocument();

      await user.click(screen.getByRole('menuitem', { name: 'retry_button_text' }));

      expect(await screen.findByRole('menuitem', { name: 'Acme Corp.' })).toBeInTheDocument();
    });

    it('keeps the switcher and the error on screen while the retry is in flight', async () => {
      const user = userEvent.setup();
      let resolveRetry: (
        page: ReturnType<typeof createMockUserOrganizationsPage>,
      ) => void = () => {};
      listOrganizations.mockRejectedValueOnce(new Error('Network error'));
      listOrganizations.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveRetry = resolve;
        }),
      );
      renderSwitcher();

      await openMenu(user);
      await user.click(await screen.findByRole('menuitem', { name: 'retry_button_text' }));

      // The retry request is still pending: the control and its menu stay, with a disabled retry item.
      await waitFor(() =>
        expect(screen.getByRole('menuitem', { name: /retry_button_text/ })).toHaveAttribute(
          'data-disabled',
        ),
      );
      expect(screen.getByText('error_message')).toBeInTheDocument();
      expect(screen.getByRole('menu')).toBeInTheDocument();

      resolveRetry(createMockUserOrganizationsPage(organizations));

      expect(await screen.findByRole('menuitem', { name: 'Acme Corp.' })).toBeInTheDocument();
      expect(screen.queryByText('error_message')).not.toBeInTheDocument();
    });
  });

  describe('when an organization name is truncated', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('shows the full name in a tooltip on hover', async () => {
      const user = userEvent.setup();
      vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(300);
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
      renderSwitcher();

      await openMenu(user);
      await user.hover(screen.getByText('Fabrikam Inc.'));

      expect(await screen.findByRole('tooltip')).toHaveTextContent('Fabrikam Inc.');
    });

    it('shows no tooltip when the name fits', async () => {
      const user = userEvent.setup();
      vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(100);
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
      renderSwitcher();

      await openMenu(user);
      await user.hover(screen.getByText('Fabrikam Inc.'));

      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('when readOnly is true', () => {
    it('disables the trigger', async () => {
      renderSwitcher({ readOnly: true });

      expect(await findTrigger()).toBeDisabled();
    });
  });
});
