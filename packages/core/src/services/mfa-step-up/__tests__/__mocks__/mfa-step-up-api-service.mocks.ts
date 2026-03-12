import { vi } from 'vitest';

export const createFetchMock = (ok = true, body: unknown = {}) =>
  vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: vi.fn().mockResolvedValue(body),
  });

export const stubFetch = (ok = true, body: unknown = {}) => {
  const mock = createFetchMock(ok, body);
  vi.stubGlobal('fetch', mock);
  return mock;
};
