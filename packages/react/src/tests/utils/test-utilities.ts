/**
 * Test Utilities
 */

import type { CoreClientInterface } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';

/**
 * Type for a module namespace that can be spied upon
 * Uses a more specific type that works with vi.spyOn without requiring 'any'
 */
type SpyableModule = {
  [K in string]: (...args: never[]) => unknown;
};

export const createMockUseCoreClient = (coreClient: CoreClientInterface | null = null) => ({
  coreClient,
});

export const createMockUseTranslator = (_customMessages?: object) => ({
  t: createMockI18nService().translator('idp_management.notifications'),
  changeLanguage: vi.fn(),
  currentLanguage: 'en',
  fallbackLanguage: 'en',
});

export const createMockUseErrorHandler = (handleError: ReturnType<typeof vi.fn>) => handleError;

/**
 * Sets up a mock for useCoreClient hook with a valid core client.
 * @param coreClient - Core client instance
 * @param useCoreClientModule - Module containing useCoreClient hook
 */
export function setupMockUseCoreClient(
  coreClient: CoreClientInterface,
  useCoreClientModule: SpyableModule,
): void {
  vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue(
    createMockUseCoreClient(coreClient),
  );
}

/**
 * Sets up a mock for useCoreClient hook that returns null (error scenario).
 * @param useCoreClientModule - Module containing useCoreClient hook
 */
export function setupMockUseCoreClientNull(useCoreClientModule: SpyableModule): void {
  vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue(createMockUseCoreClient(null));
}

/**
 * Sets up a mock for useTranslator hook with optional custom messages.
 * @param useTranslatorModule - Module containing useTranslator hook
 * @param customMessages - Custom translation messages to override defaults
 */
export function setupMockUseTranslator(
  useTranslatorModule: SpyableModule,
  customMessages?: object,
): void {
  vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue(
    createMockUseTranslator(customMessages),
  );
}

/**
 * Sets up a mock for useErrorHandler hook.
 * @param useErrorHandlerModule - Module containing useErrorHandler hook
 * @param handleError - Error handler function
 * @returns Mock error handler function
 */
export function setupMockUseErrorHandler(
  useErrorHandlerModule: SpyableModule,
  handleError?: ReturnType<typeof vi.fn>,
): ReturnType<typeof vi.fn> {
  const errorHandler = handleError || vi.fn();

  vi.spyOn(useErrorHandlerModule, 'useErrorHandler').mockReturnValue(
    createMockUseErrorHandler(errorHandler),
  );

  return errorHandler;
}

/**
 * Sets up all common hook mocks at once for convenience.
 * @param config - Configuration object
 * @param config.coreClient - Core client instance
 * @param config.useCoreClientModule - Module containing useCoreClient hook
 * @param config.useTranslatorModule - Module containing useTranslator hook
 * @param config.useErrorHandlerModule - Module containing useErrorHandler hook
 * @param config.customMessages - Custom translation messages to override defaults
 * @param config.handleError - Error handler function
 * @returns Object with mock error handler
 */
export function setupAllCommonMocks(config: {
  coreClient: CoreClientInterface | null;
  useCoreClientModule: SpyableModule;
  useTranslatorModule: SpyableModule;
  useErrorHandlerModule: SpyableModule;
  customMessages?: object;
  handleError?: ReturnType<typeof vi.fn>;
}): {
  mockHandleError: ReturnType<typeof vi.fn>;
} {
  const {
    coreClient,
    useCoreClientModule,
    useTranslatorModule,
    useErrorHandlerModule,
    customMessages,
    handleError,
  } = config;

  // Setup core client mock
  if (coreClient) {
    setupMockUseCoreClient(coreClient, useCoreClientModule);
  } else {
    setupMockUseCoreClientNull(useCoreClientModule);
  }

  // Setup translator mock
  setupMockUseTranslator(useTranslatorModule, customMessages);

  // Setup error handler mock
  const mockHandleError = setupMockUseErrorHandler(useErrorHandlerModule, handleError);

  return { mockHandleError };
}

/**
 * Sets up mocks specifically for SSO domain functionality.
 * @param config - Configuration object
 * @param config.coreClient - Core client instance
 * @param config.useCoreClientModule - Module containing useCoreClient hook
 * @param config.useTranslatorModule - Module containing useTranslator hook
 * @param config.useErrorHandlerModule - Module containing useErrorHandler hook
 * @param config.customMessages - Custom translation messages to override defaults
 * @returns Object with mock error handler
 */
export function setupSSODomainMocks(config: {
  coreClient: CoreClientInterface | null;
  useCoreClientModule: SpyableModule;
  useTranslatorModule: SpyableModule;
  useErrorHandlerModule: SpyableModule;
  customMessages?: object;
}): {
  mockHandleError: ReturnType<typeof vi.fn>;
} {
  return setupAllCommonMocks({
    ...config,
    handleError: vi.fn(),
  });
}

/**
 * Sets up mocks for toast functionality.
 * @param config - Configuration object
 * @param config.coreClient - Core client instance
 * @param config.useCoreClientModule - Module containing useCoreClient hook
 * @param config.useTranslatorModule - Module containing useTranslator hook
 * @param config.useErrorHandlerModule - Module containing useErrorHandler hook
 * @returns Object with mock error handler
 */
export function setupToastMocks(config: {
  coreClient: CoreClientInterface | null;
  useCoreClientModule: SpyableModule;
  useTranslatorModule: SpyableModule;
  useErrorHandlerModule: SpyableModule;
}): {
  mockHandleError: ReturnType<typeof vi.fn>;
} {
  return setupAllCommonMocks({
    ...config,
    handleError: vi.fn(),
  });
}

/**
 * Sets up mocks for translation functionality.
 * @param config - Configuration object
 * @param config.coreClient - Core client instance
 * @param config.useCoreClientModule - Module containing useCoreClient hook
 * @param config.useTranslatorModule - Module containing useTranslator hook
 * @param config.useErrorHandlerModule - Module containing useErrorHandler hook
 * @param config.customMessages - Custom translation messages to override defaults
 * @returns Object with mock error handler
 */
export function setupTranslationMocks(config: {
  coreClient: CoreClientInterface | null;
  useCoreClientModule: SpyableModule;
  useTranslatorModule: SpyableModule;
  useErrorHandlerModule: SpyableModule;
  customMessages?: object;
}): {
  mockHandleError: ReturnType<typeof vi.fn>;
} {
  return setupAllCommonMocks({
    ...config,
    handleError: vi.fn(),
  });
}
