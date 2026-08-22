import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrganizationMemberEditDetailsTab } from '../organization-member-details-tab';

import { createMockMember } from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import {
  createMemberPermissions,
  ALL_MEMBER_PERMISSIONS,
  READ_ONLY_MEMBER_PERMISSIONS,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockToast } from '@/tests/utils/test-setup';

mockToast();

const createProps = (overrides = {}) => ({
  member: createMockMember(),
  customMessages: {},
  isRemovingFromOrganization: false,
  permissions: ALL_MEMBER_PERMISSIONS,
  onRemoveFromOrganizationClick: vi.fn(),
  ...overrides,
});

afterEach(() => vi.clearAllMocks());

describe('OrganizationMemberEditDetailsTab', () => {
  describe('rendering', () => {
    it('renders user details card when member is set', () => {
      renderWithProviders(<OrganizationMemberEditDetailsTab {...createProps()} />);
      expect(screen.getByText('member.detail.user_details.title')).toBeInTheDocument();
    });

    it('does not render user details card when member is null', () => {
      renderWithProviders(<OrganizationMemberEditDetailsTab {...createProps({ member: null })} />);
      expect(screen.queryByText('member.detail.user_details.title')).not.toBeInTheDocument();
    });

    it('does not render remove-from-org card when member is null', () => {
      renderWithProviders(<OrganizationMemberEditDetailsTab {...createProps({ member: null })} />);
      expect(
        screen.queryByText('member.detail.actions.remove_from_organization.title'),
      ).not.toBeInTheDocument();
    });

    it('renders the remove-from-org card title', () => {
      renderWithProviders(<OrganizationMemberEditDetailsTab {...createProps()} />);
      expect(
        screen.getByText('member.detail.actions.remove_from_organization.title'),
      ).toBeInTheDocument();
    });

    it('renders the remove-from-org card description', () => {
      renderWithProviders(<OrganizationMemberEditDetailsTab {...createProps()} />);
      expect(
        screen.getByText('member.detail.actions.remove_from_organization.description'),
      ).toBeInTheDocument();
    });

    it('renders the remove-from-org button', () => {
      renderWithProviders(<OrganizationMemberEditDetailsTab {...createProps()} />);
      expect(
        screen.getByRole('button', {
          name: /member.detail.actions.remove_from_organization.button/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('onRemoveFromOrganizationClick', () => {
    it('calls handler when remove button is clicked', async () => {
      const user = userEvent.setup();
      const onRemoveFromOrganizationClick = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditDetailsTab {...createProps({ onRemoveFromOrganizationClick })} />,
      );
      await user.click(
        screen.getByRole('button', {
          name: /member.detail.actions.remove_from_organization.button/i,
        }),
      );
      expect(onRemoveFromOrganizationClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('isRemovingFromOrganization', () => {
    it('remove button is disabled when true', () => {
      renderWithProviders(
        <OrganizationMemberEditDetailsTab {...createProps({ isRemovingFromOrganization: true })} />,
      );
      expect(
        screen.getByRole('button', {
          name: /member.detail.actions.remove_from_organization.button/i,
        }),
      ).toBeDisabled();
    });

    it('remove button is enabled when false', () => {
      renderWithProviders(
        <OrganizationMemberEditDetailsTab
          {...createProps({ isRemovingFromOrganization: false })}
        />,
      );
      expect(
        screen.getByRole('button', {
          name: /member.detail.actions.remove_from_organization.button/i,
        }),
      ).not.toBeDisabled();
    });
  });

  describe('customMessages', () => {
    it('overrides remove-from-org button text', () => {
      renderWithProviders(
        <OrganizationMemberEditDetailsTab
          {...createProps({
            customMessages: {
              member: {
                detail: { actions: { remove_from_organization: { button: 'Custom Button' } } },
              },
            },
          })}
        />,
      );
      expect(screen.getByText('Custom Button')).toBeInTheDocument();
    });

    it('overrides remove-from-org title text', () => {
      renderWithProviders(
        <OrganizationMemberEditDetailsTab
          {...createProps({
            customMessages: {
              member: {
                detail: { actions: { remove_from_organization: { title: 'Custom Title' } } },
              },
            },
          })}
        />,
      );
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  describe('granted permissions', () => {
    const removeButtonName = 'member.detail.actions.remove_from_organization.button';

    describe('when delete:my_org:memberships is granted', () => {
      it('enables the remove from organization button', () => {
        renderWithProviders(
          <OrganizationMemberEditDetailsTab
            {...createProps({
              permissions: createMemberPermissions(['delete:my_org:memberships']),
            })}
          />,
        );

        expect(screen.getByRole('button', { name: removeButtonName })).toBeEnabled();
      });
    });

    describe('when create is granted without delete:my_org:memberships', () => {
      it('keeps the destructive button visible but disabled', () => {
        renderWithProviders(
          <OrganizationMemberEditDetailsTab
            {...createProps({
              permissions: createMemberPermissions(['create:my_org:member_roles']),
            })}
          />,
        );

        expect(screen.getByRole('button', { name: removeButtonName })).toBeDisabled();
      });
    });

    describe('when only read permissions are granted', () => {
      it('keeps the destructive button visible but disabled', () => {
        renderWithProviders(
          <OrganizationMemberEditDetailsTab
            {...createProps({ permissions: READ_ONLY_MEMBER_PERMISSIONS })}
          />,
        );

        expect(screen.getByRole('button', { name: removeButtonName })).toBeDisabled();
      });
    });
  });

  describe('Access Level Gating', () => {
    it('disables remove button when member has readonly access_level', () => {
      const member = createMockMember({ access_level: 'readonly' });
      renderWithProviders(<OrganizationMemberEditDetailsTab {...createProps({ member })} />);
      expect(
        screen.getByRole('button', {
          name: /member.detail.actions.remove_from_organization.button/i,
        }),
      ).toBeDisabled();
    });

    it('disables remove button when member has none access_level', () => {
      const member = createMockMember({ access_level: 'none' });
      renderWithProviders(<OrganizationMemberEditDetailsTab {...createProps({ member })} />);
      expect(
        screen.getByRole('button', {
          name: /member.detail.actions.remove_from_organization.button/i,
        }),
      ).toBeDisabled();
    });

    it('enables remove button when member has limited access_level', () => {
      const member = createMockMember({ access_level: 'limited' });
      renderWithProviders(<OrganizationMemberEditDetailsTab {...createProps({ member })} />);
      expect(
        screen.getByRole('button', {
          name: /member.detail.actions.remove_from_organization.button/i,
        }),
      ).not.toBeDisabled();
    });

    it('enables remove button when member has full access_level', () => {
      const member = createMockMember({ access_level: 'full' });
      renderWithProviders(<OrganizationMemberEditDetailsTab {...createProps({ member })} />);
      expect(
        screen.getByRole('button', {
          name: /member.detail.actions.remove_from_organization.button/i,
        }),
      ).not.toBeDisabled();
    });
  });
});
