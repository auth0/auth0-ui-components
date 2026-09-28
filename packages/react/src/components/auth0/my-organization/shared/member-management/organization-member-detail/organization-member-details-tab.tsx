/**
 * Organization member edit details tab.
 * @module organization-member-details-tab
 */

import * as React from 'react';

import { OrganizationMemberUserDetails } from '@/components/auth0/my-organization/shared/member-management/members/organization-member-user-details/organization-member-user-details';
import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslator } from '@/hooks/shared/use-translator';
import { canMutateMember } from '@/lib/utils/my-organization/member-management/member-management-utils';
import type {
  OrganizationMemberEditDetailsTabProps,
  RemoveMemberFromOrganizationCardProps,
} from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Card with a button to remove the member from the organization.
 * @param props - Component props containing handlers and loading state
 * @returns The rendered remove-from-org card element
 */
function RemoveMemberFromOrganizationCard({
  customMessages,
  isRemovingFromOrganization,
  canRemoveFromOrganization,
  canModify,
  onRemoveFromOrganizationClick,
}: RemoveMemberFromOrganizationCardProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  return (
    <Card className="flex flex-row items-center justify-between gap-4 p-6">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-primary">
          {t('member.detail.actions.remove_from_organization.title')}
        </span>
        <span className="text-sm text-muted-foreground">
          {t('member.detail.actions.remove_from_organization.description')}
        </span>
      </div>
      <PermissionDeniedTooltip
        customMessages={customMessages}
        enabled={!canRemoveFromOrganization || !canModify}
        className="shrink-0"
        {...(canModify
          ? {}
          : { customMessage: t('member.detail.actions.readonly_member_tooltip') })}
      >
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemoveFromOrganizationClick}
          disabled={isRemovingFromOrganization || !canRemoveFromOrganization || !canModify}
          className="shrink-0"
        >
          {t('member.detail.actions.remove_from_organization.button')}
        </Button>
      </PermissionDeniedTooltip>
    </Card>
  );
}

/**
 * Details tab — user details + danger zone actions.
 * @param props - Component props
 * @returns The rendered details tab element
 */
export function OrganizationMemberEditDetailsTab(
  props: OrganizationMemberEditDetailsTabProps,
): React.JSX.Element {
  if (!props.member) {
    return <div className="flex flex-col gap-10" />;
  }

  const canModify = canMutateMember(props.member?.access_level);

  return (
    <div className="flex flex-col gap-10">
      <OrganizationMemberUserDetails member={props.member} customMessages={props.customMessages} />
      {!props?.readOnly && (
        <RemoveMemberFromOrganizationCard
          customMessages={props.customMessages}
          isRemovingFromOrganization={props.isRemovingFromOrganization}
          canRemoveFromOrganization={props.permissions.canRemoveFromOrganization}
          canModify={canModify}
          onRemoveFromOrganizationClick={props.onRemoveFromOrganizationClick}
        />
      )}
    </div>
  );
}
