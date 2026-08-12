/**
 * Third party application access section for SSO provider.
 * @module sso-third-party-access-section
 * @internal
 */

import * as React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import { useId } from '@/lib/utils/use-id-compat';
import type { ThirdPartyAccessSectionProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-tab-types';

/**
 * @param props - Component props.
 * @returns Third party access section.
 */
export function SsoThirdPartyAccessSection({
  checked,
  onChange,
  readOnly = false,
  customMessages = {},
  className,
}: ThirdPartyAccessSectionProps): React.ReactElement {
  const { t } = useTranslator(
    'idp_management.sso_provider_details.third_party_access',
    customMessages,
  );

  const id = useId();
  const checkboxId = `${id}-checkbox`;
  const descriptionId = `${id}-description`;

  const handleCheckedChange = (value: boolean | 'indeterminate') => {
    if (value !== 'indeterminate') {
      onChange(value);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Separator />
      <h6 className="text-base font-semibold leading-5">{t('title')}</h6>
      <div className="flex items-start gap-3">
        <Checkbox
          id={checkboxId}
          checked={checked}
          onCheckedChange={handleCheckedChange}
          disabled={readOnly}
          aria-disabled={readOnly}
          aria-describedby={descriptionId}
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor={checkboxId} className="text-sm font-normal cursor-pointer">
            {t('label')}
          </Label>
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {t('helper_text')}
          </p>
        </div>
      </div>
    </div>
  );
}
