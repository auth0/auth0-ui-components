import { SsoProviderTable, type IdentityProvider } from '@auth0/universal-components-react/spa';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const SsoProviderPage = () => {
  const navigate = useNavigate();

  const handleCreate = useCallback(() => {
    navigate('/sso-provider/create');
  }, [navigate]);

  const handleEdit = useCallback(
    (provider: IdentityProvider) => {
      navigate(`/sso-provider/edit/${provider.id}`);
    },
    [navigate],
  );

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
      <SsoProviderTable createAction={createAction} editAction={editAction} />
    </div>
  );
};

export default SsoProviderPage;
