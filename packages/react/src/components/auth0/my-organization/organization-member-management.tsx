/**
 * Organization member management component.
 * @module organization-member-management
 */

import {
  getComponentStyles,
  type MemberInvitation,
  type OrgMember,
} from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { GateKeeper } from '../shared/gate-keeper/gate-keeper';

import { OrganizationInvitationDetailsModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-details/organization-invitation-details-modal';
import { OrganizationInvitationBulkRevokeModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-revoke/organization-invitation-bulk-revoke-modal';
import { OrganizationInvitationRevokeModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-revoke/organization-invitation-revoke-modal';
import { OrganizationInvitationTable } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-table/organization-invitation-table';
import { MemberRemoveFromOrganizationModal } from '@/components/auth0/my-organization/shared/member-management/members/member-danger-zone/member-remove-from-organization-modal';
import { OrganizationMemberTable } from '@/components/auth0/my-organization/shared/member-management/members/members-table/organization-member-table';
import { OrganizationMemberAssignRolesModal } from '@/components/auth0/my-organization/shared/member-management/members/organization-member-roles/organization-member-assign-roles-modal';
import { OrganizationInvitationCreateModal } from '@/components/auth0/my-organization/shared/member-management/shared/invitation-create/organization-invitation-create-modal';
import { Header } from '@/components/auth0/shared/header';
import { RefreshIndicator } from '@/components/auth0/shared/refresh-indicator';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganizationMemberManagement } from '@/hooks/my-organization/use-organization-member-management';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/lib/constants/shared/constants';
import { cn } from '@/lib/utils';
import type {
  OrganizationMemberManagementProps,
  OrganizationMemberManagementViewProps,
} from '@/types/my-organization/member-management/organization-member-management-types';

/**
 * View component for organization member management.
 * @param props - The component props.
 * @returns The component.
 */
export function OrganizationMemberManagementView(props: OrganizationMemberManagementViewProps) {
  const {
    styling,
    customMessages,
    hideHeader,
    readOnly,
    activeTab,
    members,
    invitations,
    organizationDisplayName,
    isFetchingInvitations,
    isLoadingInvitations,
    isFetchingMembers,
    isMembersStale,
    isInvitationsStale,
    isCreatingInvitation,
    isRevokingInvitation,
    isResendingInvitation,
    selectedInvitations,
    invitationPagination,
    memberPagination,
    invitationSortConfig,
    memberSortConfig,
    isAssigningRoles,
    isRemovingFromOrganization,
    availableRoles,
    searchedRoles,
    onRoleSearch,
    availableProviders,
    modalState,
    membersUpdatedAt,
    invitationsUpdatedAt,
    refetchMembers,
    refetchInvitations,
    setActiveTab,
    openModal,
    closeModal,
    onSelectedInvitationsChange,
    handleCreateSubmit,
    handleRevokeConfirm,
    handleRevokeResendConfirm,
    handleBulkRevokeClick,
    handleCopyUrl,
    handleSortChange,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
    handleRoleFilterChange,
    handleViewMemberDetails,
    handleAssignRolesSubmit,
    handleRemoveFromOrganizationConfirm,
  } = props;

  const selectedInvitation =
    modalState.type === 'details' ||
    modalState.type === 'revoke' ||
    modalState.type === 'revokeResend'
      ? modalState.invitation
      : null;

  const selectedMember =
    modalState.type === 'removeFromOrganization' || modalState.type === 'assignRole'
      ? modalState.member
      : null;

  const invitationsToBulkRevoke = modalState.type === 'bulkRevoke' ? modalState.invitations : [];

  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management', customMessages);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleAssignRoleClick = React.useCallback(
    (member: OrgMember) => openModal({ type: 'assignRole', member }),
    [openModal],
  );

  const handleRemoveFromOrganizationClick = React.useCallback(
    (member: OrgMember) => openModal({ type: 'removeFromOrganization', member }),
    [openModal],
  );

  const handleViewInvitation = React.useCallback(
    (invitation: MemberInvitation) => openModal({ type: 'details', invitation }),
    [openModal],
  );

  const handleRevokeResendClick = React.useCallback(
    (invitation: MemberInvitation) => openModal({ type: 'revokeResend', invitation }),
    [openModal],
  );

  const handleRevokeClick = React.useCallback(
    (invitation: MemberInvitation) => openModal({ type: 'revoke', invitation }),
    [openModal],
  );

  const pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  const refreshState =
    activeTab === 'members'
      ? {
          isStale: isMembersStale,
          isFetching: isFetchingMembers,
          lastUpdatedAt: membersUpdatedAt || undefined,
          onRefresh: refetchMembers,
        }
      : {
          isStale: isInvitationsStale,
          isFetching: isFetchingInvitations,
          lastUpdatedAt: invitationsUpdatedAt || undefined,
          onRefresh: refetchInvitations,
        };

  return (
    <StyledScope style={currentStyles.variables}>
      <div className={currentStyles.classes?.['OrganizationMemberManagement-root']}>
        {!hideHeader && (
          <div className={currentStyles.classes?.['OrganizationMemberManagement-header']}>
            <Header
              title={t('header.title')}
              description={t('header.description')}
              actions={
                !readOnly
                  ? [
                      {
                        type: 'button',
                        label: t('invite_button'),
                        onClick: () => openModal({ type: 'create' }),
                        icon: Plus,
                        disabled: readOnly,
                      },
                    ]
                  : []
              }
            />
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(value: string) => setActiveTab(value as 'members' | 'invitations')}
          className={currentStyles.classes?.['OrganizationMemberManagement-tabs']}
        >
          <div
            className={cn(
              'flex justify-between mb-8',
              currentStyles.classes?.['OrganizationMemberManagement-tableActions'],
            )}
          >
            <TabsList>
              <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
              <TabsTrigger value="invitations">{t('tabs.invitations')}</TabsTrigger>
            </TabsList>
            <RefreshIndicator
              isStale={refreshState.isStale}
              isFetching={refreshState.isFetching}
              lastUpdatedAt={refreshState.lastUpdatedAt}
              onRefresh={refreshState.onRefresh}
            />
          </div>

          <TabsContent value="members">
            <OrganizationMemberTable
              members={members}
              loading={isFetchingMembers}
              customMessages={customMessages?.member}
              pagination={memberPagination}
              pageSizeOptions={pageSizeOptions}
              sortConfig={memberSortConfig}
              className={currentStyles.classes?.['OrganizationMemberTab-table']}
              onView={handleViewMemberDetails}
              onAssignRole={handleAssignRoleClick}
              onRemoveFromOrganization={handleRemoveFromOrganizationClick}
              onSortChange={handleSortChange}
              onNextPage={handleNextPage}
              onPreviousPage={handlePreviousPage}
              onPageSizeChange={handlePageSizeChange}
              onRoleFilterChange={handleRoleFilterChange}
            />
          </TabsContent>

          <TabsContent value="invitations">
            <OrganizationInvitationTable
              invitations={invitations}
              loading={isLoadingInvitations}
              customMessages={customMessages?.invitation}
              pagination={invitationPagination}
              pageSizeOptions={pageSizeOptions}
              readOnly={readOnly}
              selectedInvitations={selectedInvitations}
              sortConfig={invitationSortConfig}
              onSortChange={handleSortChange}
              onView={handleViewInvitation}
              onCopyUrl={handleCopyUrl}
              onRevokeAndResend={readOnly ? undefined : handleRevokeResendClick}
              onRevoke={readOnly ? undefined : handleRevokeClick}
              onSelectedInvitationsChange={readOnly ? undefined : onSelectedInvitationsChange}
              onBulkRevoke={readOnly ? undefined : handleBulkRevokeClick}
              onNextPage={handleNextPage}
              onPreviousPage={handlePreviousPage}
              onPageSizeChange={handlePageSizeChange}
              onRoleFilterChange={handleRoleFilterChange}
              className={currentStyles.classes?.['OrganizationInvitationTab-table']}
            />
          </TabsContent>
        </Tabs>

        <OrganizationInvitationCreateModal
          isOpen={modalState.type === 'create'}
          isLoading={isCreatingInvitation}
          customMessages={customMessages?.invitation}
          availableRoles={searchedRoles}
          availableProviders={availableProviders}
          style={currentStyles.variables}
          onClose={closeModal}
          onCreate={handleCreateSubmit}
          onRoleSearch={onRoleSearch}
          className={currentStyles.classes?.['OrganizationInvitationTab-createModal']}
        />

        <OrganizationInvitationDetailsModal
          invitation={selectedInvitation}
          isOpen={modalState.type === 'details'}
          isRevoking={isRevokingInvitation}
          isResending={isResendingInvitation}
          customMessages={customMessages?.invitation}
          availableRoles={availableRoles}
          availableProviders={availableProviders}
          readOnly={readOnly}
          style={currentStyles.variables}
          onClose={closeModal}
          onCopyUrl={handleCopyUrl}
          onRevoke={(invitation) => invitation && openModal({ type: 'revoke', invitation })}
          onResend={(invitation) => invitation && openModal({ type: 'revokeResend', invitation })}
          className={currentStyles.classes?.['OrganizationInvitationTab-detailsModal']}
        />

        <OrganizationInvitationRevokeModal
          invitation={selectedInvitation}
          isOpen={modalState.type === 'revoke'}
          isLoading={isRevokingInvitation}
          customMessages={customMessages?.invitation}
          style={currentStyles.variables}
          onClose={closeModal}
          onConfirm={handleRevokeConfirm}
          className={currentStyles.classes?.['OrganizationInvitationTab-revokeModal']}
        />

        <OrganizationInvitationRevokeModal
          invitation={selectedInvitation}
          isOpen={modalState.type === 'revokeResend'}
          isLoading={isResendingInvitation}
          isRevokeAndResend
          customMessages={customMessages?.invitation}
          style={currentStyles.variables}
          onClose={closeModal}
          onConfirm={handleRevokeResendConfirm}
          className={currentStyles.classes?.['OrganizationInvitationTab-revokeResendModal']}
        />

        <OrganizationInvitationBulkRevokeModal
          invitations={invitationsToBulkRevoke}
          isOpen={modalState.type === 'bulkRevoke'}
          isLoading={isRevokingInvitation}
          customMessages={customMessages?.invitation}
          style={currentStyles.variables}
          onClose={closeModal}
          onConfirm={handleRevokeConfirm}
          className={currentStyles.classes?.['OrganizationInvitationTab-bulkRevokeModal']}
        />

        <OrganizationMemberAssignRolesModal
          selectedMember={selectedMember}
          isOpen={modalState.type === 'assignRole'}
          isLoading={isAssigningRoles}
          availableRoles={searchedRoles}
          assignedRoles={selectedMember?.roles || []}
          customMessages={customMessages?.member}
          onClose={closeModal}
          onAssign={handleAssignRolesSubmit}
          onRoleSearch={onRoleSearch}
        />

        <MemberRemoveFromOrganizationModal
          memberName={selectedMember?.name}
          memberUserId={selectedMember?.user_id}
          isOpen={modalState.type === 'removeFromOrganization'}
          isLoading={isRemovingFromOrganization}
          organizationName={organizationDisplayName}
          customMessages={customMessages?.member}
          onClose={closeModal}
          onConfirm={handleRemoveFromOrganizationConfirm}
        />
      </div>
    </StyledScope>
  );
}

/**
 * Container component for organization member management.
 * @param props - The component props.
 * @returns The component.
 */
export function OrganizationMemberManagement(props: OrganizationMemberManagementProps) {
  const {
    hideHeader = false,
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    readOnly = false,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
    viewMemberDetailsAction,
    assignRolesAction,
    removeFromOrganizationAction,
  } = props;

  const memberManagement = useOrganizationMemberManagement({
    customMessages,
    readOnly,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
    viewMemberDetailsAction,
    assignRolesAction,
    removeFromOrganizationAction,
  });

  return (
    <GateKeeper isLoading={memberManagement.isInitialLoading} styling={styling}>
      <OrganizationMemberManagementView
        {...memberManagement}
        styling={styling}
        customMessages={customMessages}
        hideHeader={hideHeader}
        readOnly={readOnly}
      />
    </GateKeeper>
  );
}
