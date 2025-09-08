import * as React from 'react';

import { ColorPicker } from '@/components/ui/color-picker';
import { ImagePreview } from '@/components/ui/image-preview';
import { Section } from '@/components/ui/section';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { BrandingDetailsProps } from '@/types';
import { useTranslator } from '@/hooks';

/**
 * BrandingDetails Component
 *
 * Renders the organization branding section with logo and color fields.
 * This component is focused purely on the branding-related form fields.
 */
export function BrandingDetails({
  form,
  readOnly = false,
  customMessages = {},
}: BrandingDetailsProps): React.JSX.Element {
  const { t } = useTranslator('org_management', customMessages);

  return (
    <Section title={t('org_details.sections.branding.title')}>
      <FormField
        control={form.control}
        name="branding.logo_url"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-sm text-(length:--font-size-label) font-normal">
              {t('org_details.sections.branding.fields.logo.label')}
            </FormLabel>
            <FormControl>
              <ImagePreview error={fieldState.error?.message} {...field} disableFileUpload />
            </FormControl>
            <FormMessage
              className="text-left text-sm text-(length:--font-size-paragraph)"
              role="alert"
            />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {t('org_details.sections.branding.fields.logo.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="branding.colors.primary"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              className="text-sm text-(length:--font-size-label) font-normal"
              htmlFor="primary-color"
            >
              {t('org_details.sections.branding.fields.primary_color.label')}
            </FormLabel>
            <FormControl>
              <ColorPicker
                id="primary-color"
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
              {t('org_details.sections.branding.fields.primary_color.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="branding.colors.page_background"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              className="text-sm text-(length:--font-size-label) font-normal"
              htmlFor="page-background-color"
            >
              {t('org_details.sections.branding.fields.page_background_color.label')}
            </FormLabel>
            <FormControl>
              <ColorPicker
                id="page-background-color"
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
              {t('org_details.sections.branding.fields.page_background_color.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />
    </Section>
  );
}
