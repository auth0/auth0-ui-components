import {
  createProviderConfigureSchema,
  type OidcConfigureFormValues,
} from '@auth0/web-ui-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useSecretField } from '../../../../../hooks/common/use-secret-field';
import { useProviderFormMode } from '../../../../../hooks/my-org/idp-management/use-provider-form-mode';
import { useTranslator } from '../../../../../hooks/use-translator';
import { cn } from '../../../../../lib/theme-utils';
import type { ProviderConfigureFieldsProps } from '../../../../../types/my-org/idp-management/sso-provider/sso-provider-create-types';
import { CopyableTextField } from '../../../../ui/copyable-text-field';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '../../../../ui/form';
import { Label } from '../../../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../../../ui/radio-group';
import { SecretTextField } from '../../../../ui/secret-text-field';
import { TextField } from '../../../../ui/text-field';

import { CommonConfigureFields } from './common-configure-fields';

export interface OidcConfigureFormHandle {
  validate: () => Promise<boolean>;
  getData: () => OidcConfigureFormValues;
  isDirty: () => boolean;
  reset: (data?: OidcConfigureFormValues) => void;
}

interface OidcConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const OidcProviderForm = React.forwardRef<OidcConfigureFormHandle, OidcConfigureFormProps>(
  function OidcProviderForm(
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

    const { showCopyButtons } = useProviderFormMode(mode);

    const oidcData = initialData as OidcConfigureFormValues | undefined;

    const { hasExistingSecret, getInitialSecretValue, filterSecretFromData } = useSecretField(
      oidcData,
      'client_secret',
      mode === 'edit',
    );

    const form = useForm<OidcConfigureFormValues>({
      resolver: zodResolver(createProviderConfigureSchema('oidc', {}, mode)),
      mode: 'onSubmit',
      reValidateMode: 'onChange',
      defaultValues: {
        discovery_url: oidcData?.discovery_url || '',
        type: oidcData?.type || 'back_channel',
        client_id: oidcData?.client_id || '',
        client_secret: getInitialSecretValue(oidcData?.client_secret),
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
      getData: () => {
        return filterSecretFromData(form.getValues()) as OidcConfigureFormValues;
      },
      isDirty: () => form.formState.isDirty,
      reset: (data) => {
        if (data) {
          form.reset(data);
        } else {
          form.reset();
        }
      },
    }));

    const typeValue = form.watch('type');
    const showClientSecret = typeValue === 'back_channel';

    // Clear client_secret error and value when switching to front channel
    React.useEffect(() => {
      if (typeValue === 'front_channel') {
        form.clearErrors('client_secret');
        form.setValue('client_secret', '', { shouldValidate: false });
      }
    }, [typeValue, form]);

    return (
      <Form {...form}>
        <div className={cn('space-y-6', className)}>
          <FormField
            control={form.control}
            name="discovery_url"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
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
                <FormMessage
                  role="alert"
                  className="text-sm text-left text-(length:--font-size-paragraph)"
                />
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
                <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
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
                <FormMessage
                  role="alert"
                  className="text-sm text-left text-(length:--font-size-paragraph)"
                />
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
                <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                  {t('fields.oidc.client_id.label')}
                </FormLabel>
                <FormControl>
                  <CopyableTextField
                    type="text"
                    placeholder={t('fields.oidc.client_id.placeholder')}
                    error={Boolean(fieldState.error)}
                    readOnly={readOnly}
                    showCopyButton={showCopyButtons}
                    aria-required={true}
                    aria-invalid={Boolean(fieldState.error)}
                    {...field}
                  />
                </FormControl>
                <FormMessage
                  role="alert"
                  className="text-sm text-left text-(length:--font-size-paragraph)"
                />
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
                  <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                    {t('fields.oidc.client_secret.label')}
                  </FormLabel>
                  <FormControl>
                    <SecretTextField
                      type="password"
                      placeholder={t('fields.oidc.client_secret.placeholder')}
                      error={Boolean(fieldState.error)}
                      readOnly={readOnly}
                      showCopyButton={showCopyButtons}
                      required={mode !== 'edit'}
                      showPlaceholder={hasExistingSecret}
                      aria-required={mode !== 'edit'}
                      aria-invalid={Boolean(fieldState.error)}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage
                    role="alert"
                    className="text-sm text-left text-(length:--font-size-paragraph)"
                  />
                  <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                    {t('fields.oidc.client_secret.helper_text')}
                  </FormDescription>
                </FormItem>
              )}
            />
          )}

          <CommonConfigureFields
            idpConfig={idpConfig}
            readOnly={readOnly}
            customMessages={customMessages}
          />
        </div>
      </Form>
    );
  },
);
