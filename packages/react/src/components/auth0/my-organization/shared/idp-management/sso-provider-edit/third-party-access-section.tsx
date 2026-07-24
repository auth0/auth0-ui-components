/**
 * Third party application access section for SSO provider.
 * @module third-party-access-section
 * @internal
 */

import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { ThirdPartyAccessSectionProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-tab-types';

/**
 * @param props - Component props.
 * @returns Third party access card section.
 */
export function ThirdPartyAccessSection({
  checked,
  onChange,
  readOnly = false,
  customMessages = {},
  className,
}: ThirdPartyAccessSectionProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.sso_provider_details.third_party_access',
    customMessages as Record<string, unknown>,
  );

  const id = React.useId();
  const titleId = `${id}-title`;
  const checkboxId = `${id}-checkbox`;
  const descriptionId = `${id}-description`;

  const handleCheckedChange = (value: boolean | 'indeterminate') => {
    if (value !== 'indeterminate') {
      onChange(value);
    }
  };

  return (
    <Card className={cn(className)} role="group" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId} className="text-base">
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            <Label htmlFor={checkboxId} className="text-sm font-medium cursor-pointer">
              {t('label')}
            </Label>
            <p id={descriptionId} className="text-sm text-muted-foreground">
              {t('helper_text')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
