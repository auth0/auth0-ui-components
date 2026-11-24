/**
 * File upload whose text content is stored in a form field (certificate, metadata file).
 * @module sso-file-field
 * @internal
 */

import { useFormContext } from 'react-hook-form';

import { FileUpload } from '@/components/ui/file-upload';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SsoFileFieldProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

/**
 * Single-file upload for connection settings.
 * @param props - Component props.
 * @param props.name - Form field name.
 * @param props.messageKey - Message key prefix.
 * @param props.accept - Accepted extensions.
 * @param props.files - Selected files, owned by the parent so they survive the field unmounting.
 * @param props.onFilesChange - Called with the files the user selects or removes.
 * @param props.readOnly - Disable the upload.
 * @param props.invalidFileMessageKey - Error message key for rejected files.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoFileField({
  name,
  messageKey,
  accept,
  files,
  onFilesChange,
  readOnly = false,
  invalidFileMessageKey,
  customMessages = {},
}: SsoFileFieldProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );
  const { control, setError } = useFormContext();

  const extensions = accept.split(',').map((extension) => extension.trim().toLowerCase());
  const onInvalidFiles = invalidFileMessageKey
    ? (rejected: File[]) => {
        const hasWrongType = rejected.some(
          (file) => !extensions.some((extension) => file.name.toLowerCase().endsWith(extension)),
        );
        if (hasWrongType) {
          setError(name, { type: 'manual', message: t(invalidFileMessageKey) });
        }
      }
    : undefined;

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel className="text-label font-medium">{t(`${messageKey}.label`)}</FormLabel>
          <FormControl>
            <FileUpload
              accept={accept}
              onChange={onFilesChange}
              onInvalidFiles={onInvalidFiles}
              value={files}
              maxFiles={1}
              disabled={readOnly}
              className="w-full"
              placeholder={t(`${messageKey}.placeholder`)}
            />
          </FormControl>
          <FormMessage role="alert" className="text-left text-paragraph" />
          <FormDescription className="text-paragraph font-normal text-left">
            {t(`${messageKey}.helper_text`)}
          </FormDescription>
        </FormItem>
      )}
    />
  );
}
