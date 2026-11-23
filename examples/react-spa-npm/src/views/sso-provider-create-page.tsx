import { SsoProviderCreate } from '@auth0/universal-components-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const SsoProviderCreatePage = () => {
  const navigate = useNavigate();

  const createAction = useMemo(
    () => ({
      onAfter: () => {
        navigate('/sso-providers');
      },
    }),
    [navigate],
  );

  const completeGuidedSetupAction = useMemo(
    () => ({
      onAfter: (_data: unknown, provider?: { id?: string }) => {
        navigate(provider?.id ? `/sso-provider/edit/${provider.id}` : '/sso-providers');
      },
    }),
    [navigate],
  );

  const backButtonAction = useMemo(
    () => ({ onClick: () => navigate('/sso-providers') }),
    [navigate],
  );

  return (
    <div className="p-6 pt-8 space-y-6">
      <SsoProviderCreate
        createAction={createAction}
        completeGuidedSetupAction={completeGuidedSetupAction}
        backButton={backButtonAction}
      />
    </div>
  );
};

export default SsoProviderCreatePage;
