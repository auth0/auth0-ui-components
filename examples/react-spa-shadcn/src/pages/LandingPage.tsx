import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      loginWithRedirect();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                {t('hero-section.title')}
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {t('hero-section.description')}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                {isAuthenticated ? (
                  <Link
                    to="/profile"
                    className="rounded-md bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                  >
                    {t('hero-section.get-started-button')}
                  </Link>
                ) : (
                  <button
                    onClick={handleGetStarted}
                    className="rounded-md bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                  >
                    {t('hero-section.get-started-button')}
                  </button>
                )}
                <a
                  href="https://auth0.com/docs"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  {t('hero-section.learn-more-button')} <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
