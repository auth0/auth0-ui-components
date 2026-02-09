import type { CoreClientInterface } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { createMockCoreClient } from './__mocks__/core/core-client.mocks';

const { mockedShowToast, mockedSetGlobalToastSettings, mockCoreClientRef, mockCreateCoreClientFn } =
  vi.hoisted(() => ({
    mockedShowToast: vi.fn(),
    mockedSetGlobalToastSettings: vi.fn(),
    mockCoreClientRef: { current: null as CoreClientInterface | null },
    mockCreateCoreClientFn: { current: null as ReturnType<typeof vi.fn> | null },
  }));

vi.mock('@/components/auth0/shared/toast', () => ({
  showToast: mockedShowToast,
  setGlobalToastSettings: mockedSetGlobalToastSettings,
}));

vi.mock('@auth0/universal-components-core', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...(actual as Record<string, unknown>),
    getComponentStyles: vi.fn((styling) =>
      styling
        ? styling
        : {
            variables: {},
            classes: {},
          },
    ),
    createCoreClient: vi.fn((...args: unknown[]) => {
      if (mockCreateCoreClientFn.current) {
        return mockCreateCoreClientFn.current(...args);
      }
      if (!mockCoreClientRef.current) {
        mockCoreClientRef.current = createMockCoreClient();
      }
      return mockCoreClientRef.current;
    }),
  };
});

export const mockToast = () => {
  return { mockedShowToast };
};

export const mockCore = () => {
  mockCreateCoreClientFn.current = null;

  if (!mockCoreClientRef.current) {
    mockCoreClientRef.current = createMockCoreClient();
  }

  return {
    initMockCoreClient: (): CoreClientInterface => {
      mockCoreClientRef.current = createMockCoreClient();
      return mockCoreClientRef.current;
    },
  };
};

export const mockCreateCoreClient = () => {
  const createCoreClientMock = vi.fn();
  mockCreateCoreClientFn.current = createCoreClientMock;

  return { createCoreClient: createCoreClientMock };
};
