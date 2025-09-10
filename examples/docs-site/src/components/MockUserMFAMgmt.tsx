import { UserMFAMgmt, Auth0ComponentProvider } from '@auth0-web-ui-components/react';
import React from 'react';

// Mock MFA data matching the exact Authenticator interface from the core service
const getInitialMockFactors = () => {
  // Try to load from localStorage first
  const savedFactors = localStorage.getItem('mock-mfa-factors');
  if (savedFactors) {
    try {
      return JSON.parse(savedFactors);
    } catch (error) {
      console.warn('Failed to parse saved mock factors, using defaults:', error);
    }
  }

  // Default mock factors
  return [
    {
      id: 'sms|dev_123456789',
      authenticator_type: 'oob' as const,
      oob_channel: ['sms'] as const,
      active: true,
      factorName: 'sms' as const,
      name: '+1 (555) 123-4567',
      phone_number: '+1 (555) 123-4567',
    },
    {
      id: 'totp|dev_987654321',
      authenticator_type: 'otp' as const,
      oob_channel: [] as const,
      active: true,
      factorName: 'totp' as const,
      name: 'Authenticator App',
    },
    {
      id: 'email|dev_567890123',
      authenticator_type: 'oob' as const,
      oob_channel: ['email'] as const,
      active: false,
      factorName: 'email' as const,
      name: 'user@example.com',
      email: 'user@example.com',
    },
    {
      id: 'push-notification|dev_456789012',
      authenticator_type: 'oob' as const,
      oob_channel: ['auth0'] as const,
      active: false,
      factorName: 'push-notification' as const,
      name: 'Push Notification',
    },
  ];
};

let mockMFAFactors = getInitialMockFactors();

// Save mock factors to localStorage whenever they change
const saveMockFactors = () => {
  try {
    localStorage.setItem('mock-mfa-factors', JSON.stringify(mockMFAFactors));
  } catch (error) {
    console.warn('Failed to save mock factors to localStorage:', error);
  }
};

// Reload mock factors from localStorage
const reloadMockFactors = () => {
  const savedFactors = localStorage.getItem('mock-mfa-factors');
  if (savedFactors) {
    try {
      mockMFAFactors = JSON.parse(savedFactors);
    } catch (error) {
      console.warn('Failed to reload mock factors from localStorage:', error);
    }
  }
};

// Reset mock factors to defaults (available globally for debugging)
declare global {
  interface Window {
    resetMockMFAFactors?: () => void;
    cleanupMockInterception?: () => void;
  }
}

window.resetMockMFAFactors = () => {
  localStorage.removeItem('mock-mfa-factors');
  mockMFAFactors = getInitialMockFactors();
  // Force a page refresh to see the changes
  window.location.reload();
};

// Global function to clean up any mock interception
window.cleanupMockInterception = () => {
  if (isMockInterceptionActive) {
    window.fetch = originalFetch;
    isMockInterceptionActive = false;
  }
};

// Store the original fetch to restore later
const originalFetch = window.fetch;
let isMockInterceptionActive = false;

