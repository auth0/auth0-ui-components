/**
 * OIDC connection: discovery URL, communication channel and client credentials.
 * @module sso-oidc-connection-fields
 * @internal
 */

import { useFormContext } from 'react-hook-form';

import { SsoClientCredentialsFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-client-credentials-fields';
import { SsoUrlField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-url-field';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useOidcChannel, type OidcChannel } from '@/hooks/my-organization/use-oidc-channel';
import { useTranslator } from '@/hooks/shared/use-translator';

const CHANNELS: readonly OidcChannel[] = ['back_channel', 'front_channel'];

export interface SsoOidcConnectionFieldsProps {
  readOnly?: boolean;
  showCopyButton?: boolean;
  customMessages?: Partial<Record<string, unknown>>;
}

/**
 * Generic OIDC connection fields. Reads and writes `discovery_url`, `type`, `client_id` and `client_secret`
 * @param props - Component props.
 * @param props.readOnly - Disable editing.
 * @param props.showCopyButton - Show copy buttons.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoOidcConnectionFields({
  readOnly = false,
  showCopyButton,
  customMessages = {},
}: SsoOidcConnectionFieldsProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );
  const { control } = useFormContext();
  const { showClientSecret } = useOidcChannel();

  return (
    <>
      <SsoUrlField
        name="discovery_url"
        messageKey="fields.oidc.discovery_url"
        required
        readOnly={readOnly}
        customMessages={customMessages}
      />

      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-label font-medium">{t('fields.oidc.type.label')}</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                disabled={readOnly}
                className="flex flex-col space-y-2"
              >
                {CHANNELS.map((channel) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <RadioGroupItem value={channel} id={channel} />
                    <Label htmlFor={channel} className="text-sm font-normal cursor-pointer">
                      {t(`fields.oidc.type.options.${channel}.label`)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage role="alert" className="text-left text-paragraph" />
            <FormDescription className="text-paragraph font-normal text-left">
              {t('fields.oidc.type.helper_text')}
            </FormDescription>
          </FormItem>
        )}
      />

      <SsoClientCredentialsFields
        messageKey="fields.oidc"
        required
        showClientSecret={showClientSecret}
        showCopyButton={showCopyButton}
        readOnly={readOnly}
        customMessages={customMessages}
      />
    </>
  );
}
