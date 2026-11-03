/**
 * Reads an uploaded file into a form field.
 * @module use-file-content-field
 */

import * as React from 'react';
import { useFormContext, type FieldValues, type Path, type PathValue } from 'react-hook-form';

export interface UseFileContentFieldResult {
  /** Files currently selected, for the upload control's `value`. */
  files: File[];
  /** Pass to the upload control's `onChange`. */
  onFilesChange: (files: File[]) => Promise<void>;
}

/**
 * Keeps a form field in sync with the text content of an uploaded file (for example a signing
 * certificate). Clearing the upload clears the field. Must be used inside a form context.
 * @param name - Form field that receives the file content.
 * @returns The selected files and the change handler.
 */
export function useFileContentField<TValues extends FieldValues = FieldValues>(
  name: Path<TValues>,
): UseFileContentFieldResult {
  const { setValue } = useFormContext<TValues>();
  const [files, setFiles] = React.useState<File[]>([]);

  const onFilesChange = React.useCallback(
    async (nextFiles: File[]) => {
      setFiles(nextFiles);
      const file = nextFiles[0];
      const options = { shouldDirty: true, shouldValidate: true };

      if (!file) {
        setValue(name, '' as PathValue<TValues, Path<TValues>>, options);
        return;
      }
      try {
        setValue(name, (await file.text()) as PathValue<TValues, Path<TValues>>, options);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    },
    [name, setValue],
  );

  return { files, onFilesChange };
}
