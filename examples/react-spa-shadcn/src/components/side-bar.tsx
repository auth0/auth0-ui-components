import { User, Building, Shield, Settings } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { config } from '../config/env';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-black shadow-lg pt-20">
      <div className="p-4 space-y-6">
        {/* My Account Section */}
        {config.features.enableMyAccount && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <User className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                {t('sidebar.my-account')}
              </h3>
            </div>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/mfa"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:text-gray-900 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors cursor-default"
                >
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{t('sidebar.multi-factor-authentication')}</span>
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* My Organization Section */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-2">
            <Building className="h-4 w-4 text-primary flex-shrink-0" />
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
              {t('sidebar.my-organization')}
            </h3>
          </div>
          <ul className="space-y-1">
            <li>
              <Link
                to="/organization-management"
                className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-accent/60 rounded-md transition-colors cursor-default"
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('sidebar.organization-management')}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/idp-management"
                className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-accent/60 rounded-md transition-colors cursor-default"
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('sidebar.identity-provider-management')}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/domain-management"
                className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-accent/60 rounded-md transition-colors cursor-default"
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('sidebar.domain-management')}</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
