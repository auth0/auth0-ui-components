/**
 * Chooses how a SAML-family connection is configured: automatically (metadata URL) or manually.
 * @module sso-connection-source-selector
 * @internal
 */

import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  SAML_CONNECTION_SOURCE_TAB_LABEL_KEYS,
  SAML_CONNECTION_SOURCES,
} from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import type { SsoConnectionSourceSelectorProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

/**
 * Selector bound to the `meta_data_source` form field.
 * @param props - Component props.
 * @param props.messageKey - Message key prefix for the label and radio options.
 * @param props.variant - `radio` (default) or `tabs`.
 * @param props.readOnly - Disable editing.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoConnectionSourceSelector({
  messageKey,
  variant = 'radio',
  readOnly = false,
  customMessages = {},
}: SsoConnectionSourceSelectorProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="meta_data_source"
      render={({ field }) =>
        variant === 'tabs' ? (
          <FormItem>
            <Tabs value={field.value} onValueChange={field.onChange}>
              <TabsList aria-label={t(`${messageKey}.label`)}>
                {SAML_CONNECTION_SOURCES.map((source) => (
                  <TabsTrigger key={source} value={source} disabled={readOnly}>
                    {t(SAML_CONNECTION_SOURCE_TAB_LABEL_KEYS[source])}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <FormMessage role="alert" className="text-left text-paragraph" />
          </FormItem>
        ) : (
          <FormItem>
            <FormLabel className="text-label font-medium">{t(`${messageKey}.label`)}</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                disabled={readOnly}
                className="flex flex-col space-y-2"
              >
                {SAML_CONNECTION_SOURCES.map((source) => (
                  <div key={source} className="flex items-center space-x-2">
                    <RadioGroupItem value={source} id={source} />
                    <Label htmlFor={source} className="text-sm font-normal cursor-pointer">
                      {t(`${messageKey}.options.${source}.label`)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage role="alert" className="text-left text-paragraph" />
          </FormItem>
        )
      }
    />
  );
}
