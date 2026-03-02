/**
 * SSO provisioning details form.
 * @module sso-provisioning-details
 * @internal
 */

'use client';

import {
  getComponentStyles,
  type ProvisioningDetailsFormValues,
  ssoProvisioningSchema,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { SsoProviderAttributeMappings } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-attribute-mappings';
import { ProvisioningManageToken } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/provisioning-manage-token';
import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { TextField } from '@/components/ui/text-field';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { SsoProvisioningDetailsProps } from '@/types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';

/**
 * SSO provisioning details for SCIM token management.
 *
 * @param props - Component props.
 * @param props.provider - The SSO provider being configured.
 * @param props.provisioningConfig - Provisioning configuration settings.
 * @param props.isScimTokensLoading - Whether SCIM tokens are loading.
 * @param props.isScimTokenCreating - Whether a SCIM token is being created.
 * @param props.isScimTokenDeleting - Whether a SCIM token is being deleted.
 * @param props.onListScimTokens - Callback to list SCIM tokens.
 * @param props.onCreateScimToken - Callback to create a SCIM token.
 * @param props.onDeleteScimToken - Callback to delete a SCIM token.
 * @param props.customMessages - Custom i18n message overrides.
 * @param props.styling - CSS variables and class overrides.
 * @returns SSO provisioning details component.
 * @internal
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
    const domain = coreClient?.getDomain() || 'your-domain';
    return `https://${domain}/scim/v2/connections/${provider.id}/`;
  }, [coreClient, provider.id]);

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
