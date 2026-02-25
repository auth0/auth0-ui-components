/**
 * Organization member tab component.
 * @module organization-member-tab
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import {
  OrganizationMemberTable,
  OrganizationMemberRemoveModal,
} from '@/components/auth0/my-organization/shared/member-management';
import { useOrganizationMemberTable } from '@/hooks/my-organization/use-organization-member-table';
import { useOrganizationMemberTableLogic } from '@/hooks/my-organization/use-organization-member-table-logic';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationMemberTabProps } from '@/types';

/**
 * Tab component for managing organization members.
 * @param root0 - The component props.
 * @param root0.removeAction - Action configuration for removing members.
 * @param root0.customMessages - Custom translation messages.
 * @param root0.styling - Custom styling configuration.
 * @param root0.readOnly - Whether the component is read-only.
 * @returns The tab component.
 */
export function OrganizationMemberTab({
  removeAction,
  customMessages = {},
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  readOnly = false,
}: OrganizationMemberTabProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const { isDarkMode } = useTheme();

  const memberTableState = useOrganizationMemberTable({
    removeAction,
    customMessages,
  });

  const memberTableHandlers = useOrganizationMemberTableLogic({
    t,
    onRemoveMember: memberTableState.onRemoveMember,
    fetchMembers: memberTableState.fetchMembers,
  });

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <div
      style={currentStyles.variables}
      className={currentStyles.classes?.['OrganizationMemberTab-root']}
    >
      <OrganizationMemberTable
        members={memberTableState.members}
        loading={memberTableState.isFetching}
        customMessages={customMessages}
        onRemove={readOnly ? undefined : memberTableHandlers.handleRemoveClick}
        className={currentStyles.classes?.['OrganizationMemberTab-table']}
      />

      <OrganizationMemberRemoveModal
        member={memberTableHandlers.selectedMember}
        isOpen={memberTableHandlers.showRemoveModal}
        isLoading={memberTableState.isRemoving}
        customMessages={customMessages}
        onClose={() => memberTableHandlers.setShowRemoveModal(false)}
        onRemove={memberTableHandlers.handleRemove}
        className={currentStyles.classes?.['OrganizationMemberTab-removeModal']}
      />
    </div>
  );
}
