/**
 * Organization member edit details tab.
 * @module organization-member-details-tab
 */

import * as React from 'react';

import { OrganizationMemberUserDetails } from '@/components/auth0/my-organization/shared/member-management/members/organization-member-user-details/organization-member-user-details';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslator } from '@/hooks/shared/use-translator';
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
  isRemovingFromOrg,
  onRemoveFromOrgClick,
}: RemoveMemberFromOrganizationCardProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  return (
    <Card className="flex flex-row items-center justify-between gap-4 p-6">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-primary">
          {t('member.detail.actions.remove_from_org.title')}
        </span>
        <span className="text-sm text-muted-foreground">
          {t('member.detail.actions.remove_from_org.description')}
        </span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={onRemoveFromOrgClick}
        disabled={isRemovingFromOrg}
        className="shrink-0"
      >
        {t('member.detail.actions.remove_from_org.button')}
      </Button>
    </Card>
  );
}

/**
 * Details tab — user details + danger zone actions.
 * @param props - Component props
 * @returns The rendered details tab element
 */
function OrganizationMemberEditDetailsTabInner(
  props: OrganizationMemberEditDetailsTabProps,
): React.JSX.Element {
  return (
    <div className="flex flex-col gap-10">
      {props.member && (
        <OrganizationMemberUserDetails
          member={props.member}
          customMessages={props.customMessages}
        />
      )}
      <RemoveMemberFromOrganizationCard
        customMessages={props.customMessages}
        isRemovingFromOrg={props.isRemovingFromOrg}
        onRemoveFromOrgClick={props.onRemoveFromOrgClick}
      />
    </div>
  );
}

export const OrganizationMemberEditDetailsTab = React.memo(OrganizationMemberEditDetailsTabInner);
