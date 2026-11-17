import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const InvitationLoginPage = () => {
  const { loginWithRedirect, isLoading } = useAuth0();
  const [searchParams] = useSearchParams();
  const invitation = searchParams.get('invitation');
  const organization = searchParams.get('organization');
  const connection = searchParams.get('connection');
  const started = useRef(false);

  useEffect(() => {
    if (isLoading || started.current || !organization) return;
    started.current = true;
    void loginWithRedirect({
      authorizationParams: {
        organization,
        ...(invitation ? { invitation } : {}),
        ...(connection ? { connection } : {}),
      },
    });
  }, [isLoading, invitation, organization, connection, loginWithRedirect]);

  if (!organization) {
    return (
      <div className="p-8 text-center text-gray-600">Invalid login link: missing organization.</div>
    );
  }

  return <div className="p-8 text-center text-gray-600">Redirecting to sign in...</div>;
};

export default InvitationLoginPage;
