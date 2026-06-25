import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OrganizationMemberManagement,
  OrganizationMemberManagementView,
} from '@/components/auth0/my-organization/organization-member-management';
import { useOrganizationMemberManagement } from '@/hooks/my-organization/use-organization-member-management';
import { createMockPendingInvitation } from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import {
  createMockMember,
  createMockRoleOptions,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type {
  OrganizationMemberManagementProps,
  OrganizationMemberManagementViewProps,
  UseOrganizationMemberManagementResult,
} from '@/types/my-organization/member-management/organization-member-management-types';

vi.mock('@/hooks/my-organization/use-organization-member-management', () => ({
  useOrganizationMemberManagement: vi.fn(),
}));

vi.mock('@/hooks/shared/use-theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

vi.mock('@/components/auth0/shared/header', () => ({
  Header: ({ title, description, actions = [] }: any) => (
    <div data-testid="header">
      <div>{title}</div>
      <div>{description}</div>
      {actions.map((action: any) => (
        <button key={action.label} onClick={action.onClick} disabled={action.disabled}>
          {action.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/auth0/shared/styled-scope', () => ({
  StyledScope: ({ children }: any) => <div data-testid="styled-scope">{children}</div>,
}));

vi.mock(
  '@/components/auth0/my-organization/shared/member-management/members/members-table/organization-member-table',
  () => ({
    OrganizationMemberTable: ({
      members,
      onAssignRole,
      onRemoveFromOrganization,
      className,
    }: any) => (
      <div data-testid="member-table" className={className}>
        <span>members:{members.length}</span>
        <button onClick={() => onAssignRole?.(members[0])}>assign-role</button>
        <button onClick={() => onRemoveFromOrganization?.(members[0])}>remove-from-org</button>
      </div>
    ),
  }),
);

vi.mock(
  '@/components/auth0/my-organization/shared/member-management/invitations/invitation-table/organization-invitation-table',
  () => ({
    OrganizationInvitationTable: ({
      invitations,
      onView,
      onCopyUrl,
      onRevoke,
      onRevokeAndResend,
      className,
    }: any) => (
      <div data-testid="invitation-table" className={className}>
        <span>invitations:{invitations.length}</span>
        <button onClick={() => onView?.(invitations[0])}>view-invitation</button>
        <button onClick={() => onCopyUrl?.(invitations[0])}>copy-url</button>
        <button onClick={() => onRevoke?.(invitations[0])}>revoke</button>
        <button onClick={() => onRevokeAndResend?.(invitations[0])}>revoke-resend</button>
      </div>
    ),
  }),
);

vi.mock(
  '@/components/auth0/my-organization/shared/member-management/shared/invitation-create/organization-invitation-create-modal',
  () => ({
    OrganizationInvitationCreateModal: ({ isOpen, onCreate, onClose }: any) => (
      <div data-testid="create-modal">
        open:{String(isOpen)}
        <button onClick={() => onCreate?.({ invitees: [{ email: 'x@example.com' }] })}>
          submit-create
        </button>
        <button onClick={onClose}>close-create</button>
      </div>
    ),
  }),
);

vi.mock(
  '@/components/auth0/my-organization/shared/member-management/invitations/invitation-details/organization-invitation-details-modal',
  () => ({
    OrganizationInvitationDetailsModal: ({
      isOpen,
      onClose,
      onCopyUrl,
      onRevoke,
      onResend,
    }: any) => (
      <div data-testid="details-modal">
        open:{String(isOpen)}
        <button onClick={onClose}>close-details</button>
        <button onClick={() => onCopyUrl?.({ id: 'inv_1' })}>details-copy</button>
        <button onClick={() => onRevoke?.({ id: 'inv_1' })}>details-revoke</button>
        <button onClick={() => onResend?.({ id: 'inv_1' })}>details-resend</button>
      </div>
    ),
  }),
);

vi.mock(
  '@/components/auth0/my-organization/shared/member-management/invitations/invitation-revoke/organization-invitation-revoke-modal',
  () => ({
    OrganizationInvitationRevokeModal: ({ isOpen, isRevokeAndResend, onConfirm, onClose }: any) => (
      <div data-testid={isRevokeAndResend ? 'revoke-resend-modal' : 'revoke-modal'}>
        open:{String(isOpen)}
        <button onClick={onConfirm}>
          {isRevokeAndResend ? 'confirm-revoke-resend' : 'confirm-revoke'}
        </button>
        <button onClick={onClose}>
          {isRevokeAndResend ? 'close-revoke-resend' : 'close-revoke'}
        </button>
      </div>
    ),
  }),
);

vi.mock(
  '@/components/auth0/my-organization/shared/member-management/members/organization-member-roles/organization-member-assign-roles-modal',
  () => ({
    OrganizationMemberAssignRolesModal: ({
      isOpen,
      selectedMember,
      assignedRoles,
      availableRoles,
      isLoading,
      onAssign,
      onClose,
      className,
    }: any) => (
      <div data-testid="assign-role-modal" className={className}>
        <span>open:{String(isOpen)}</span>
        <span>member:{selectedMember?.user_id ?? 'none'}</span>
        <span>assigned:{assignedRoles.length}</span>
        <span>available:{availableRoles.length}</span>
        <span>loading:{String(isLoading)}</span>
        <button onClick={() => onAssign?.(['role_admin'], selectedMember?.user_id ?? null)}>
          confirm-assign-role
        </button>
        <button onClick={onClose}>close-assign-role</button>
      </div>
    ),
  }),
);

vi.mock(
  '@/components/auth0/my-organization/shared/member-management/members/member-danger-zone/member-remove-from-organization-modal',
  () => ({
    MemberRemoveFromOrganizationModal: ({
      isOpen,
      memberName,
      memberUserId,
      organizationName,
      isLoading,
      onConfirm,
      onClose,
      className,
    }: any) => (
      <div data-testid="remove-from-org-modal" className={className}>
        <span>open:{String(isOpen)}</span>
        <span>member:{memberUserId ?? 'none'}</span>
        <span>memberName:{memberName ?? 'none'}</span>
        <span>organizationName:{organizationName ?? 'none'}</span>
        <span>loading:{String(isLoading)}</span>
        <button onClick={() => onConfirm?.(memberUserId)}>confirm-remove-from-org</button>
        <button onClick={onClose}>close-remove-from-org</button>
      </div>
    ),
  }),
);

vi.mock('@/components/auth0/shared/gate-keeper/gate-keeper', () => ({
  GateKeeper: ({ isLoading, children }: any) => (
    <div data-testid="gatekeeper" data-loading={String(isLoading)}>
      {children}
    </div>
  ),
}));

const mockedUseOrganizationMemberManagement = vi.mocked(useOrganizationMemberManagement);

const createMockMemberManagementResult = (
  overrides: Partial<UseOrganizationMemberManagementResult> = {},
): UseOrganizationMemberManagementResult => {
  const member = createMockMember();
  const invitation = createMockPendingInvitation();

  return {
    activeTab: 'members',
    availableRoles: createMockRoleOptions(),
    availableProviders: [],
    members: [member],
    invitations: [invitation],
    isFetchingInvitations: false,
    isInitialLoading: false,
    isFetchingMembers: false,
    isFetchingAvailableRoles: false,
    isCreatingInvitation: false,
    isRevokingInvitation: false,
    isResendingInvitation: false,
    invitationPagination: {
      pageSize: 10,
      currentPage: 1,
      totalItems: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    memberPagination: {
      pageSize: 10,
      currentPage: 1,
      totalItems: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    invitationFilters: {},
    invitationSortConfig: { key: null, direction: 'asc' },
    memberFilters: {},
    memberSortConfig: { key: null, direction: 'asc' },
    modalState: { type: null },
    isRemovingFromOrganization: false,
    isAssigningRoles: false,
    setActiveTab: vi.fn(),
    openModal: vi.fn(),
    closeModal: vi.fn(),
    handleCreateSubmit: vi.fn(),
    handleRevokeConfirm: vi.fn(),
    handleRevokeResendConfirm: vi.fn(),
    handleCopyUrl: vi.fn(),
    handleNextPage: vi.fn(),
    handlePreviousPage: vi.fn(),
    handlePageSizeChange: vi.fn(),
    handleSortChange: vi.fn(),
    handleRoleFilterChange: vi.fn(),
    handleViewMemberDetails: vi.fn(),
    handleAssignRolesSubmit: vi.fn(),
    handleRemoveFromOrganizationConfirm: vi.fn(),
    ...overrides,
  };
};

const createMockViewProps = (
  overrides: Partial<OrganizationMemberManagementViewProps> = {},
): OrganizationMemberManagementViewProps => ({
  ...createMockMemberManagementResult(),
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages: {},
  hideHeader: false,
  readOnly: false,
  ...overrides,
});

const createMockComponentProps = (
  overrides: Partial<OrganizationMemberManagementProps> = {},
): OrganizationMemberManagementProps => ({
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages: {},
  hideHeader: false,
  readOnly: false,
  ...overrides,
});

describe('OrganizationMemberManagementView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header and invite action when not read-only', () => {
    renderWithProviders(<OrganizationMemberManagementView {...createMockViewProps()} />);

    expect(screen.getByText('header.title')).toBeInTheDocument();
    expect(screen.getByText('header.description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'invite_button' })).toBeInTheDocument();
  });

  it('does not render the header when hideHeader is true', () => {
    renderWithProviders(
      <OrganizationMemberManagementView {...createMockViewProps({ hideHeader: true })} />,
    );

    expect(screen.queryByText('header.title')).not.toBeInTheDocument();
  });

  it('does not render invite action when readOnly is true', () => {
    renderWithProviders(
      <OrganizationMemberManagementView {...createMockViewProps({ readOnly: true })} />,
    );

    expect(screen.queryByRole('button', { name: 'invite_button' })).not.toBeInTheDocument();
  });

  it('opens the create invitation modal when invite button is clicked', async () => {
    const user = userEvent.setup();
    const openModal = vi.fn();

    renderWithProviders(
      <OrganizationMemberManagementView {...createMockViewProps({ openModal })} />,
    );

    await user.click(screen.getByRole('button', { name: 'invite_button' }));

    expect(openModal).toHaveBeenCalledWith({ type: 'create' });
  });

  it('opens member assign and remove modals from the member table callbacks', async () => {
    const user = userEvent.setup();
    const member = createMockMember();
    const openModal = vi.fn();

    renderWithProviders(
      <OrganizationMemberManagementView
        {...createMockViewProps({ members: [member], openModal })}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'assign-role' }));
    await user.click(screen.getByRole('button', { name: 'remove-from-org' }));

    expect(openModal).toHaveBeenNthCalledWith(1, { type: 'assignRole', member });
    expect(openModal).toHaveBeenNthCalledWith(2, { type: 'removeFromOrganization', member });
  });

  it('renders invitation tab content and opens invitation modals from callbacks', async () => {
    const user = userEvent.setup();
    const invitation = createMockPendingInvitation();
    const openModal = vi.fn();
    const setActiveTab = vi.fn();

    renderWithProviders(
      <OrganizationMemberManagementView
        {...createMockViewProps({
          activeTab: 'invitations',
          invitations: [invitation],
          openModal,
          setActiveTab,
        })}
      />,
    );

    expect(screen.getByTestId('invitation-table')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'tabs.members' }));
    expect(setActiveTab).toHaveBeenCalledWith('members');

    await user.click(screen.getByRole('button', { name: 'view-invitation' }));
    await user.click(screen.getByRole('button', { name: 'revoke' }));
    await user.click(screen.getByRole('button', { name: 'revoke-resend' }));

    expect(openModal).toHaveBeenCalledWith({ type: 'details', invitation });
    expect(openModal).toHaveBeenCalledWith({ type: 'revoke', invitation });
    expect(openModal).toHaveBeenCalledWith({ type: 'revokeResend', invitation });
  });

  it('omits destructive invitation callbacks in read-only mode', async () => {
    const user = userEvent.setup();
    const openModal = vi.fn();

    renderWithProviders(
      <OrganizationMemberManagementView
        {...createMockViewProps({ activeTab: 'invitations', readOnly: true, openModal })}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'revoke' }));
    await user.click(screen.getByRole('button', { name: 'revoke-resend' }));

    expect(openModal).not.toHaveBeenCalled();
  });

  describe('assign role modal', () => {
    it('is closed by default with no selected member', () => {
      renderWithProviders(<OrganizationMemberManagementView {...createMockViewProps()} />);

      const modal = screen.getByTestId('assign-role-modal');
      expect(modal).toHaveTextContent('open:false');
      expect(modal).toHaveTextContent('member:none');
      expect(modal).toHaveTextContent('assigned:0');
    });

    it('opens with the selected member and their assigned roles when modalState is assignRole', () => {
      const member = createMockMember();
      renderWithProviders(
        <OrganizationMemberManagementView
          {...createMockViewProps({
            modalState: { type: 'assignRole', member },
          })}
        />,
      );

      const modal = screen.getByTestId('assign-role-modal');
      expect(modal).toHaveTextContent('open:true');
      expect(modal).toHaveTextContent(`member:${member.user_id}`);
      expect(modal).toHaveTextContent(`assigned:${(member.roles ?? []).length}`);
    });

    it('reflects loading state when either fetching roles or assigning', () => {
      const { unmount } = renderWithProviders(
        <OrganizationMemberManagementView
          {...createMockViewProps({ isFetchingAvailableRoles: true })}
        />,
      );
      expect(screen.getByTestId('assign-role-modal')).toHaveTextContent('loading:true');
      unmount();

      renderWithProviders(
        <OrganizationMemberManagementView {...createMockViewProps({ isAssigningRoles: true })} />,
      );
      expect(screen.getByTestId('assign-role-modal')).toHaveTextContent('loading:true');
    });

    it('invokes handleAssignRolesSubmit on confirm and closeModal on close', async () => {
      const user = userEvent.setup();
      const member = createMockMember();
      const handleAssignRolesSubmit = vi.fn();
      const closeModal = vi.fn();

      renderWithProviders(
        <OrganizationMemberManagementView
          {...createMockViewProps({
            modalState: { type: 'assignRole', member },
            handleAssignRolesSubmit,
            closeModal,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'confirm-assign-role' }));
      expect(handleAssignRolesSubmit).toHaveBeenCalledWith(['role_admin'], member.user_id);

      await user.click(screen.getByRole('button', { name: 'close-assign-role' }));
      expect(closeModal).toHaveBeenCalled();
    });
  });

  describe('remove from org modal', () => {
    it('is closed by default with no selected member', () => {
      renderWithProviders(<OrganizationMemberManagementView {...createMockViewProps()} />);

      const modal = screen.getByTestId('remove-from-org-modal');
      expect(modal).toHaveTextContent('open:false');
      expect(modal).toHaveTextContent('member:none');
    });

    it('opens with the selected member info when modalState is removeFromOrganization', () => {
      const member = createMockMember();
      renderWithProviders(
        <OrganizationMemberManagementView
          {...createMockViewProps({
            organizationDisplayName: 'Acme Inc',
            modalState: { type: 'removeFromOrganization', member },
          })}
        />,
      );

      const modal = screen.getByTestId('remove-from-org-modal');
      expect(modal).toHaveTextContent('open:true');
      expect(modal).toHaveTextContent(`member:${member.user_id}`);
      expect(modal).toHaveTextContent(`memberName:${member.name}`);
      expect(modal).toHaveTextContent('organizationName:Acme Inc');
    });

    it('reflects loading state when isRemovingFromOrganization is true', () => {
      renderWithProviders(
        <OrganizationMemberManagementView
          {...createMockViewProps({ isRemovingFromOrganization: true })}
        />,
      );
      expect(screen.getByTestId('remove-from-org-modal')).toHaveTextContent('loading:true');
    });

    it('invokes handleRemoveFromOrganizationConfirm with userId on confirm and closeModal on close', async () => {
      const user = userEvent.setup();
      const member = createMockMember();
      const handleRemoveFromOrganizationConfirm = vi.fn();
      const closeModal = vi.fn();

      renderWithProviders(
        <OrganizationMemberManagementView
          {...createMockViewProps({
            modalState: { type: 'removeFromOrganization', member },
            handleRemoveFromOrganizationConfirm,
            closeModal,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'confirm-remove-from-org' }));
      expect(handleRemoveFromOrganizationConfirm).toHaveBeenCalledWith(member.user_id);

      await user.click(screen.getByRole('button', { name: 'close-remove-from-org' }));
      expect(closeModal).toHaveBeenCalled();
    });
  });
});

describe('OrganizationMemberManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the hook with component props and passes loading state to GateKeeper', () => {
    mockedUseOrganizationMemberManagement.mockReturnValue(
      createMockMemberManagementResult({ isInitialLoading: true }),
    );

    renderWithProviders(
      <OrganizationMemberManagement
        {...createMockComponentProps({ readOnly: true, hideHeader: true })}
      />,
    );

    expect(mockedUseOrganizationMemberManagement).toHaveBeenCalledWith(
      expect.objectContaining({
        customMessages: {},
        readOnly: true,
        createInvitationAction: undefined,
        revokeInvitationAction: undefined,
        resendInvitationAction: undefined,
        viewMemberDetailsAction: undefined,
        assignRolesAction: undefined,
        removeFromOrganizationAction: undefined,
      }),
    );

    expect(screen.getByTestId('gatekeeper')).toHaveAttribute('data-loading', 'true');
  });

  it('renders the view content through the container with default props', () => {
    mockedUseOrganizationMemberManagement.mockReturnValue(createMockMemberManagementResult());

    renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

    expect(screen.getByText('header.title')).toBeInTheDocument();
    expect(screen.getByTestId('member-table')).toBeInTheDocument();
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });
});
