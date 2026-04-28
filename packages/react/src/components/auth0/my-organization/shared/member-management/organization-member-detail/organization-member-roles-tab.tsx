/**
 * Organization member edit roles tab.
 * @module organization-member-roles-tab
 */

import type { OrgMemberRole } from '@auth0/universal-components-core';
import { Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { MemberAssignRolesModal } from '@/components/auth0/my-organization/shared/member-management/members/member-roles/member-assign-roles-modal';
import { MemberRemoveRoleModal } from '@/components/auth0/my-organization/shared/member-management/members/member-roles/member-remove-role-modal';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { RoleOption } from '@/types/my-organization/member-management/organization-invitation-table-types';
import type {
  OrganizationMemberDetailProps,
  OrganizationMemberDetailViewProps,
} from '@/types/my-organization/member-management/organization-member-detail-types';

interface RolesTabHeaderProps {
  memberRoles: OrgMemberRole[];
  selectedRoles: OrgMemberRole[];
  customMessages: OrganizationMemberDetailProps['customMessages'];
  onAssignRolesClick: () => void;
}

/**
 * Renders the header section of the roles tab with title and action buttons.
 * @param root0 - Component props
 * @param root0.memberRoles - The list of roles assigned to the member
 * @param root0.selectedRoles - The currently selected roles in the table
 * @param root0.customMessages - Optional custom message overrides
 * @param root0.onAssignRolesClick - Handler for the assign roles button click
 * @returns The rendered roles tab header element
 */
function RolesTabHeader({
  memberRoles,
  selectedRoles,
  customMessages,
  onAssignRolesClick,
}: RolesTabHeaderProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);
  return (
    <div className="flex items-center justify-between gap-4 mt-4 mb-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-primary">{t('member.detail.roles.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('member.detail.roles.description')}</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onAssignRolesClick} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" />
          {t('member.detail.roles.assign_button')}
        </Button>
        {memberRoles.length > 0 && (
          // TODO: wire to a bulk remove-roles handler (name TBD)
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={selectedRoles.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {t('member.detail.roles.remove_button')}
          </Button>
        )}
      </div>
    </div>
  );
}

interface OrganizationMemberEditRolesTableProps {
  memberRoles: OrgMemberRole[];
  availableRoles: RoleOption[];
  selectedRoles: OrgMemberRole[];
  isLoading?: boolean;
  removingRoleId?: string | null;
  customMessages: OrganizationMemberDetailProps['customMessages'];
  onRemoveRole: (role: OrgMemberRole) => void;
  onSelectedRolesChange: (roles: OrgMemberRole[]) => void;
}

/**
 * Renders the roles data table for the member detail roles tab.
 * @param root0 - Component props
 * @param root0.memberRoles - The list of roles assigned to the member
 * @param root0.selectedRoles - The currently selected roles
 * @param root0.isLoading - Whether the roles data is loading
 * @param root0.removingRoleId - The ID of the role currently being removed
 * @param root0.customMessages - Optional custom message overrides
 * @param root0.onRemoveRole - Handler called when a role removal is requested
 * @param root0.onSelectedRolesChange - Handler called when row selection changes
 * @returns The rendered roles table element
 */
function OrganizationMemberEditRolesTable({
  memberRoles,
  selectedRoles,
  isLoading = false,
  removingRoleId = null,
  customMessages,
  onRemoveRole,
  onSelectedRolesChange,
}: OrganizationMemberEditRolesTableProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);

  const columns: Column<OrgMemberRole>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('member.detail.roles.table.name'),
        enableSorting: false,
        render: (role) => <span className="font-medium text-primary">{role.name}</span>,
      },
      {
        type: 'text',
        accessorKey: 'description',
        title: t('member.detail.roles.table.description'),
        enableSorting: false,
        render: (role) => <span className="text-primary">{role.description ?? '—'}</span>,
      },
      {
        type: 'actions',
        title: '',
        enableSorting: false,
        render: (role) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={removingRoleId === role.id}
            onClick={() => onRemoveRole(role)}
            aria-label={`Remove role ${role.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [t, removingRoleId, onRemoveRole],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={memberRoles}
        loading={isLoading}
        emptyState={{ title: t('member.detail.roles.table.empty_message') }}
        selectable
        selectedRows={selectedRoles}
        onSelectedRowsChange={onSelectedRolesChange}
        getRowId={(role) => role.id}
      />
      {/* TODO: <Pagination /> */}
    </>
  );
}

/**
 * Roles tab — header, table, and role modals.
 * @param root0 - Component props containing state and handlers
 * @returns The rendered roles tab element
 */
export function OrganizationMemberEditRolesTab({
  state,
  handlers,
}: OrganizationMemberDetailViewProps): React.JSX.Element {
  const [selectedRoles, setSelectedRoles] = React.useState<OrgMemberRole[]>([]);

  return (
    <>
      <RolesTabHeader
        memberRoles={state.memberRoles}
        selectedRoles={selectedRoles}
        customMessages={state.customMessages}
        onAssignRolesClick={handlers.handleAssignRolesClick}
      />

      <OrganizationMemberEditRolesTable
        memberRoles={state.memberRoles}
        availableRoles={state.availableRoles}
        selectedRoles={selectedRoles}
        isLoading={state.isFetchingRoles}
        removingRoleId={state.removingRoleId}
        customMessages={state.customMessages}
        onRemoveRole={handlers.handleRemoveRoleClick}
        onSelectedRolesChange={setSelectedRoles}
      />

      <MemberAssignRolesModal
        isOpen={state.showAssignRolesModal}
        isLoading={state.isAssigningRole}
        availableRoles={state.availableRoles}
        assignedRoles={state.memberRoles}
        customMessages={state.customMessages}
        onClose={handlers.handleAssignRolesCancel}
        onAssign={handlers.handleAssignRolesSubmit}
      />

      <MemberRemoveRoleModal
        isOpen={state.showRemoveRoleModal}
        isLoading={state.removingRoleId !== null}
        role={state.roleToRemove}
        customMessages={state.customMessages}
        onClose={handlers.handleRemoveRoleCancel}
        onConfirm={handlers.handleRemoveRoleConfirm}
      />
    </>
  );
}
