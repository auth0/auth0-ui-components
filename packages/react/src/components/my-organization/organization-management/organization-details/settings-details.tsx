import * as React from 'react';

import { useTranslator } from '../../../../hooks/use-translator';
import type { SettingsDetailsProps } from '../../../../types/my-org/org-management/org-details-types';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../ui/form';
import { Section } from '../../../ui/section';
import { TextField } from '../../../ui/text-field';

/**
 * SettingsDetails Component
 *
 * Renders the organization settings section with name and display name fields.
 * This component is focused purely on the settings-related form fields.
 */
export function SettingsDetails({
  form,
  readOnly = false,
  customMessages = {},
  className,
}: SettingsDetailsProps): React.JSX.Element {
  const { t } = useTranslator('org_management.org_details', customMessages);

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
