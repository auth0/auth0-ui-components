import { useNavigate } from 'react-router-dom';

import { SsoProviderCreate } from '@/auth0-ui-components/blocks/my-org/idp-management/sso-provider-create';

const IdentityProviderManagementCreate = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
