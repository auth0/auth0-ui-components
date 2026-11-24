import { SsoProviderEdit } from '@auth0/universal-components-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SsoProviderEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const backButtonAction = useMemo(
    () => ({ onClick: () => navigate('/sso-providers') }),
    [navigate],
  );

  return (
    <div className="p-6 pt-8 space-y-6">
      <SsoProviderEdit
        providerId={id!}
        backButton={backButtonAction}
        sso={{
          deleteAction: {
            onAfter: () => {
              navigate('/sso-providers');
            },
          },
          deleteFromOrganizationAction: {
            onAfter: () => {
              navigate('/sso-providers');
            },
          },
        }}
      />
    </div>
  );
};

export default SsoProviderEditPage;
