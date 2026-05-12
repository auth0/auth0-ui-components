/**
 * Organization member management component.
 * @module organization-member-management
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { GateKeeper } from '../shared/gate-keeper/gate-keeper';

import { OrganizationInvitationDetailsModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-details/organization-invitation-details-modal';
import { OrganizationInvitationRevokeModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-revoke/organization-invitation-revoke-modal';
import { OrganizationInvitationTable } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-table/organization-invitation-table';
import { OrganizationInvitationCreateModal } from '@/components/auth0/my-organization/shared/member-management/shared/invitation-create/organization-invitation-create-modal';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganizationMemberManagement } from '@/hooks/my-organization/use-organization-member-management';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
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
    invitations,
    isFetchingInvitations,
    isCreatingInvitation,
    isRevokingInvitation,
    isResendingInvitation,
    invitationPagination,
    invitationSortConfig,
    availableRoles,
    availableProviders,
    modalState,
    setActiveTab,
    openModal,
    closeModal,
    handleCreateSubmit,
    handleRevokeConfirm,
    handleRevokeResendConfirm,
    handleCopyUrl,
    handleSortChange,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
    handleRoleFilterChange,
  } = props;

  const selectedInvitation =
    modalState.type === 'details' ||
    modalState.type === 'revoke' ||
    modalState.type === 'revokeResend'
      ? modalState.invitation
      : null;

  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management', customMessages);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

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
          <TabsList>
            <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
            <TabsTrigger value="invitations">{t('tabs.invitations')}</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            {/* <OrganizationMemberTable
            /> */}
          </TabsContent>

          <TabsContent value="invitations">
            <OrganizationInvitationTable
              invitations={invitations}
              loading={isFetchingInvitations}
              customMessages={customMessages?.invitation}
              pagination={invitationPagination}
              readOnly={readOnly}
              sortConfig={invitationSortConfig}
              onSortChange={handleSortChange}
              onView={(invitation) => openModal({ type: 'details', invitation })}
              onCopyUrl={handleCopyUrl}
              onRevokeAndResend={
                readOnly
                  ? undefined
                  : (invitation) => openModal({ type: 'revokeResend', invitation })
              }
              onRevoke={
                readOnly ? undefined : (invitation) => openModal({ type: 'revoke', invitation })
              }
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
          availableRoles={availableRoles}
          availableProviders={availableProviders}
          onClose={closeModal}
          onCreate={handleCreateSubmit}
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
          onClose={closeModal}
          onConfirm={handleRevokeResendConfirm}
          className={currentStyles.classes?.['OrganizationInvitationTab-revokeResendModal']}
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
  } = props;

  const memberManagement = useOrganizationMemberManagement({
    customMessages,
    readOnly,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
  });

  return (
    <GateKeeper isLoading={memberManagement.isFetchingInvitations} styling={styling}>
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
