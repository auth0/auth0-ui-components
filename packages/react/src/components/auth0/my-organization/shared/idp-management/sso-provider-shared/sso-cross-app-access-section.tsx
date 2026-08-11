/**
 * Cross app access section for SSO provider.
 * @module sso-cross-app-access-section
 * @internal
 */

import * as React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { CrossAppAccessSectionProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-tab-types';

/**
 * Cross App Access section component.
 * Renders differently based on strategy:
 * @param props - Component props.
 * @returns Cross app access section.
 */
export function SsoCrossAppAccessSection({
  checked,
  onChange,
  readOnly = false,
  customMessages = {},
  className,
  strategy,
  discoveryUrl = '',
  onDiscoveryUrlChange,
}: CrossAppAccessSectionProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.sso_provider_details.cross_app_access',
    customMessages as Record<string, unknown>,
  );

  const id = React.useId();
  const checkboxId = `${id}-checkbox`;
  const descriptionId = `${id}-description`;
  const urlInputId = `${id}-discovery-url`;
  const urlHelperId = `${id}-url-helper`;

  const handleCheckedChange = (value: boolean | 'indeterminate') => {
    if (value !== 'indeterminate') {
      onChange(value);
    }
  };

  const isSaml = strategy === 'samlp';
  const isCheckboxDisabled = readOnly || (isSaml && !discoveryUrl?.trim());

  const renderCheckboxGroup = () => (
    <div className="flex items-start gap-3">
      <Checkbox
        id={checkboxId}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={isCheckboxDisabled}
        aria-disabled={isCheckboxDisabled}
        aria-describedby={descriptionId}
      />
      <div className="flex flex-col gap-1">
        <Label
          htmlFor={checkboxId}
          className={cn(
            'text-sm font-normal cursor-pointer',
            isCheckboxDisabled && 'text-muted-foreground cursor-not-allowed',
          )}
        >
          {t('label')}
        </Label>
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {t('helper_text')}
        </p>
        <p className="text-sm text-muted-foreground">{t('domain_verification_text')}</p>
      </div>
    </div>
  );

  if (isSaml) {
    return (
      <div className={cn('space-y-4', className)}>
        <Separator />
        <h6 className="text-base font-semibold leading-5">{t('title')}</h6>
        <p className="text-sm text-muted-foreground">{t('saml_description')}</p>

        <div className="space-y-2">
          <Label htmlFor={urlInputId} className="text-sm font-medium">
            {t('saml_discovery_url_label')}
          </Label>
          <TextField
            id={urlInputId}
            value={discoveryUrl}
            onChange={(e) => onDiscoveryUrlChange?.(e.target.value)}
            placeholder={t('saml_discovery_url_placeholder')}
            disabled={readOnly}
            aria-describedby={urlHelperId}
            className="w-full"
          />
          <p id={urlHelperId} className="text-sm text-muted-foreground">
            {t('saml_discovery_url_helper')}
          </p>
        </div>

        {renderCheckboxGroup()}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Separator />
      <h6 className="text-base font-semibold leading-5">{t('title')}</h6>
      {renderCheckboxGroup()}
    </div>
  );
}
