import { useNavigate } from 'react-router-dom';

import { SsoProviderCreate } from '@/auth0-ui-components/blocks/my-org/idp-management/sso-provider-create';

const IdentityProviderManagementCreate = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <SsoProviderCreate
        backButton={{
          onClick: () => navigate('/idp-management'),
        }}
        createAction={{
          onAfter: () => {
            // Navigate back to IDP management after successful creation
            navigate('/idp-management');
          },
        }}
      />
    </div>
  );
};

export default IdentityProviderManagementCreate;
