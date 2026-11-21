/**
 * SAML request settings: request signing and protocol binding, in an "Advanced Settings" accordion.
 * @module sso-saml-request-settings
 * @internal
 */

import type { SamlpConfigureFormValues } from '@auth0/universal-components-core';
import { useFormContext } from 'react-hook-form';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Link } from '@/components/ui/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  SAML_BINDING_METHOD_FIELD,
  SAML_DIGEST_ALGORITHM_FIELD,
  SAML_SIGNATURE_ALGORITHM_FIELD,
} from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import type {
  SamlSelectFieldConfig,
  SsoSamlRequestSettingsProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

/**
 * Advanced SAML request settings. Reads and writes `signSAMLRequest`, `signatureAlgorithm`,
 * `digestAlgorithm` and `bindingMethod`.
 * @param props - Component props.
 * @param props.signRequestCertUrl - Certificate download link.
 * @param props.messageKey - Message key prefix.
 * @param props.readOnly - Disable editing.
 * @param props.showSignRequest - Show request signing.
 * @param props.showProtocolBinding - Show the protocol binding select.
 * @param props.signRequestHelperText - Help text per metadata source, or a single one.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoSamlRequestSettings({
  signRequestCertUrl,
  messageKey = 'fields.samlp.advanced_settings',
  readOnly = false,
  showSignRequest = true,
  showProtocolBinding = true,
  signRequestHelperText = 'by-source',
  customMessages = {},
}: SsoSamlRequestSettingsProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );
  const { control, watch } = useFormContext<SamlpConfigureFormValues>();

  const source = watch('meta_data_source');
  const signRequestEnabled = watch('signSAMLRequest');

  let signRequestHelperKey = `${messageKey}.sign_request.helper_text`;
  if (signRequestHelperText === 'by-source') {
    signRequestHelperKey =
      source === 'meta_data_url'
        ? `${messageKey}.sign_request.helper_text_metadata_url`
        : `${messageKey}.sign_request.helper_text_metadata_file`;
  }

  const renderSelect = ({ name, messageKey: fieldKey, options }: SamlSelectFieldConfig) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-label font-medium">
            {t(`${messageKey}.${fieldKey}.label`)}
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''} disabled={readOnly}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t(`${messageKey}.${fieldKey}.placeholder`)} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage role="alert" className="text-left text-paragraph" />
        </FormItem>
      )}
    />
  );

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="advanced-settings">
        <AccordionTrigger className="text-sm font-medium">
          {t(`${messageKey}.title`)}
        </AccordionTrigger>
        <AccordionContent className="space-y-6">
          {showSignRequest && (
            <FormField
              control={control}
              name="signSAMLRequest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      {t(`${messageKey}.sign_request.label`)}
                    </FormLabel>
                    <FormDescription className="text-paragraph font-normal text-left">
                      <>
                        {t.trans(signRequestHelperKey, {
                          components: {
                            link: (children: string) => (
                              <Link
                                key="sign-request-link"
                                href={signRequestCertUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </Link>
                            ),
                          },
                        })}
                      </>
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          )}

          {showSignRequest && signRequestEnabled && (
            <>
              {renderSelect(SAML_SIGNATURE_ALGORITHM_FIELD)}
              {renderSelect(SAML_DIGEST_ALGORITHM_FIELD)}
            </>
          )}
          {showProtocolBinding && renderSelect(SAML_BINDING_METHOD_FIELD)}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
