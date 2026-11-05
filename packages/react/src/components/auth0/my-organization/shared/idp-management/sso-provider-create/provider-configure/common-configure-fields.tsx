/**
 * Common SSO provider configuration fields.
 * @module common-configure-fields
 * @internal
 */

import type { GetIdpConfigurationResponseContent } from '@auth0/universal-components-core';
import { useFormContext } from 'react-hook-form';

import { ConnectionAccessFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/connection-access-fields';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { ConnectionAccessFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

interface CommonConfigureFieldsProps extends ConnectionAccessFieldsProps {
  idpConfig: GetIdpConfigurationResponseContent | null;
  readOnly?: boolean;
  customMessages?: Partial<Record<string, unknown>>;
}

/**
 * CommonConfigureFields Component
 * Renders common fields (show_as_button, assign_membership_on_login) and the connection access fields
 * (third-party access, cross app access) that are shared across all SSO provider strategies
 * @param props - Component props.
 * @param props.idpConfig - Identity provider configuration
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.strategy - SSO provider strategy
 * @param props.showThirdPartyAccess - Whether to show the third-party access field
 * @param props.isThirdPartyAccessReadOnly - Whether the third-party access field is read-only
 * @param props.isOrganizationBlocked - Whether the organization is blocked from third-party access
 * @param props.showCrossAppAccess - Whether to show the cross app access field
 * @param props.isCrossAppAccessReadOnly - Whether the cross app access field is read-only
 * @param props.classes - Style classes for the access fields
 * @returns JSX element
 */
export function CommonConfigureFields({
  idpConfig,
  readOnly = false,
  customMessages = {},
  ...accessFieldsProps
}: CommonConfigureFieldsProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  const form = useFormContext();

  // Only show these fields if the config allows them
  const showAsButtonEnabled = idpConfig?.organization?.can_set_show_as_button;
  const assignMembershipEnabled = idpConfig?.organization?.can_set_assign_membership_on_login;

  const hasCommonFields = showAsButtonEnabled || assignMembershipEnabled;

  return (
    <>
      {hasCommonFields && (
        <div className="space-y-6 pt-4">
          {showAsButtonEnabled && (
            <FormField
              control={form.control}
              name="show_as_button"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      {t('fields.common.show_as_button.label')}
                    </FormLabel>
                    <FormDescription className="text-sm">
                      {t('fields.common.show_as_button.helper_text')}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          )}

          {assignMembershipEnabled && (
            <FormField
              control={form.control}
              name="assign_membership_on_login"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      {t('fields.common.assign_membership_on_login.label')}
                    </FormLabel>
                    <FormDescription className="text-sm">
                      {t('fields.common.assign_membership_on_login.helper_text')}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      <ConnectionAccessFields readOnly={readOnly} {...accessFieldsProps} />
    </>
  );
}
