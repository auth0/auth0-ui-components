import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { IdpConfig } from '@/types/my-organization/config/config-idp-types';

interface CommonConfigureFieldsProps {
  idpConfig: IdpConfig | null;
  readOnly?: boolean;
  customMessages?: Partial<Record<string, unknown>>;
}

/**
 * CommonConfigureFields Component
 * Renders common fields (show_as_button, assign_membership_on_login) that are shared across all SSO provider strategies
 */
export function CommonConfigureFields({
  idpConfig,
  readOnly = false,
  customMessages = {},
}: CommonConfigureFieldsProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  const form = useFormContext();

  // Only show these fields if the config allows them
  const showAsButtonEnabled = idpConfig?.organization?.can_set_show_as_button;
  const assignMembershipEnabled = idpConfig?.organization?.can_set_assign_membership_on_login;

  // If neither field is enabled, don't render anything
  if (!showAsButtonEnabled && !assignMembershipEnabled) {
    return null;
  }

  return (
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
  );
}
