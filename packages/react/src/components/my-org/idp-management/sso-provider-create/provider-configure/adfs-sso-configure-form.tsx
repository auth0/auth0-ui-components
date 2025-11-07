import {
  createProviderConfigureSchema,
  type AdfsConfigureFormValues,
} from '@auth0/web-ui-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslator } from '../../../../../hooks/use-translator';
import { cn } from '../../../../../lib/theme-utils';
import type { ProviderConfigureFieldsProps } from '../../../../../types/my-org/idp-management/sso-provider/sso-provider-create-types';
import { CopyableTextField } from '../../../../ui/copyable-text-field';
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
import { Label } from '../../../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../../../ui/radio-group';
import { TextField } from '../../../../ui/text-field';

import { CommonConfigureFields } from './common-configure-fields';

export interface AdfsConfigureFormHandle {
  validate: () => Promise<boolean>;
  getData: () => AdfsConfigureFormValues;
  isDirty: () => boolean;
}

interface AdfsConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const AdfsProviderForm = React.forwardRef<AdfsConfigureFormHandle, AdfsConfigureFormProps>(
  function AdfsProviderForm(
    { initialData, readOnly = false, customMessages = {}, className, onFormDirty, idpConfig },
    ref,
  ) {
    const { t } = useTranslator(
      'idp_management.create_sso_provider.provider_configure',
      customMessages,
    );

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const adfsData = initialData as AdfsConfigureFormValues | undefined;

    const form = useForm<AdfsConfigureFormValues>({
      resolver: zodResolver(createProviderConfigureSchema('adfs')),
      mode: 'onSubmit',
      reValidateMode: 'onChange',
      defaultValues: {
        meta_data_source: adfsData?.meta_data_source || 'meta_data_url',
        meta_data_location_url: adfsData?.meta_data_location_url || '',
        adfs_server: adfsData?.adfs_server || '',
        fedMetadataXml: adfsData?.fedMetadataXml || '',
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
    }));

    const typeValue = form.watch('meta_data_source');
    const showFederationMetadataFile = typeValue === 'meta_data_file';

    const handleFileUpload = (files: File[]) => {
      setUploadedFiles(files);
      if (files.length > 0) {
        form.setValue('fedMetadataXml', files[0].name);
      }
    };

    return (
      <Form {...form}>
        <div className={cn('space-y-6', className)}>
          <FormField
            control={form.control}
            name="meta_data_source"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                  {t('fields.adfs.meta_data_source.label')}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={readOnly}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="meta_data_url" id="meta_data_url" />
                      <Label htmlFor="meta_data_url" className="text-sm font-normal cursor-pointer">
                        {t('fields.adfs.meta_data_source.options.meta_data_url.label')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="meta_data_file" id="meta_data_file" />
                      <Label
                        htmlFor="meta_data_file"
                        className="text-sm font-normal cursor-pointer"
                      >
                        {t('fields.adfs.meta_data_source.options.meta_data_file.label')}
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage
                  role="alert"
                  className="text-sm text-left text-(length:--font-size-paragraph)"
                />
              </FormItem>
            )}
          />

          {typeValue === 'meta_data_url' && (
            <>
              <FormField
                control={form.control}
                name="adfs_server"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                      {t('fields.adfs.meta_data_url.label')}
                    </FormLabel>
                    <FormControl>
                      <TextField
                        type="url"
                        placeholder={t('fields.adfs.meta_data_url.placeholder')}
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
                      {t('fields.adfs.meta_data_url.helper_text')}
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meta_data_location_url"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                      {t('fields.adfs.meta_data_location_url.label')}
                    </FormLabel>
                    <FormControl>
                      <CopyableTextField
                        type="url"
                        placeholder={t('fields.adfs.meta_data_location_url.placeholder')}
                        error={Boolean(fieldState.error)}
                        readOnly={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage
                      role="alert"
                      className="text-sm text-left text-(length:--font-size-paragraph)"
                    />
                    <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                      {t('fields.adfs.meta_data_location_url.helper_text')}
                    </FormDescription>
                  </FormItem>
                )}
              />
            </>
          )}

          {showFederationMetadataFile && (
            <FormField
              control={form.control}
              name="fedMetadataXml"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-(length:--font-size-label)">
                    {t('fields.adfs.federation_metadata_file.label')}
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
                        placeholder={t('fields.adfs.federation_metadata_file.placeholder')}
                      />
                    </div>
                  </FormControl>
                  <FormMessage
                    role="alert"
                    className="text-sm text-left text-(length:--font-size-paragraph)"
                  />
                  <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                    {t('fields.adfs.federation_metadata_file.helper_text')}
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
