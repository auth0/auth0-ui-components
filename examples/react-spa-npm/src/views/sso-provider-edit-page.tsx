import { SsoProviderEdit } from '@auth0/universal-components-react';
import { useNavigate, useParams } from 'react-router-dom';

const SsoProviderEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <SsoProviderEdit
        providerId={id!}
        backButton={{
          onClick: () => navigate('/sso-providers'),
        }}
        sso={{
          deleteAction: {
            onAfter: () => {
              navigate('/sso-providers');
            },
          },
          deleteFromOrgAction: {
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
