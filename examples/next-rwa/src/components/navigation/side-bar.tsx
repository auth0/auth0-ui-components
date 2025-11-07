'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { User, Building, Shield, Settings } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export const Sidebar: React.FC = () => {
  const { user } = useUser();
  return (
    user && (
      <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg pt-4 h-full">
        <div className="p-4 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                My Account
              </h3>
            </div>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/mfa"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                >
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Multi-Factor Authentication</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* My Organization Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <Building className="h-4 w-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                My Organization
              </h3>
            </div>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/org-management"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Organization Management</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/idp-management"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">IDP Management</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/domain-management"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Domain Management</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  );
};
