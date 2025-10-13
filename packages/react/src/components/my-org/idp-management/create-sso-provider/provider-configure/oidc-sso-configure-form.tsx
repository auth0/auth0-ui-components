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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks';
import { cn } from '@/lib/theme-utils';

interface OidcConfigureFormProps extends SharedComponentProps<ProviderConfigureFieldsMessages> {
  form: UseFormReturn<ProviderConfigureFormValues>;
  className?: string;
}

function OidcProviderForm({
  form,
  readOnly = false,
  customMessages = {},
  className,
}: OidcConfigureFormProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  const typeValue = form.watch('type');
  const showClientSecret = typeValue === 'back_channel';

  return (
    <div className={cn('space-y-6', className)}>
      <FormField
        control={form.control}
        name="discovery_url"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
              {t('fields.oidc.discovery_url.label')}
            </FormLabel>
            <FormControl>
              <TextField
                type="url"
                placeholder={t('fields.oidc.discovery_url.placeholder')}
                error={Boolean(fieldState.error)}
                readOnly={readOnly}
                aria-required={true}
                aria-invalid={Boolean(fieldState.error)}
                {...field}
              />
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {t('fields.oidc.discovery_url.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
              {t('fields.oidc.type.label')}
            </FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                disabled={readOnly}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="back_channel" id="back_channel" />
                  <Label htmlFor="back_channel" className="text-sm font-normal cursor-pointer">
                    {t('fields.oidc.type.options.back_channel.label')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="front_channel" id="front_channel" />
                  <Label htmlFor="front_channel" className="text-sm font-normal cursor-pointer">
                    {t('fields.oidc.type.options.front_channel.label')}
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {t('fields.oidc.type.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="client_id"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
              {t('fields.oidc.client_id.label')}
            </FormLabel>
            <FormControl>
              <CopyableTextField
                type="text"
                placeholder={t('fields.oidc.client_id.placeholder')}
                error={Boolean(fieldState.error)}
                readOnly={readOnly}
                aria-required={true}
                aria-invalid={Boolean(fieldState.error)}
                {...field}
              />
            </FormControl>
            <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
            <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
              {t('fields.oidc.client_id.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />

      {showClientSecret && (
        <FormField
          control={form.control}
          name="client_secret"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-normal text-(length:--font-size-label)">
                {t('fields.oidc.client_secret.label')}
              </FormLabel>
              <FormControl>
                <CopyableTextField
                  type="password"
                  placeholder={t('fields.oidc.client_secret.placeholder')}
                  error={Boolean(fieldState.error)}
                  readOnly={readOnly}
                  aria-required={true}
                  aria-invalid={Boolean(fieldState.error)}
                  {...field}
                />
              </FormControl>
              <FormMessage role="alert" className="text-(length:--font-size-paragraph)" />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('fields.oidc.client_secret.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />
      )}
    </div>
  );
}

export default OidcProviderForm;
