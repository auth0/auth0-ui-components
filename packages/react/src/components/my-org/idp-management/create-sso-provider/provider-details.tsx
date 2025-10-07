import * as React from 'react';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Section } from '@/components/ui/section';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks';
import type { ProviderDetailsProps } from '@/types';

/**
 * ProviderDetails Component
 *
 * Renders the provider details section with name and display name fields.
 * This component is focused purely on the provider identification form fields.
 */
export function ProviderDetails({
  form,
  readOnly = false,
  customMessages = {},
  className,
}: ProviderDetailsProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_details',
    customMessages,
  );

  return (
    <div className={className}>
      <Section title={t('title')} description={t('description')}>
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm text-(length:--font-size-label) font-normal">
                {t('fields.name.label')}
              </FormLabel>
              <FormControl>
                <TextField
                  placeholder={t('fields.name.placeholder')}
                  error={!!fieldState.error}
                  readOnly={readOnly}
                  {...field}
                />
              </FormControl>
              <FormMessage
                className="text-left text-sm text-(length:--font-size-paragraph)"
                role="alert"
              />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('fields.name.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="display_name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm text-(length:--font-size-label) font-normal">
                {t('fields.display_name.label')}
              </FormLabel>
              <FormControl>
                <TextField
                  placeholder={t('fields.display_name.placeholder')}
                  error={!!fieldState.error}
                  readOnly={readOnly}
                  {...field}
                />
              </FormControl>
              <FormMessage
                className="text-left text-sm text-(length:--font-size-paragraph)"
                role="alert"
              />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('fields.display_name.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />
      </Section>
    </div>
  );
}
