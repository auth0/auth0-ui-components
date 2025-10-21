import { ConfigureSsoForm } from '@auth0-web-ui-components/react';
import { useNavigate } from 'react-router-dom';

const SsoProviderCreatePage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <ConfigureSsoForm
        create={{
          onAfter: () => {
            navigate('/sso-providers');
          },
        }}
        backButton={{
          onClick: () => {
            navigate('/sso-providers');
          },
        }}
      />
    </div>
  );
};

export default SsoProviderCreatePage;
