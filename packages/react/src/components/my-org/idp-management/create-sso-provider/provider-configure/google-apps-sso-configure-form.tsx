import type {
  SharedComponentProps,
  ProviderConfigureFormValues,
  ProviderConfigureFieldsMessages,
} from '@auth0-web-ui-components/core';
import type { UseFormReturn } from 'react-hook-form';

import { CopyableTextField } from '@/components/ui/copyable-text-field';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks';
import { cn } from '@/lib/theme-utils';

interface GoogleAppsConfigureFormProps
  extends SharedComponentProps<ProviderConfigureFieldsMessages> {
  form: UseFormReturn<ProviderConfigureFormValues>;
  className?: string;
}

function GoogleAppsProviderForm({
  form,
  readOnly,
  customMessages = {},
  className,
}: GoogleAppsConfigureFormProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  return (
    <div className={cn('space-y-6', className)}>
      <FormField
        control={form.control}
        name="domain"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
              {t('fields.google-apps.domain.label')}
            </FormLabel>
            <FormControl>
              <TextField
                type="text"
                placeholder={t('fields.google-apps.domain.placeholder')}
                error={Boolean(fieldState.error)}
                readOnly={readOnly}
                {...field}
              />
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="client_id"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
              {t('fields.google-apps.client_id.label')}
            </FormLabel>
            <FormControl>
              <CopyableTextField
                type="text"
                placeholder={t('fields.google-apps.client_id.placeholder')}
                error={Boolean(fieldState.error)}
                readOnly={readOnly}
                {...field}
              />
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {t('fields.google-apps.client_id.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="client_secret"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
              {t('fields.google-apps.client_secret.label')}
            </FormLabel>
            <FormControl>
              <CopyableTextField
                type="password"
                placeholder={t('fields.google-apps.client_secret.placeholder')}
                error={Boolean(fieldState.error)}
                readOnly={readOnly}
                {...field}
              />
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {t('fields.google-apps.client_secret.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="callback_url"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
              {t('fields.google-apps.callback_url.label')}
            </FormLabel>
            <FormControl>
              <CopyableTextField
                type="text"
                placeholder={t('fields.google-apps.callback_url.placeholder')}
                error={Boolean(fieldState.error)}
                readOnly={true}
                {...field}
              />
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {t('fields.google-apps.callback_url.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}

export default GoogleAppsProviderForm;