// Set up fetch interception that only intercepts when explicitly needed
const setupMockInterception = () => {
  if (isMockInterceptionActive) {
    return;
  }

  isMockInterceptionActive = true;

  // Set up fetch interception
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // ONLY intercept calls that are specifically for mock-auth proxy
    // This ensures live version works normally
    if (url.includes('/api/mock-auth/')) {
      // Handle userinfo endpoint (authentication check)
      if (url.includes('userinfo')) {
        return new Response(
          JSON.stringify({
            sub: 'demo-user-123',
            email: 'demo@example.com',
            name: 'Demo User',
            email_verified: true,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        );
      }

      // Handle ANY mfa-related GET calls - return mock factors
      if (
        (init?.method === 'GET' || !init?.method) &&
        (url.includes('mfa') || url.includes('authenticators') || url.includes('factors'))
      ) {
        await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay
        return new Response(JSON.stringify(mockMFAFactors), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      // Handle DELETE requests for factor deletion
      if (
        init?.method === 'DELETE' &&
        (url.includes('mfa') || url.includes('authenticators') || url.includes('factors'))
      ) {
        const urlParts = url.split('/');
        const authenticatorId = urlParts[urlParts.length - 1]?.split('?')[0];

        if (authenticatorId) {
          mockMFAFactors = mockMFAFactors.filter((f) => f.id !== authenticatorId);
          saveMockFactors(); // Save to localStorage
        }

        return new Response(JSON.stringify({}), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Handle enrollment for mock-auth
      if (url.includes('mfa/associate') && init?.method === 'POST') {
        const body = init?.body ? JSON.parse(init.body as string) : {};

        // Determine factor type from authenticator_types and oob_channels
        let factorType = 'totp';
        if (body.authenticator_types?.includes('oob')) {
          if (body.oob_channels?.includes('sms')) factorType = 'sms';
          else if (body.oob_channels?.includes('email')) factorType = 'email';
          else if (body.oob_channels?.includes('auth0')) factorType = 'push-notification';
        }

        // Generate a new authenticator ID
        const newId = `${factorType}|dev_${Date.now()}`;

        // Check if this factor type already exists in our mock data
        const existingFactor = mockMFAFactors.find((f) => f.factorName === factorType);

        if (!existingFactor) {
          // Add new factor to mock data (initially inactive) with proper typing
          let newFactor;

          if (factorType === 'sms') {
            newFactor = {
              id: newId,
              authenticator_type: 'oob' as const,
              oob_channel: ['sms'] as const,
              active: false,
              factorName: 'sms' as const,
              phone_number: body.phone_number || '+1234567890',
            };
          } else if (factorType === 'email') {
            newFactor = {
              id: newId,
              authenticator_type: 'oob' as const,
              oob_channel: ['email'] as const,
              active: false,
              factorName: 'email' as const,
              email: body.email || 'user@example.com',
            };
          } else if (factorType === 'push-notification') {
            newFactor = {
              id: newId,
              authenticator_type: 'oob' as const,
              oob_channel: ['auth0'] as const,
              active: false,
              factorName: 'push-notification' as const,
            };
          } else {
            // totp
            newFactor = {
              id: newId,
              authenticator_type: 'otp' as const,
              oob_channel: [] as const,
              active: false,
              factorName: 'totp' as const,
            };
          }

          mockMFAFactors.push(newFactor);
        } else {
          // Update existing factor data if needed
          if (factorType === 'sms' && body.phone_number) {
            existingFactor.phone_number = body.phone_number;
          }
          if (factorType === 'email' && body.email) {
            existingFactor.email = body.email;
          }
        }

        saveMockFactors(); // Save to localStorage after adding factor

        const responses: Record<string, Record<string, unknown>> = {
          sms: { oob_code: 'mock-oob-code-sms', phone_number: body.phone_number || '+1234567890' },
          email: { oob_code: 'mock-oob-code-email', email: body.email || 'user@example.com' },
          'push-notification': { oob_code: 'mock-oob-code-push' },
          totp: {
            secret: 'JBSWY3DPEHPK3PXP',
            barcode_uri:
              'otpauth://totp/Auth0:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Auth0',
          },
        };

        return new Response(JSON.stringify(responses[factorType] || {}), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Handle confirmation for mock-auth
      if (url.includes('oauth/token') && init?.method === 'POST') {
        const body = init?.body ? JSON.parse(init.body as string) : {};

        // Activate the factor based on the oob_code or grant_type
        if (body.oob_code) {
          const factorType = body.oob_code.includes('sms')
            ? 'sms'
            : body.oob_code.includes('email')
              ? 'email'
              : body.oob_code.includes('push')
                ? 'push-notification'
                : 'totp';

          // Find and activate the factor
          const factorIndex = mockMFAFactors.findIndex((f) => f.factorName === factorType);
          if (factorIndex !== -1) {
            mockMFAFactors[factorIndex] = { ...mockMFAFactors[factorIndex], active: true };
            saveMockFactors(); // Save to localStorage after activating
          }
        } else if (
          body.grant_type === 'http://auth0.com/oauth/grant-type/mfa-oob' &&
          body.binding_code
        ) {
          // Digital Guardian (push-notification) confirmation with binding code

          const pushIndex = mockMFAFactors.findIndex((f) => f.factorName === 'push-notification');
          if (pushIndex !== -1) {
            mockMFAFactors[pushIndex] = { ...mockMFAFactors[pushIndex], active: true };
            saveMockFactors(); // Save to localStorage after activating
          }
        } else if (body.grant_type === 'http://auth0.com/oauth/grant-type/mfa-otp') {
          // TOTP confirmation

          const totpIndex = mockMFAFactors.findIndex((f) => f.factorName === 'totp');
          if (totpIndex !== -1) {
            mockMFAFactors[totpIndex] = { ...mockMFAFactors[totpIndex], active: true };
            saveMockFactors(); // Save to localStorage after activating
          }
        }

        return new Response(JSON.stringify({ access_token: 'mock-token', token_type: 'Bearer' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Handle any other mock-auth calls with a generic success response
      return new Response(JSON.stringify({ success: true, message: 'Mock response' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // For ALL other requests (including live Auth0 calls), use original fetch
    return originalFetch(input, init);
  };
};

// Don't initialize mock interception at module load anymore
// It will be controlled by the component instances

interface MockUserMFAMgmtProps {
  hideHeader?: boolean;
  showActiveOnly?: boolean;
  factorConfig?: {
    [key: string]: {
      visible?: boolean;
      enabled?: boolean;
    };
  };
  localization?: {
    title?: string;
    description?: string;
  };
  schemaValidation?: { email?: RegExp; phone?: RegExp };
}

export function MockUserMFAMgmt(props: MockUserMFAMgmtProps) {
  // Set up mock interception when component mounts
  React.useEffect(() => {
    // Ensure the fetch wrapper is installed (idempotent)
    setupMockInterception();

    // Reload latest factors from localStorage
    reloadMockFactors();

    // Note: We don't need cleanup here anymore since the interception
    // only responds to /api/mock-auth/ calls which won't interfere with live version
  }, []);

  // Also run a synchronous check to ensure interception is ready immediately
  React.useMemo(() => {
    setupMockInterception();
  }, []);

  return (
    <div className="relative">
      {/* Mock data indicator */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
          Demo Mode - Mock Data
        </span>
      </div>

      {/* Use the REAL UserMFAMgmt component with proxy mode and intercepted API calls */}
      <Auth0ComponentProvider
        authProxyUrl="/api/mock-auth/"
        i18n={{ currentLanguage: 'en', fallbackLanguage: 'en' }}
      >
        <UserMFAMgmt
          {...props}
          onErrorAction={(error, action) => {
            console.error('🚨 UserMFAMgmt: onErrorAction callback called:', {
              error: error.message,
              action,
              stack: error.stack,
            });
          }}
        />
      </Auth0ComponentProvider>
    </div>
  );
}
