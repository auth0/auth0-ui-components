import { SsoProviderCreate } from '@auth0/universal-components-react/spa';
import { useNavigate } from 'react-router-dom';

const SsoProviderCreatePage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 pt-8 space-y-6">
      <SsoProviderCreate
        createAction={{
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
