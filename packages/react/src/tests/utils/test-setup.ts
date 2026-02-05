import type { CoreClientInterface } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { createMockCoreClient } from './__mocks__/core/core-client.mocks';

export const mockToast = () => {
  const { mockedShowToast } = vi.hoisted(() => ({
    mockedShowToast: vi.fn(),
  }));

  vi.mock('@/components/ui/toast', () => ({
    showToast: mockedShowToast,
  }));

  return { mockedShowToast };
};

export const mockCore = () => {
  let mockCoreClientInstance: CoreClientInterface = createMockCoreClient();

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
      createCoreClient: vi.fn(() => mockCoreClientInstance),
    };
  });

  return {
    initMockCoreClient: (): CoreClientInterface => {
      mockCoreClientInstance = createMockCoreClient();
      return mockCoreClientInstance;
    },
  };
};

export const mockCreateCoreClient = () => {
  const { createCoreClient } = vi.hoisted(() => ({
    createCoreClient: vi.fn(),
  }));

  vi.mock('@auth0/universal-components-core', async (importOriginal) => {
    const actual = await importOriginal();

    return {
      ...(actual as Record<string, unknown>),
      createCoreClient,
    };
  });

  return { createCoreClient };
};
