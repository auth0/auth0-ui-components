/**
 * Test Utilities
 */

import type { CoreClientInterface } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { createMockI18nService } from './__mocks__/core/i18n-service.mocks';

// ===== Types =====

/**
 * Type for a module namespace that can be spied upon
 * Uses a more specific type that works with vi.spyOn without requiring 'any'
 */
type SpyableModule = {
  [K in string]: (...args: never[]) => unknown;
};

// ===== Mock Generators =====

export const createMockUseCoreClient = (coreClient: CoreClientInterface | null = null) => ({
  coreClient,
});

export const createMockUseTranslator = (_customMessages?: object) => ({
  t: createMockI18nService().translator('idp_management.notifications'),
  changeLanguage: vi.fn(),
  currentLanguage: 'en',
  fallbackLanguage: 'en',
});

export const createMockUseErrorHandler = (handleError: ReturnType<typeof vi.fn>) => ({
  handleError,
});

// ===== Setup Utilities =====

/**
 * Sets up a mock for useCoreClient hook with a valid core client.
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
 */
export function setupMockUseCoreClientNull(useCoreClientModule: SpyableModule): void {
  vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue(createMockUseCoreClient(null));
}

/**
 * Sets up a mock for useTranslator hook with optional custom messages.
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
