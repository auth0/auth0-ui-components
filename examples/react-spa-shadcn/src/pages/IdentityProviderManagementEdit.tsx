import { useNavigate, useParams } from 'react-router-dom';

import { SsoProviderEdit } from '@/auth0-ui-components/blocks/my-org/idp-management/sso-provider-edit';

const IdentityProviderManagementEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-red-600">Provider ID is required</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <SsoProviderEdit
        providerId={id}
        backButton={{
          onClick: () => navigate('/idp-management'),
        }}
        sso={{
          deleteAction: {
            onAfter: () => {
              // Navigate back to IDP management after deletion
              navigate('/idp-management');
            },
          },
          deleteFromOrgAction: {
            onAfter: () => {
              // Navigate back to IDP management after removal
              navigate('/idp-management');
            },
          },
        }}
      />
    </div>
  );
};

export default IdentityProviderManagementEdit;
