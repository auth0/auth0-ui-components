import { SsoProviderTable, type IdentityProvider } from '@auth0-web-ui-components/react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const SsoProviderPage = () => {
  const navigate = useNavigate();

  const handleCreate = useCallback(() => {
    console.log('Navigate to create SSO provider page');
    navigate('/sso-provider/create');
  }, []);

  const handleEdit = useCallback((provider: IdentityProvider) => {
    console.log('Navigate to edit SSO provider page', provider);
    // router.push(`/sso-providers/edit/${provider.id}`);
  }, []);

  // Memoize the action objects
  const createAction = useMemo(
    () => ({
      onAfter: handleCreate,
      disabled: false,
    }),
    [handleCreate],
  );

  const editAction = useMemo(
    () => ({
      onAfter: handleEdit,
      disabled: false,
    }),
    [handleEdit],
  );

  return (
    <div className="space-y-6">
      <SsoProviderTable create={createAction} edit={editAction} />
    </div>
  );
};

export default SsoProviderPage;
