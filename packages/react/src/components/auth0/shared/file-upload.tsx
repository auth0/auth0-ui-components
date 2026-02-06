import { Upload, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface FileUploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: File[];
  onChange?: (files: File[]) => void;
  onRemove?: (file: File) => void;
  maxSize?: number;
  accept?: string;
  maxFiles?: number;
  preview?: boolean;
  className?: string;
}

export function FileUpload({
  value = [],
  onChange,
  onRemove,
  maxSize,
  accept,
  maxFiles = 1,
  preview = true,
  className,
  disabled,
  ...props
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = React.useCallback(
    (files: File[]) => {
      if (disabled) return;
      const validFiles = files.filter((file) => {
        if (maxSize && file.size > maxSize) return false;
        if (
          accept &&
          !accept.split(',').some((type) => {
            const fileType = type.trim().toLowerCase();
            const fileName = file.name.toLowerCase();
            const fileMimeType = file.type.toLowerCase();
            if (fileType.startsWith('.')) {
              return fileName.endsWith(fileType);
            }

            if (fileType === fileMimeType) {
              return true;
            }

            if (fileType.endsWith('/*')) {
              const baseType = fileType.slice(0, -2);
              return fileMimeType.startsWith(`${baseType}/`);
            }

            return false;
          })
        )
          return false;
        return true;
      });

      if (maxFiles === 1) {
        onChange?.(validFiles.slice(0, 1));
      } else {
        onChange?.([...value, ...validFiles].slice(0, maxFiles));
      }

      if (inputRef.current) inputRef.current.value = '';
    },
    [disabled, maxSize, accept, maxFiles, onChange, value],
  );

  const removeFile = React.useCallback(
    (file: File) => {
      onRemove?.(file);
      onChange?.(value.filter((f) => f !== file));
    },
    [onChange, onRemove, value],
  );

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'border-muted-foreground/25 relative flex min-h-[150px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors',
          dragActive && 'border-primary',
          disabled && 'cursor-not-allowed opacity-60',
          className,
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles !== 1}
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <div className="flex flex-col items-center gap-2">
          <Upload className="text-muted-foreground h-8 w-8" />
          <p className="text-muted-foreground text-sm">
            Drag & drop files here, or click to select files
          </p>
          {accept && <p className="text-muted-foreground text-xs">Allowed files: {accept}</p>}
          {maxSize && (
            <p className="text-muted-foreground text-xs">
              Max size: {(maxSize / 1024 / 1024).toFixed(2)}MB
            </p>
          )}
        </div>
      </div>

      {preview && value.length > 0 && (
        <div className="grid gap-4">
          {value.map((file, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border p-2">
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(2)}KB</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file)}
                className="hover:bg-muted shrink-0 rounded-md p-1 transition-colors"
                disabled={disabled}
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
