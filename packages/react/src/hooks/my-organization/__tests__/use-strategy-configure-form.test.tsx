import { act, renderHook } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  parseStrategyConfigureValues,
  useStrategyConfigureForm,
  type StrategyConfigureFormHandle,
} from '../use-strategy-configure-form';

type Values = { discovery_url: string; type: string; client_id: string; client_secret: string };

const defaults: Values = {
  discovery_url: '',
  type: 'back_channel',
  client_id: '',
  client_secret: '',
};

function setup(options: Partial<Parameters<typeof useStrategyConfigureForm<Values>>[1]> = {}) {
  const ref = React.createRef<StrategyConfigureFormHandle<Values>>();
  const hook = renderHook(() =>
    useStrategyConfigureForm<Values>(ref, {
      strategy: 'oidc',
      defaultValues: defaults,
      ...options,
    }),
  );
  return { ref, hook };
}

describe('useStrategyConfigureForm', () => {
  it('exposes the current values through getData', () => {
    const { ref, hook } = setup();

    act(() => hook.result.current.setValue('client_id', 'abc'));

    expect(ref.current?.getData().client_id).toBe('abc');
  });

  it('validates with the strategy schema', async () => {
    const { ref } = setup();

    let valid = true;
    await act(async () => {
      valid = (await ref.current?.validate()) ?? true;
    });

    expect(valid).toBe(false);
  });

  it('reports dirty state through the handle and onFormDirty', () => {
    const onFormDirty = vi.fn();
    const { ref, hook } = setup({ onFormDirty });

    expect(ref.current?.isDirty()).toBe(false);
    act(() => hook.result.current.setValue('client_id', 'abc', { shouldDirty: true }));

    expect(ref.current?.isDirty()).toBe(true);
    expect(onFormDirty).toHaveBeenLastCalledWith(true);
  });

  it('resets to the defaults without data', () => {
    const { ref, hook } = setup();

    act(() => hook.result.current.setValue('client_id', 'typed'));
    act(() => ref.current?.reset());

    expect(hook.result.current.getValues('client_id')).toBe('');
  });

  it('resets to the given data and makes it the new baseline', () => {
    const { ref, hook } = setup();

    act(() => ref.current?.reset({ ...defaults, client_id: 'saved' }));
    act(() => hook.result.current.setValue('client_id', 'typed'));
    act(() => ref.current?.reset());

    expect(hook.result.current.getValues('client_id')).toBe('saved');
  });

  it('uses custom getData and reset when provided', () => {
    const getData = vi.fn(() => ({ ...defaults, client_id: 'custom' }));
    const reset = vi.fn();
    const { ref } = setup({ getData, reset });

    expect(ref.current?.getData().client_id).toBe('custom');
    act(() => ref.current?.reset(defaults));

    expect(reset).toHaveBeenCalledWith(expect.anything(), defaults);
  });
});

describe('useStrategyConfigureForm validation mode', () => {
  it('validates on touch by default', () => {
    const ref = React.createRef<StrategyConfigureFormHandle<Values>>();
    const { result } = renderHook(() =>
      useStrategyConfigureForm<Values>(ref, { strategy: 'oidc', defaultValues: defaults }),
    );

    expect(result.current.control._options.mode).toBe('onTouched');
  });

  it('keeps an explicit undefined mode (react-hook-form default)', () => {
    const ref = React.createRef<StrategyConfigureFormHandle<Values>>();
    const { result } = renderHook(() =>
      useStrategyConfigureForm<Values>(ref, {
        strategy: 'oidc',
        defaultValues: defaults,
        mode: undefined,
      }),
    );

    expect(result.current.control._options.mode).toBeUndefined();
  });
});

describe('parseStrategyConfigureValues', () => {
  it('returns the raw values when they do not pass the schema', () => {
    const raw = { ...defaults };

    expect(parseStrategyConfigureValues('oidc', raw)).toBe(raw);
  });
});
