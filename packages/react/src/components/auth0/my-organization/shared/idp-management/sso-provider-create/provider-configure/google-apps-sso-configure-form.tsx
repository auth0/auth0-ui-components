import {
  createProviderConfigureSchema,
  type GoogleAppsConfigureFormValues,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { TextField } from '@/components/auth0/shared/text-field';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useProviderFormMode } from '@/hooks/my-organization/use-provider-form-mode';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { ProviderConfigureFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

export interface GoogleAppsConfigureFormHandle {
  validate: () => Promise<boolean>;
  getData: () => GoogleAppsConfigureFormValues;
  isDirty: () => boolean;
  reset: (data?: GoogleAppsConfigureFormValues) => void;
}

interface GoogleAppsConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const GoogleAppsProviderForm = React.forwardRef<
  GoogleAppsConfigureFormHandle,
  GoogleAppsConfigureFormProps
>(function GoogleAppsProviderForm(
  {
    initialData,
    readOnly = false,
    customMessages = {},
    className,
    onFormDirty,
    idpConfig,
    mode = 'create',
  },
  ref,
) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  const { coreClient } = useCoreClient();
  const { showCopyButtons } = useProviderFormMode(mode);

  const callbackUrl = React.useMemo(() => {
    const domain = coreClient?.getDomain() || 'YOUR_DOMAIN';
    return `https://${domain}/login/callback`;
  }, [coreClient]);

  const googleAppsData = initialData as GoogleAppsConfigureFormValues | undefined;

  const form = useForm<GoogleAppsConfigureFormValues>({
    resolver: zodResolver(createProviderConfigureSchema('google-apps')),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      domain: googleAppsData?.domain || '',
      client_id: googleAppsData?.client_id || '',
      client_secret: googleAppsData?.client_secret || '',
      callback_url: callbackUrl || '',
    },
  });

  const { isDirty } = form.formState;

  React.useEffect(() => {
    onFormDirty?.(isDirty);
  }, [isDirty, onFormDirty]);

  React.useImperativeHandle(ref, () => ({
    validate: async () => {
      return await form.trigger();
    },
    getData: () => form.getValues(),
    isDirty: () => form.formState.isDirty,
    reset: (data) => {
      if (data) {
        form.reset(data);
      } else {
        form.reset();
      }
    },
  }));

  return (
    <Form {...form}>
      <div className={cn('space-y-6', className)}>
        <FormField
          control={form.control}
          name="domain"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
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
              <FormMessage
                role="alert"
                className="text-sm text-left text-(length:--font-size-paragraph)"
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_id"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                {t('fields.google-apps.client_id.label')}
              </FormLabel>
              <FormControl>
                <CopyableTextField
                  type="text"
                  placeholder={t('fields.google-apps.client_id.placeholder')}
                  error={Boolean(fieldState.error)}
                  readOnly={readOnly}
                  showCopyButton={showCopyButtons}
                  {...field}
                />
              </FormControl>
              <FormMessage
                role="alert"
                className="text-sm text-left text-(length:--font-size-paragraph)"
              />
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
              <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                {t('fields.google-apps.client_secret.label')}
              </FormLabel>
              <FormControl>
                <CopyableTextField
                  type="password"
                  placeholder={t('fields.google-apps.client_secret.placeholder')}
                  error={Boolean(fieldState.error)}
                  readOnly={readOnly}
                  showCopyButton={showCopyButtons}
                  {...field}
                />
              </FormControl>
              <FormMessage
                role="alert"
                className="text-sm text-left text-(length:--font-size-paragraph)"
              />
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
              <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
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
              <FormMessage
                role="alert"
                className="text-sm text-left text-(length:--font-size-paragraph)"
              />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('fields.google-apps.callback_url.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />

        <CommonConfigureFields
          idpConfig={idpConfig}
          readOnly={readOnly}
          customMessages={customMessages}
        />
      </div>
    </Form>
  );
});
