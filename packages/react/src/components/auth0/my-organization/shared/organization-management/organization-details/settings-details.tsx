/**
 * Organization settings details form section.
 * @module settings-details
 * @internal
 */

import * as React from 'react';

import { Section } from '@/components/auth0/shared/section';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SettingsDetailsProps } from '@/types/my-organization/organization-management/organization-details-types';

/**
 * SettingsDetails Component
 *
 * Renders the organization settings section with name and display name fields.
 * This component is focused purely on the settings-related form fields.
 * @param props - Component props.
 * @param props.form - React Hook Form instance
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.className - Optional CSS class name for styling
 * @returns JSX element
 */
export function SettingsDetails({
  form,
  readOnly = false,
  customMessages = {},
  className,
}: SettingsDetailsProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.organization_details', customMessages);

  return (
    <div className={className}>
      <Section title={t('sections.settings.title')}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className="text-sm text-(length:--font-size-label) font-medium"
                htmlFor="organization-name"
              >
                {t('sections.settings.fields.name.label')}
              </FormLabel>
              <FormControl>
                <TextField
                  id="organization-name"
                  placeholder={t('sections.settings.fields.name.placeholder')}
                  error={Boolean(form.formState.errors.name)}
                  aria-invalid={Boolean(form.formState.errors.name)}
                  readOnly={readOnly}
                  {...field}
                />
              </FormControl>
              <FormMessage
                className="text-left text-sm text-(length:--font-size-paragraph)"
                role="alert"
              />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('sections.settings.fields.name.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className="text-sm text-(length:--font-size-label) font-medium"
                htmlFor="organization-display-name"
              >
                {t('sections.settings.fields.display_name.label')}
              </FormLabel>
              <FormControl>
                <TextField
                  id="organization-display-name"
                  placeholder={t('sections.settings.fields.display_name.placeholder')}
                  error={Boolean(form.formState.errors.display_name)}
                  aria-invalid={Boolean(form.formState.errors.display_name)}
                  readOnly={readOnly}
                  {...field}
                />
              </FormControl>
              <FormMessage
                className="text-left text-sm text-(length:--font-size-paragraph)"
                role="alert"
              />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('sections.settings.fields.display_name.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />
      </Section>
    </div>
  );
}
