/**
 * Organization member management component.
 * @module organization-member-management
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { OrganizationInvitationTab } from '@/components/auth0/my-organization/shared/invitation-management';
import { OrganizationMemberTab } from '@/components/auth0/my-organization/shared/member-management';
import { Header } from '@/components/auth0/shared/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withMyOrganizationService } from '@/hoc/with-services';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  OrganizationMemberManagementProps,
  OrganizationMemberManagementViewProps,
} from '@/types';

// TODO: Import from @auth0/universal-components-core after building core package
const MY_ORGANIZATION_MEMBER_MANAGEMENT_SCOPES =
  'read:my_org:members delete:my_org:members read:my_org:invitations create:my_org:invitations delete:my_org:invitations';

/**
 * OrganizationMemberManagementContainer Component
 *
 * Manages organization members and invitations — view members, remove members,
 * create invitations, revoke invitations in a tabbed interface.
 * @param props - The component props.
 * @returns The container component.
 */
function OrganizationMemberManagementContainer(props: OrganizationMemberManagementProps) {
  const {
    hideHeader = false,
    defaultTab = 'member',
    memberProps = {},
    invitationProps = {},
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    readOnly = false,
  } = props;

  return (
    <OrganizationMemberManagementView
      logic={{
        hideHeader,
        defaultTab,
        memberProps,
        invitationProps,
        customMessages,
        styling,
        readOnly,
      }}
    />
  );
}

/**
 * OrganizationMemberManagementView — Presentational component
 * Renders the member management view with tabs.
 * @param root0 - The component props.
 * @param root0.logic - The logic props containing configuration and handlers.
 * @returns The view component.
 */
function OrganizationMemberManagementView({
  logic,
}: OrganizationMemberManagementViewProps): React.JSX.Element {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management', logic.customMessages);

  const {
    hideHeader = false,
    defaultTab = 'member',
    memberProps = {},
    invitationProps = {},
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    readOnly = false,
  } = logic;

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const [activeTab, setActiveTab] = React.useState(defaultTab);

  return (
    <div
      style={currentStyles.variables}
      className={currentStyles.classes?.['OrganizationMemberManagement-root']}
    >
      {!hideHeader && (
        <div className={currentStyles.classes?.['OrganizationMemberManagement-header']}>
          <Header
            title={t('header.title')}
            description={t('header.description')}
            actions={
              activeTab === 'invitation' && !readOnly
                ? [
                    {
                      type: 'button',
                      label: t('invitation.create.submit_button'),
                      onClick: () => {
                        // This will be handled by the invitation tab
                      },
                      icon: Plus,
                      disabled: invitationProps.createAction?.disabled || readOnly,
                    },
                  ]
                : []
            }
          />
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'member' | 'invitation')}
        className={currentStyles.classes?.['OrganizationMemberManagement-tabs']}
      >
        <TabsList>
          <TabsTrigger value="member">{t('tabs.members')}</TabsTrigger>
          <TabsTrigger value="invitation">{t('tabs.invitations')}</TabsTrigger>
        </TabsList>

        <TabsContent value="member">
          <OrganizationMemberTab
            {...memberProps}
            customMessages={customMessages?.member}
            styling={styling}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="invitation">
          <OrganizationInvitationTab
            {...invitationProps}
            customMessages={customMessages?.invitation}
            styling={styling}
            readOnly={readOnly}
            hideHeader
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * OrganizationMemberManagement — Public component
 * Wrapped with HOC for OAuth scope management.
 */
export const OrganizationMemberManagement: React.ComponentType<OrganizationMemberManagementProps> =
  withMyOrganizationService(
    OrganizationMemberManagementContainer,
    MY_ORGANIZATION_MEMBER_MANAGEMENT_SCOPES,
  );

export { OrganizationMemberManagementView };
