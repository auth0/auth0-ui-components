/**
 * Organization member edit roles tab.
 * @module organization-member-roles-tab
 */

import type { Role } from '@auth0/universal-components-core';
import { Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { OrganizationMemberAssignRolesModal } from '@/components/auth0/my-organization/shared/member-management/members/organization-member-roles/organization-member-assign-roles-modal';
import { OrganizationMemberRemoveRoleModal } from '@/components/auth0/my-organization/shared/member-management/members/organization-member-roles/organization-member-remove-role-modal';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  OrganizationMemberEditRolesTabProps,
  OrganizationMemberEditRolesTableProps,
  RolesTabHeaderProps,
} from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Renders the header section of the roles tab with conditional action buttons.
 * @param props - Component props
 * @param props.selectedRoles - The currently selected roles
 * @param props.customMessages - Optional custom message overrides
 * @param props.onAssignRolesClick - Handler for the assign roles button click
 * @param props.onRemoveSelectedRoles - Handler for removing all selected roles
 * @returns The rendered roles tab header element
 */
function RolesTabHeader({
  selectedRoles,
  organizationName,
  customMessages,
  onAssignRolesClick,
  onRemoveSelectedRoles,
}: RolesTabHeaderProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-primary">{t('member.detail.roles.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('member.detail.roles.description', { organizationName })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {selectedRoles.length > 0 ? (
          <>
            <span className="text-sm text-muted-foreground shrink-0">
              {t(
                selectedRoles.length === 1
                  ? 'member.detail.roles.roles_selected'
                  : 'member.detail.roles.roles_selected_plural',
                { count: selectedRoles.length },
              )}
            </span>
            <Button variant="destructive" size="sm" onClick={onRemoveSelectedRoles}>
              {t(
                selectedRoles.length === 1
                  ? 'member.detail.roles.remove_button'
                  : 'member.detail.roles.remove_button_plural',
              )}
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={onAssignRolesClick} className="shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            {t('member.detail.roles.assign_button')}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Renders the roles data table for the member detail roles tab.
 * @param props - Component props
 * @param props.memberRoles - The list of roles assigned to the member
 * @param props.isLoading - Whether the roles data is loading
 * @param props.removingRoleIds - IDs of roles currently being removed
 * @param props.selectedRoles - The currently selected roles
 * @param props.customMessages - Optional custom message overrides
 * @param props.onRemoveRoles - Handler called when role removal is requested
 * @param props.onSelectedRolesChange - Handler called when row selection changes
 * @returns The rendered roles table element
 */
function OrganizationMemberEditRolesTable({
  memberRoles,
  isLoading = false,
  removingRoleIds = [],
  selectedRoles,
  customMessages,
  onRemoveRoles,
  onSelectedRolesChange,
}: OrganizationMemberEditRolesTableProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const columns: Column<Role>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('member.detail.roles.table.name'),
        enableSorting: true,
        render: (role) => <span className="font-medium text-primary">{role.name}</span>,
      },
      {
        type: 'text',
        accessorKey: 'description',
        title: t('member.detail.roles.table.description'),
        enableSorting: true,
        render: (role) => <span className="text-primary">{role.description ?? '—'}</span>,
      },
      {
        type: 'actions',
        title: '',
        enableSorting: false,
        render: (role) => (
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              disabled={removingRoleIds.includes(role.id)}
              onClick={() => onRemoveRoles([role])}
              aria-label={t('member.detail.roles.table.remove_button_label', {
                roleName: role.name,
              })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [t, removingRoleIds, onRemoveRoles],
  );

  return (
    <DataTable
      columns={columns}
      data={memberRoles}
      loading={isLoading}
      emptyState={{ title: t('member.detail.roles.table.empty_message') }}
      selectable
      selectionLabels={{
        selectAll: t('data_table.select_all'),
        selectRow: (index) => `${t('data_table.select_row')} ${index + 1}`,
      }}
      selectedRows={selectedRoles}
      onSelectedRowsChange={onSelectedRolesChange}
      getRowId={(role) => role.id}
    />
  );
}

/**
 * Roles tab — header, table, and role modals.
 * @param props - Component props containing state and handlers
 * @returns The rendered roles tab element
 */
export function OrganizationMemberEditRolesTab({
  customMessages,
  organizationName,
  memberName,
  selectedMember,
  memberRoles,
  availableRoles,
  selectedRoles,
  isFetchingMemberRoles,
  isFetchingAvailableRoles,
  removingRoleIds,
  isAssigningRoles,
  isRemovingRoles = false,
  modalState,
  onSelectedRolesChange,
  onAssignRolesClick,
  onAssignRolesCancel,
  onAssignRolesSubmit,
  onRemoveRolesClick,
  onRemoveRolesCancel,
  onRemoveRolesConfirm,
}: OrganizationMemberEditRolesTabProps): React.JSX.Element {
  const isRemoveRolesModal = modalState.type === 'removeRoles';
  const isAssignRolesModal = modalState.type === 'assignRoles';
  const rolesToRemove = isRemoveRolesModal ? modalState.roles : [];

  const handleRemoveSelectedRoles = React.useCallback(() => {
    onRemoveRolesClick(selectedRoles);
  }, [selectedRoles, onRemoveRolesClick]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <RolesTabHeader
          selectedRoles={selectedRoles}
          organizationName={organizationName}
          customMessages={customMessages}
          onAssignRolesClick={onAssignRolesClick}
          onRemoveSelectedRoles={handleRemoveSelectedRoles}
        />

        <OrganizationMemberEditRolesTable
          memberRoles={memberRoles}
          isLoading={isFetchingMemberRoles}
          removingRoleIds={removingRoleIds}
          selectedRoles={selectedRoles}
          customMessages={customMessages}
          onRemoveRoles={onRemoveRolesClick}
          onSelectedRolesChange={onSelectedRolesChange}
        />
      </div>

      <OrganizationMemberAssignRolesModal
        isOpen={isAssignRolesModal}
        isLoading={isAssigningRoles || isFetchingAvailableRoles}
        availableRoles={availableRoles}
        assignedRoles={memberRoles}
        selectedMember={selectedMember}
        customMessages={customMessages}
        onClose={onAssignRolesCancel}
        onAssign={onAssignRolesSubmit}
      />

      <OrganizationMemberRemoveRoleModal
        isOpen={isRemoveRolesModal}
        isLoading={isRemovingRoles}
        roles={rolesToRemove}
        memberName={memberName}
        customMessages={customMessages}
        onClose={onRemoveRolesCancel}
        onConfirm={onRemoveRolesConfirm}
      />
    </>
  );
}
