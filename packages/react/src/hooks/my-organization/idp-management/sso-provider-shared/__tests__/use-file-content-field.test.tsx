import { act, renderHook } from '@testing-library/react';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { useFileContentField } from '../use-file-content-field';

function setup() {
  let form!: ReturnType<typeof useForm<{ cert: string }>>;
  function Wrapper({ children }: { children: React.ReactNode }) {
    form = useForm<{ cert: string }>({ defaultValues: { cert: '' } });
    return <FormProvider {...form}>{children}</FormProvider>;
  }
  const hook = renderHook(() => useFileContentField<{ cert: string }>('cert'), {
    wrapper: Wrapper,
  });
  return { hook, form: () => form };
}

describe('useFileContentField', () => {
  it('writes the file text into the field and keeps the selected files', async () => {
    const { hook, form } = setup();
    const file = new File(['-----BEGIN CERTIFICATE-----'], 'cert.pem');
    // jsdom's File has no text(); browsers do.
    Object.defineProperty(file, 'text', {
      value: () => Promise.resolve('-----BEGIN CERTIFICATE-----'),
    });

    await act(async () => {
      await hook.result.current.onFilesChange([file]);
    });

    expect(form().getValues('cert')).toBe('-----BEGIN CERTIFICATE-----');
    expect(hook.result.current.files).toEqual([file]);
  });

  it('clears the field when the upload is removed', async () => {
    const { hook, form } = setup();

    await act(async () => {
      await hook.result.current.onFilesChange([new File(['x'], 'a.pem')]);
    });
    await act(async () => {
      await hook.result.current.onFilesChange([]);
    });

    expect(form().getValues('cert')).toBe('');
    expect(hook.result.current.files).toEqual([]);
  });
});
