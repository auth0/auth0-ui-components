import { useAuth0 } from '@auth0/auth0-react';
import { UserMFAMgmt } from '@auth0/web-ui-components-react';
import React, { useState } from 'react';

import { MockUserMFAMgmt } from './MockUserMFAMgmt';

export function ComponentDemo() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  // Temporarily disable mock version will remove this flag when needed
  const ENABLE_MOCK_VERSION = false;

  const [config, setConfig] = useState(() => {
    // Load persisted settings from localStorage
    const savedConfig = localStorage.getItem('mfa-demo-config');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch {
        // If parsing fails, use defaults
      }
    }
    return {
      hideHeader: false,
      showActiveOnly: false,
      smsEnabled: true,
      otpEnabled: true,
      emailEnabled: true,
      pushEnabled: true,
      useMockData: false,
      useCustomValidation: false,
    };
  });

  // Save config to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('mfa-demo-config', JSON.stringify(config));
  }, [config]);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Live Demo */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h4 className="text-sm font-medium text-gray-700">Live Demo</h4>
          </div>
        </div>
        <div className="border rounded p-4 bg-white">
          {/* Mock version disabled - keeping code for potential re-enable */}
          {ENABLE_MOCK_VERSION && config.useMockData ? (
            // Mock version code (disabled)
            <MockUserMFAMgmt
              hideHeader={config.hideHeader}
              showActiveOnly={config.showActiveOnly}
              factorConfig={{
                sms: { enabled: config.smsEnabled, visible: true },
                otp: { enabled: config.otpEnabled, visible: true },
                email: { enabled: config.emailEnabled, visible: true },
                'push-notification': { enabled: config.pushEnabled, visible: true },
              }}
              localization={{
                title: 'Multi-Factor Authentication methods',
                description: 'Extra protection for your account and your identity',
              }}
              schemaValidation={
                config.useCustomValidation
                  ? {
                      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      phone: /^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/,
                    }
                  : undefined
              }
            />
          ) : isAuthenticated ? (
            <UserMFAMgmt
              hideHeader={config.hideHeader}
              showActiveOnly={config.showActiveOnly}
              factorConfig={{
                sms: { enabled: config.smsEnabled, visible: true },
                otp: { enabled: config.otpEnabled, visible: true },
                email: { enabled: config.emailEnabled, visible: true },
                'push-notification': { enabled: config.pushEnabled, visible: true },
              }}
              customMessages={{
                title: 'Multi-Factor Authentication methods',
                description: 'Extra protection for your account and your identity',
              }}
              schema={
                config.useCustomValidation
                  ? {
                      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      phone: /^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="text-center py-12 px-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">
                Sign in to interact with the live Multi-Factor Authentication component.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() =>
                    loginWithRedirect({
                      appState: { returnTo: window.location.pathname + window.location.hash },
                    })
                  }
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </button>
                {/* Mock data option disabled */}
                {ENABLE_MOCK_VERSION && (
                  <div>
                    <button
                      onClick={() => setConfig({ ...config, useMockData: true })}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Switch to Mock Data Demo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Demo Controls</h4>

        {/* Component Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.hideHeader}
              onChange={(e) => setConfig({ ...config, hideHeader: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Hide Header</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.showActiveOnly}
              onChange={(e) => setConfig({ ...config, showActiveOnly: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Show Active Only</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.smsEnabled}
              onChange={(e) => setConfig({ ...config, smsEnabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">SMS Enabled</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.otpEnabled}
              onChange={(e) => setConfig({ ...config, otpEnabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">OTP Enabled</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.emailEnabled}
              onChange={(e) => setConfig({ ...config, emailEnabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Email Enabled</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.pushEnabled}
              onChange={(e) => setConfig({ ...config, pushEnabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Push Notification Enabled</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.useCustomValidation}
              onChange={(e) => setConfig({ ...config, useCustomValidation: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Custom Validation</span>
          </label>
        </div>

        {config.useCustomValidation && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Custom Validation Active:</strong> Email must be a standard format, and phone
              numbers must be US format (+1XXXXXXXXXX).
            </p>
          </div>
        )}
      </div>

      {/* Generated Code */}
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <div className="text-xs text-gray-400 mb-2">Generated Code:</div>
        <pre className="text-sm">
          <code>{`<UserMFAMgmt${config.hideHeader ? '\n  hideHeader={true}' : ''}${config.showActiveOnly ? '\n  showActiveOnly={true}' : ''}
  factorConfig={{
    sms: { enabled: ${config.smsEnabled} },
    otp: { enabled: ${config.otpEnabled} },
    email: { enabled: ${config.emailEnabled} },
    'push-notification': { enabled: ${config.pushEnabled} }
  }}
  customMessages={{
    title: 'Multi-Factor Authentication methods',
    description: 'Extra protection for your account...'
  }}${config.useCustomValidation ? '\n  schema={{\n    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/,\n    phone: /^\\+1[2-9]\\d{2}[2-9]\\d{2}\\d{4}$/\n  }}' : ''}
/>`}</code>
        </pre>
      </div>
    </div>
  );
}
