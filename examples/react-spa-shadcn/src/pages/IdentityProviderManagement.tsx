import { useTranslation } from 'react-i18next';

const IdentityProviderManagement = () => {
  const { t } = useTranslation();
  // const navigate = useNavigate();

  // const handleCreate = () => {
  //   // Navigate to create page or open create modal
  //   navigate('/idp-management/create');
  // };

  // const handleEdit = (provider: IdentityProvider) => {
  //   // Navigate to edit page with provider ID
  //   navigate(`/idp-management/edit/${provider.id}`);
  // };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('identity-provider-management.title')}
      </h1>
      <p>
        Follow{' '}
        <a
          href="https://github.com/auth0/auth0-ui-components/tree/main/examples/react-spa-shadcn#adding-a-universal-component-with-shadcn"
          target="_blank"
        >
          <u>Quickstart guidance</u>
        </a>{' '}
        on how to add Identity Provider Management component.
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* <SsoProviderTable
          createAction={{
            onAfter: handleCreate,
          }}
          editAction={{
            onAfter: handleEdit,
          }}
        /> */}
      </div>
    </div>
  );
};

export default IdentityProviderManagement;
