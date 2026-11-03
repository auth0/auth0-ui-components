/**
 * SAML request settings: request signing and protocol binding, in an "Advanced Settings" accordion.
 * @module sso-saml-request-settings
 * @internal
 */

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

const SIGNATURE_ALGORITHMS = [
  { value: 'rsa-sha1', label: 'RSA-SHA1' },
  { value: 'rsa-sha256', label: 'RSA-SHA256' },
] as const;

const DIGEST_ALGORITHMS = [
  { value: 'sha1', label: 'SHA1' },
  { value: 'sha256', label: 'SHA256' },
] as const;

const BINDING_METHODS = [
  { value: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect', label: 'HTTP-Redirect' },
  { value: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST', label: 'HTTP-POST' },
] as const;

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SsoSamlRequestSettingsProps {
  /** URL of the certificate used to verify signed requests. */
  signRequestCertUrl: string;
  readOnly?: boolean;
  /** Show the sign request checkbox and algorithms. */
  showSignRequest?: boolean;
  customMessages?: Partial<Record<string, unknown>>;
}

/**
 * Advanced SAML request settings. Reads and writes `signSAMLRequest`, `signatureAlgorithm`,
 * `digestAlgorithm` and `bindingMethod`; the sign request help text follows `meta_data_source`.
 * @param props - Component props.
 * @param props.signRequestCertUrl - Certificate download link.
 * @param props.readOnly - Disable editing.
 * @param props.showSignRequest - Show request signing.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoSamlRequestSettings({
  signRequestCertUrl,
  readOnly = false,
  showSignRequest = true,
  customMessages = {},
}: SsoSamlRequestSettingsProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );
  const { control, watch } = useFormContext();

  const source = watch('meta_data_source');
  const signRequestEnabled = watch('signSAMLRequest');

  const renderSelect = (
    name: string,
    labelKey: string,
    placeholderKey: string,
    options: readonly SelectOption[],
  ) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-label font-medium">{t(labelKey)}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''} disabled={readOnly}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t(placeholderKey)} />
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
          {t('fields.samlp.advanced_settings.title')}
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
                      {t('fields.samlp.advanced_settings.sign_request.label')}
                    </FormLabel>
                    <FormDescription className="text-paragraph font-normal text-left">
                      <>
                        {t.trans(
                          source === 'meta_data_url'
                            ? 'fields.samlp.advanced_settings.sign_request.helper_text_metadata_url'
                            : 'fields.samlp.advanced_settings.sign_request.helper_text_metadata_file',
                          {
                            components: {
                              link: (children: string) => (
                                <Link
                                  key="samlp-sign-request-link"
                                  href={signRequestCertUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </Link>
                              ),
                            },
                          },
                        )}
                      </>
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          )}

          {showSignRequest && signRequestEnabled && (
            <>
              {renderSelect(
                'signatureAlgorithm',
                'fields.samlp.advanced_settings.sign_request_algorithm.label',
                'fields.samlp.advanced_settings.sign_request_algorithm.placeholder',
                SIGNATURE_ALGORITHMS,
              )}
              {renderSelect(
                'digestAlgorithm',
                'fields.samlp.advanced_settings.sign_request_algorithm_digest.label',
                'fields.samlp.advanced_settings.sign_request_algorithm_digest.placeholder',
                DIGEST_ALGORITHMS,
              )}
            </>
          )}
          {renderSelect(
            'bindingMethod',
            'fields.samlp.advanced_settings.request_protocol_binding.label',
            'fields.samlp.advanced_settings.request_protocol_binding.placeholder',
            BINDING_METHODS,
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
