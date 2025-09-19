'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="relative isolate px-6 pt-14 lg:px-8 min-h-screen flex items-center">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              {t('hero-section.title')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              {t('hero-section.description')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="https://auth0.com/docs/quickstart/spa/react/interactive"
                className="px-5 py-2 mt-6 text-sm font-medium leading-5 text-center text-white capitalize bg-slate-900 rounded-lg hover:bg-slate-700 lg:mx-0 lg:w-auto focus:outline-none"
              >
                {t('hero-section.get-started-button')}
              </a>
              <a
                href="https://auth0.com/docs"
                className="px-5 py-2 mt-6 text-sm font-semibold leading-6 text-gray-900 dark:text-white"
              >
                {t('hero-section.learn-more-button')}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
