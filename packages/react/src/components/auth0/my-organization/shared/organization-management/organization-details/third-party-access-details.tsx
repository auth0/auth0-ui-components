/**
 * Third-party application access form section.
 * @module third-party-access-details
 * @internal
 */

import * as React from 'react';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { ThirdPartyAccessDetailsProps } from '@/types/my-organization/organization-management/organization-details-types';

/**
 * ThirdPartyAccessDetails Component
 *
 * Renders the third-party application access RadioGroup section.
 * Shows only when config includes third_party_client_access.
 * Read-only when allowed_values has only one option.
 * @param props - Component props.
 * @param props.form - React Hook Form instance
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.isConfigReadOnly - Whether the config restricts editing (allowed_values.length === 1)
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.className - Optional CSS class name for styling
 * @returns JSX element
 */
export function ThirdPartyAccessDetails({
  form,
  readOnly = false,
  isConfigReadOnly = false,
  customMessages = {},
  className,
}: ThirdPartyAccessDetailsProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.organization_details', customMessages);
  const isDisabled = readOnly || isConfigReadOnly;

  return (
    <div className={className}>
      <FormField
        control={form.control}
        name="third_party_client_access"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-(length:--font-size-label) font-medium">
              {t('sections.settings.fields.third_party_client_access.label')}
            </FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                disabled={isDisabled}
                className="flex flex-col space-y-4 pt-2"
                aria-label={t('sections.settings.fields.third_party_client_access.label')}
              >
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="block"
                      id="third-party-block"
                      aria-describedby="third-party-block-description"
                    />
                    <Label
                      htmlFor="third-party-block"
                      className="text-sm font-normal cursor-pointer"
                    >
                      {t('sections.settings.fields.third_party_client_access.options.block.label')}
                    </Label>
                  </div>
                  <p
                    id="third-party-block-description"
                    className="text-sm text-muted-foreground ml-7"
                  >
                    {t(
                      'sections.settings.fields.third_party_client_access.options.block.helper_text',
                    )}
                  </p>
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="allow"
                      id="third-party-allow"
                      aria-describedby="third-party-allow-description"
                    />
                    <Label
                      htmlFor="third-party-allow"
                      className="text-sm font-normal cursor-pointer"
                    >
                      {t('sections.settings.fields.third_party_client_access.options.allow.label')}
                    </Label>
                  </div>
                  <p
                    id="third-party-allow-description"
                    className="text-sm text-muted-foreground ml-7"
                  >
                    {t(
                      'sections.settings.fields.third_party_client_access.options.allow.helper_text',
                    )}
                  </p>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage role="alert" />
          </FormItem>
        )}
      />
    </div>
  );
}
