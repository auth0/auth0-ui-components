import type { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import {
  createRetryUnlessNotFound,
  isNotFoundError,
  nullOnNotFound,
} from '@/lib/utils/shared/query-utils';

const notFound = { body: { status: 404 } };
const serverError = { body: { status: 500 } };

const clientWithRetry = (retry: unknown) =>
  ({ getDefaultOptions: () => ({ queries: { retry } }) }) as unknown as QueryClient;

describe('isNotFoundError', () => {
  it('is true only for a 404 response', () => {
    expect(isNotFoundError(notFound)).toBe(true);
    expect(isNotFoundError(serverError)).toBe(false);
    expect(isNotFoundError(new Error('boom'))).toBe(false);
  });
});

describe('createRetryUnlessNotFound', () => {
  it('never retries a 404', () => {
    const defaultRetry = vi.fn(() => true);
    const retry = createRetryUnlessNotFound(clientWithRetry(defaultRetry));

    expect(retry(0, notFound as unknown as Error)).toBe(false);
    expect(defaultRetry).not.toHaveBeenCalled();
  });

  it('defers other errors to the default retry function', () => {
    const defaultRetry = vi.fn(() => true);
    const error = serverError as unknown as Error;

    expect(createRetryUnlessNotFound(clientWithRetry(defaultRetry))(1, error)).toBe(true);
    expect(defaultRetry).toHaveBeenCalledWith(1, error);
  });

  it('does not retry when the default is not a function', () => {
    const retry = createRetryUnlessNotFound(clientWithRetry(3));

    expect(retry(0, serverError as unknown as Error)).toBe(false);
  });
});

describe('nullOnNotFound', () => {
  it('resolves the response', async () => {
    await expect(nullOnNotFound(Promise.resolve({ ok: true }))).resolves.toEqual({ ok: true });
  });

  it('resolves null on a 404', async () => {
    await expect(nullOnNotFound(Promise.reject(notFound))).resolves.toBeNull();
  });

  it('rethrows any other error', async () => {
    await expect(nullOnNotFound(Promise.reject(serverError))).rejects.toBe(serverError);
  });
});
