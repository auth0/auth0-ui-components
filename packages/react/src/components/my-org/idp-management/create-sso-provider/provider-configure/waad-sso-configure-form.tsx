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

interface WaadConfigureFormProps extends SharedComponentProps<ProviderConfigureFieldsMessages> {
  form: UseFormReturn<ProviderConfigureFormValues>;
  className?: string;
}

function WaadProviderForm({
  form,
  readOnly,
  customMessages = {},
  className,
}: WaadConfigureFormProps) {
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
              {t('fields.waad.domain.label')}
            </FormLabel>
            <FormControl>
              <TextField
                type="text"
                placeholder={t('fields.waad.domain.placeholder')}
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
              {t('fields.waad.client_id.label')}
            </FormLabel>
            <FormControl>
              <CopyableTextField
                type="text"
                placeholder={t('fields.waad.client_id.placeholder')}
                error={Boolean(fieldState.error)}
                readOnly={readOnly}
                {...field}
              />
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {t('fields.waad.client_id.helper_text')}
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
              {t('fields.waad.client_secret.label')}
            </FormLabel>
            <FormControl>
              <CopyableTextField
                type="password"
                placeholder={t('fields.waad.client_secret.placeholder')}
                error={Boolean(fieldState.error)}
                readOnly={readOnly}
                {...field}
              />
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {t('fields.waad.client_id.helper_text')}
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
              {t('fields.waad.callback_url.label')}
            </FormLabel>
            <FormControl>
              <CopyableTextField
                type="text"
                placeholder={t('fields.waad.callback_url.placeholder')}
                error={Boolean(fieldState.error)}
                readOnly={true}
                {...field}
              />
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {t('fields.waad.callback_url.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}

export default WaadProviderForm;
