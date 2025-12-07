export { TestProvider, renderWithProviders, renderWithFormProvider } from './test-provider';
export type { TestProviderProps } from './test-provider';

// Global test setup utilities
export { mockToast, mockCore } from './test-setup';

// Test utilities - mock generators and setup functions
export {
  createMockUseCoreClient,
  createMockUseTranslator,
  createMockUseErrorHandler,
  setupMockUseCoreClient,
  setupMockUseCoreClientNull,
  setupMockUseTranslator,
  setupMockUseErrorHandler,
  setupAllCommonMocks,
  setupSSODomainMocks,
  setupToastMocks,
  setupTranslationMocks,
} from './test-utilities';

export * from './__mocks__';
