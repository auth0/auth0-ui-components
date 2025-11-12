import { LinkIcon } from 'lucide-react';
import * as React from 'react';

import { useTranslator } from '../../../../hooks/use-translator';
import type { BrandingDetailsProps } from '../../../../types/my-org/org-management/org-details-types';
import { ColorPickerInput } from '../../../ui/color-picker';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../ui/form';
import { ImagePreviewField } from '../../../ui/image-preview-field';
import { Section } from '../../../ui/section';

/**
 * BrandingDetails Component
 *
 * Renders the organization branding section with logo and color fields.
 * This component is focused purely on the branding-related form fields.
 */
export function BrandingDetails({
  form,
  customMessages = {},
  className,
  readOnly = false,
}: BrandingDetailsProps): React.JSX.Element {
  const { t } = useTranslator('org_management.org_details', customMessages);

  return (
    <div className={className}>
      <Section title={t('sections.branding.title')}>
        <FormField
          control={form.control}
          name="branding.logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-(length:--font-size-label) font-medium">
                {t('sections.branding.fields.logo.label')}
              </FormLabel>
              <FormControl>
                <ImagePreviewField
                  {...field}
                  readOnly={readOnly}
                  startAdornment={
                    <div className="p-1.5">
                      <LinkIcon />
                    </div>
                  }
                />
              </FormControl>
              <FormMessage
                className="text-left text-sm text-(length:--font-size-paragraph)"
                role="alert"
              />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('sections.branding.fields.logo.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branding.colors.primary"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className="text-sm text-(length:--font-size-label) font-medium"
                htmlFor="primary-color"
              >
                {t('sections.branding.fields.primary_color.label')}
              </FormLabel>
              <FormControl>
                <ColorPickerInput {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage
                className="text-left text-sm text-(length:--font-size-paragraph)"
                role="alert"
              />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('sections.branding.fields.primary_color.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branding.colors.page_background"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className="text-sm text-(length:--font-size-label) font-medium"
                htmlFor="page-background-color"
              >
                {t('sections.branding.fields.page_background_color.label')}
              </FormLabel>
              <FormControl>
                <ColorPickerInput {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage
                className="text-left text-sm text-(length:--font-size-paragraph)"
                role="alert"
              />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('sections.branding.fields.page_background_color.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />
      </Section>
    </div>
  );
}
