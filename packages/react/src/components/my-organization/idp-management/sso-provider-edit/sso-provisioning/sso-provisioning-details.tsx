'use client';

import {
  getComponentStyles,
  type ProvisioningDetailsFormValues,
  ssoProvisioningSchema,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useCoreClient } from '../../../../../hooks/use-core-client';
import { useTheme } from '../../../../../hooks/use-theme';
import { useTranslator } from '../../../../../hooks/use-translator';
import { cn } from '../../../../../lib/theme-utils';
import type { SsoProvisioningDetailsProps } from '../../../../../types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';
import { CopyableTextField } from '../../../../ui/copyable-text-field';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../ui/form';
import { Separator } from '../../../../ui/separator';
import { TextField } from '../../../../ui/text-field';
import { SsoProviderAttributeMappings } from '../sso-provider-attribute-mappings';

import { ProvisioningManageToken } from './provisioning-manage-token';

/**
 *
 * @param props
 * @param props.provider
 * @param props.provisioningConfig
 * @param props.isScimTokensLoading
 * @param props.isScimTokenCreating
 * @param props.isScimTokenDeleting
 * @param props.onListScimTokens
 * @param props.onCreateScimToken
 * @param props.onDeleteScimToken
 * @param props.customMessages
 * @param props.styling
 */
export function SsoProvisioningDetails({
  provider,
  provisioningConfig,
  isScimTokensLoading,
  isScimTokenCreating,
  isScimTokenDeleting,
  onListScimTokens,
  onCreateScimToken,
  onDeleteScimToken,
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
}: SsoProvisioningDetailsProps) {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.details',
    customMessages,
  );
  const { isDarkMode } = useTheme();

  const currentStyles = useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const { coreClient } = useCoreClient();

  const scimEndpointUrl = useMemo(() => {
    const domain = coreClient?.auth?.domain || 'your domain';
    return `https://${domain}/scim/v2/connections/${provider.id}/`;
  }, [coreClient?.auth?.domain]);

  const form = useForm<ProvisioningDetailsFormValues>({
    resolver: zodResolver(ssoProvisioningSchema),
    defaultValues: {
      userIdAttribute: provisioningConfig?.user_id_attribute || '',
      scimEndpointUrl: scimEndpointUrl || '',
    },
  });

  return (
    <div
      style={currentStyles.variables}
      className={cn('space-y-6', currentStyles.classes?.['SsoProvisioningDetails-root'])}
    >
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="userIdAttribute"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm text-(length:--font-size-label) font-medium">
                  {t('fields.user_id_attribute.label')}
                </FormLabel>
                <FormControl>
                  <TextField readOnly error={Boolean(fieldState.error)} {...field} />
                </FormControl>
                <FormMessage
                  className="text-left text-sm text-(length:--font-size-paragraph)"
                  role="alert"
                />
                <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                  {t('fields.user_id_attribute.helper_text')}
                </FormDescription>
              </FormItem>
            )}
          />

          <ProvisioningManageToken
            isScimTokensLoading={isScimTokensLoading}
            isScimTokenCreating={isScimTokenCreating}
            isScimTokenDeleting={isScimTokenDeleting}
            onListScimTokens={onListScimTokens}
            onCreateScimToken={onCreateScimToken}
            onDeleteScimToken={onDeleteScimToken}
            customMessages={customMessages?.manage_tokens}
            styling={styling}
          />

          <FormField
            control={form.control}
            name="scimEndpointUrl"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm text-(length:--font-size-label) font-medium">
                  {t('fields.scim_endpoint_url.label')}
                </FormLabel>
                <FormControl>
                  <CopyableTextField error={Boolean(fieldState.error)} readOnly {...field} />
                </FormControl>
                <FormMessage
                  className="text-left text-sm text-(length:--font-size-paragraph)"
                  role="alert"
                />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <Separator />
      <SsoProviderAttributeMappings
        strategy={provisioningConfig?.strategy || null}
        isProvisioning
        userAttributeMap={provisioningConfig?.attributes || null}
        customMessages={customMessages.mappings}
        className={currentStyles.classes?.['SsoProvisioning-attributeMapping']}
      />
    </div>
  );
}
