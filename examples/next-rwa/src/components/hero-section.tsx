'use client';

import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="relative isolate px-6 lg:px-8 flex items-center">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              {t('hero-section.title')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              {t('hero-section.description')}
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button>
                <a
                  href="https://auth0-ui-components.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-default"
                >
                  {t('hero-section.get-started-button')}
                </a>
              </Button>
              <a
                href="https://auth0.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 text-sm font-semibold leading-6 text-gray-900 dark:text-white"
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
