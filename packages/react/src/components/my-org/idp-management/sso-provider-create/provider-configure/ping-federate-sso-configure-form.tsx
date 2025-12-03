import {
  createProviderConfigureSchema,
  type PingFederateConfigureFormValues,
} from '@auth0/web-ui-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslator } from '../../../../../hooks/use-translator';
import { cn } from '../../../../../lib/theme-utils';
import type { ProviderConfigureFieldsProps } from '../../../../../types/my-org/idp-management/sso-provider/sso-provider-create-types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../ui/accordion';
import { Checkbox } from '../../../../ui/checkbox';
import { FileUpload } from '../../../../ui/file-upload';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '../../../../ui/form';
import { Link } from '../../../../ui/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../ui/select';
import { TextField } from '../../../../ui/text-field';

import { CommonConfigureFields } from './common-configure-fields';

const PING_FEDERATE_HELP_LINKS = {
  sign_request: 'domain/pem?cert=connection',
} as const;

const SIGNATURE_ALGORITHMS = [
  { value: 'rsa-sha1', label: 'RSA-SHA1' },
  { value: 'rsa-sha256', label: 'RSA-SHA256' },
] as const;

const DIGEST_ALGORITHMS = [
  { value: 'sha1', label: 'SHA1' },
  { value: 'sha256', label: 'SHA256' },
] as const;

export interface PingFederateConfigureFormHandle {
  validate: () => Promise<boolean>;
  getData: () => PingFederateConfigureFormValues;
  isDirty: () => boolean;
  reset: (data?: PingFederateConfigureFormValues) => void;
}

interface PingFederateConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const PingFederateProviderForm = React.forwardRef<
  PingFederateConfigureFormHandle,
  PingFederateConfigureFormProps
>(function PingFederateProviderForm(
  { initialData, readOnly = false, customMessages = {}, className, onFormDirty, idpConfig },
  ref,
) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const pingFederateData = initialData as PingFederateConfigureFormValues | undefined;

  const form = useForm<PingFederateConfigureFormValues>({
    resolver: zodResolver(createProviderConfigureSchema('pingfederate')),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      pingFederateBaseUrl: pingFederateData?.pingFederateBaseUrl || '',
      signingCert: pingFederateData?.signingCert || '',
      signSAMLRequest: pingFederateData?.signSAMLRequest || false,
      signatureAlgorithm: pingFederateData?.signatureAlgorithm || 'rsa-sha256',
      digestAlgorithm: pingFederateData?.digestAlgorithm || 'sha256',
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

  const signRequestEnabled = form.watch('signSAMLRequest');

  const handleFileUpload = async (files: File[]) => {
    setUploadedFiles(files);

    const file = files[0];
    if (file) {
      try {
        const content = await file.text();
        form.setValue('signingCert', content);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  };

  return (
    <Form {...form}>
      <div className={cn('space-y-6', className)}>
        <FormField
          control={form.control}
          name="pingFederateBaseUrl"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                {t('fields.ping-federate.ping_federate_baseurl.label')}
              </FormLabel>
              <FormControl>
                <TextField
                  type="url"
                  placeholder={t('fields.ping-federate.ping_federate_baseurl.placeholder')}
                  error={Boolean(fieldState.error)}
                  readOnly={readOnly}
                  aria-invalid={Boolean(fieldState.error)}
                  {...field}
                />
              </FormControl>
              <FormMessage
                role="alert"
                className="text-sm text-left text-(length:--font-size-paragraph)"
              />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('fields.ping-federate.ping_federate_baseurl.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="signingCert"
          render={() => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                {t('fields.ping-federate.sign_cert.label')}
              </FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <FileUpload
                    accept=".pem"
                    onChange={handleFileUpload}
                    value={uploadedFiles}
                    maxFiles={1}
                    disabled={readOnly}
                    className="w-full"
                    placeholder={t('fields.ping-federate.sign_cert.placeholder')}
                  />
                </div>
              </FormControl>
              <FormMessage
                role="alert"
                className="text-sm text-left text-(length:--font-size-paragraph)"
              />
              <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                {t('fields.ping-federate.sign_cert.helper_text')}
              </FormDescription>
            </FormItem>
          )}
        />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced-settings">
            <AccordionTrigger className="text-sm font-medium">
              {t('fields.ping-federate.advanced_settings.title')}
            </AccordionTrigger>
            <AccordionContent className="space-y-6">
              <FormField
                control={form.control}
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
                        {t('fields.ping-federate.advanced_settings.sign_request.label')}
                      </FormLabel>
                      <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                        <>
                          {t.trans(
                            'fields.ping-federate.advanced_settings.sign_request.helper_text',
                            {
                              components: {
                                link: (children: string) => (
                                  <Link
                                    key="ping-federate-sign-request-link"
                                    href={PING_FEDERATE_HELP_LINKS.sign_request}
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

              {signRequestEnabled && (
                <>
                  <FormField
                    control={form.control}
                    name="signatureAlgorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                          {t('fields.ping-federate.advanced_settings.sign_request_algorithm.label')}
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'fields.ping-federate.advanced_settings.sign_request_algorithm.placeholder',
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SIGNATURE_ALGORITHMS.map((algorithm) => (
                              <SelectItem key={algorithm.value} value={algorithm.value}>
                                {algorithm.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage
                          role="alert"
                          className="text-sm text-left text-(length:--font-size-paragraph)"
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="digestAlgorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                          {t(
                            'fields.ping-federate.advanced_settings.sign_request_algorithm_digest.label',
                          )}
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'fields.ping-federate.advanced_settings.sign_request_algorithm_digest.placeholder',
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DIGEST_ALGORITHMS.map((algorithm) => (
                              <SelectItem key={algorithm.value} value={algorithm.value}>
                                {algorithm.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage
                          role="alert"
                          className="text-sm text-left text-(length:--font-size-paragraph)"
                        />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <CommonConfigureFields
          idpConfig={idpConfig}
          readOnly={readOnly}
          customMessages={customMessages}
        />
      </div>
    </Form>
  );
});
