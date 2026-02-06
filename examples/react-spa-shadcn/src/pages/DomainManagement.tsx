import { useTranslation } from 'react-i18next';

const DomainManagement = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('domain-management.title')}
      </h1>
      <p>
        Follow{' '}
        <a
          href="https://github.com/auth0/auth0-ui-components/tree/main/examples/react-spa-shadcn#adding-a-universal-component-with-shadcn"
          target="_blank"
        >
          <u>Quickstart guidance</u>
        </a>{' '}
        on how to add Domain Management component.
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">{/* <DomainTable /> */}</div>
    </div>
  );
};

export default DomainManagement;
