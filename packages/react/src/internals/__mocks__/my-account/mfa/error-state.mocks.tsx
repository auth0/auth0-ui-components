export const createMockMFAErrorStateProps = (overrides = {}) => ({
  title: 'Something went wrong',
  description: 'An error occurred while processing your request',
  className: '',
  ...overrides,
});
