export const createMockAuthenticationApiService = () => ({
  mfa: {
    fetchFactors: async () => ({
      sms: [],
      'push-notification': [],
      otp: [],
      email: [],
    }),
    enrollFactor: async () => ({
      type: 'manual_input' as const,
      secret: 'mock-secret',
      barcode: 'mock-barcode',
    }),
    deleteFactor: async () => {},
    confirmEnrollment: async () => ({}),
  },
});
