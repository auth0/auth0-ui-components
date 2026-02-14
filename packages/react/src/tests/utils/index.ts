export {
  TestProvider,
  renderWithProviders,
  renderWithFormProvider,
  createTestQueryClient,
  createTestQueryClientWrapper as createQueryClientWrapper,
} from '@/tests/utils/test-provider';
export type { TestProviderProps } from '@/tests/utils/test-provider';

// Global test setup utilities
export { mockToast, mockCore, mockCreateCoreClient } from '@/tests/utils/test-setup';

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
} from '@/tests/utils/test-utilities';

export * from './__mocks__';
