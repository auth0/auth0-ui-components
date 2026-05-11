/**
 * Member detail user details card component.
 * @module organization-member-user-details
 * @internal
 */

import * as React from 'react';

import { buildMemberDetailFields } from './utils';

import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { Card } from '@/components/ui/card';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationMemberUserDetailsProps } from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Renders the user details card for a member showing name, email, phone, and login timestamps.
 * @param props - Component props
 * @returns The rendered user details card element
 */
export function OrganizationMemberUserDetails({
  member,
  customMessages,
}: OrganizationMemberUserDetailsProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const fields = React.useMemo(() => buildMemberDetailFields(member, t), [member, t]);

  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-primary mb-4">
        {t('member.detail.user_details.title')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{field.label}</span>
            {field.copyable && field.value !== '—' ? (
              <CopyableTextField value={field.value} className="h-8 text-sm" />
            ) : (
              <span className="text-sm text-primary">{field.value}</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
