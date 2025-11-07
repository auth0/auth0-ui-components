import { Shield, Smartphone, Mail, Key, Trash2, Plus } from 'lucide-react';
import React, { useState } from 'react';

interface MockFactor {
  id: string;
  type: 'sms' | 'email' | 'totp' | 'push-notification';
  active: boolean;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface PureMockUserMFAMgmtProps {
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
}

export function PureMockUserMFAMgmt(props: PureMockUserMFAMgmtProps) {
  const [factors, setFactors] = useState<MockFactor[]>([
    {
      id: 'sms-1',
      type: 'sms',
      active: true,
      name: 'SMS Authentication',
      description: '+1 (555) 123-4567',
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      id: 'totp-1',
      type: 'totp',
      active: true,
      name: 'Authenticator App',
      description: 'Google Authenticator, Authy, or similar',
      icon: <Key className="w-5 h-5" />,
    },
    {
      id: 'email-1',
      type: 'email',
      active: false,
      name: 'Email Authentication',
      description: 'user@example.com',
      icon: <Mail className="w-5 h-5" />,
    },
    {
      id: 'push-1',
      type: 'push-notification',
      active: false,
      name: 'Push Notifications',
      description: 'Auth0 Guardian app',
      icon: <Shield className="w-5 h-5" />,
    },
  ]);

  const [enrolling, setEnrolling] = useState<string | null>(null);

  const { hideHeader, showActiveOnly, factorConfig, localization } = props;

  const filteredFactors = factors.filter((factor) => {
    // Apply showActiveOnly filter
    if (showActiveOnly && !factor.active) return false;

    // Apply factorConfig visibility
    const config = factorConfig?.[factor.type];
    if (config?.visible === false) return false;

    return true;
  });

  const handleEnroll = (type: string) => {
    setEnrolling(type);

    // Simulate enrollment process
    setTimeout(() => {
      setFactors((prev) =>
        prev.map((factor) => (factor.type === type ? { ...factor, active: true } : factor)),
      );
      setEnrolling(null);
    }, 2000);
  };

  const handleRemove = (id: string) => {
    setFactors((prev) =>
      prev.map((factor) => (factor.id === id ? { ...factor, active: false } : factor)),
    );
  };

  const isFactorEnabled = (type: string) => {
    const config = factorConfig?.[type];
    return config?.enabled !== false;
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Mock data indicator */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
          Demo Mode - Mock Data
        </span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {!hideHeader && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {localization?.title || 'Multi-Factor Authentication'}
            </h2>
            <p className="text-gray-600">
              {localization?.description ||
                'Secure your account with additional verification methods'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {filteredFactors.map((factor) => (
            <div key={factor.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${factor.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {factor.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{factor.name}</h3>
                    <p className="text-sm text-gray-500">{factor.description}</p>
                    {factor.active && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-1">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {factor.active ? (
                    <button
                      onClick={() => handleRemove(factor.id)}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(factor.type)}
                      disabled={!isFactorEnabled(factor.type) || enrolling === factor.type}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {enrolling === factor.type ? (
                        <>
                          <div className="animate-spin w-3 h-3 mr-1 border border-blue-600 border-t-transparent rounded-full"></div>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Enroll
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFactors.length === 0 && (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No MFA factors available</h3>
            <p className="text-gray-500">
              Configure your factor settings to see available options.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
