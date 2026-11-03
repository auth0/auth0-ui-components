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

export type ConnectionSource = 'meta_data_url' | 'meta_data_file';
export type ConnectionSourceSelectorVariant = 'radio' | 'tabs';

export interface SsoConnectionSourceSelectorProps {
  /** Message key prefix, e.g. `fields.samlp.meta_data_source`. */
  messageKey: string;
  /** `radio` (advanced flow) or `tabs` (guided setup, Automatic / Manual). */
  variant?: ConnectionSourceSelectorVariant;
  readOnly?: boolean;
  customMessages?: Partial<Record<string, unknown>>;
}

const SOURCES: readonly ConnectionSource[] = ['meta_data_url', 'meta_data_file'];

/** Tab labels follow the guided setup wording: automatic (metadata URL) or manual entry. */
const TAB_LABEL_KEYS: Record<ConnectionSource, string> = {
  meta_data_url: 'fields.common.connection_method.automatic',
  meta_data_file: 'fields.common.connection_method.manual',
};

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
                {SOURCES.map((source) => (
                  <TabsTrigger key={source} value={source} disabled={readOnly}>
                    {t(TAB_LABEL_KEYS[source])}
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
                {SOURCES.map((source) => (
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
