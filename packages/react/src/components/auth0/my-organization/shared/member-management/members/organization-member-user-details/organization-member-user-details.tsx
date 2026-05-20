/**
 * Member detail user details card component.
 * @module organization-member-user-details
 * @internal
 */

import * as React from 'react';

import { buildMemberDetailFields } from './utils';

import { CopyableText } from '@/components/auth0/shared/copyable-text';
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
    <div className="flex flex-col gap-2">
      <h3 className="text-base font-semibold text-primary">
        {t('member.detail.user_details.title')}
      </h3>
      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-4">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground shrink-0">{field.label}</span>
              {field.copyable && field.value !== '—' ? (
                <CopyableText value={field.value} />
              ) : (
                <span className="text-sm text-primary">{field.value}</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
