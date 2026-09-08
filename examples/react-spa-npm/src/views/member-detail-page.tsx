// import type { OrganizationMemberDetailTab } from '@auth0/universal-components-react';
// import { OrganizationMemberDetail } from '@auth0/universal-components-react';
// import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const MemberDetailPage = () => {
  // const navigate = useNavigate();
  // const { user_id } = useParams<{ user_id: string }>();
  // const [searchParams] = useSearchParams();
  // const tab = searchParams.get('tab') as OrganizationMemberDetailTab;
  return (
    <div className="p-6 pt-8 space-y-6">
      <p className="text-primary">
        Follow{' '}
        <a
          href="https://github.com/auth0/auth0-ui-components/tree/main/examples/react-spa-npm#adding-a-universal-component-to-your-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <u>Quickstart guidance</u>
        </a>{' '}
        on how to add Member Detail component.
      </p>
      {/* <OrganizationMemberDetail userId={user_id!} initialTab={tab} onBack={() => navigate('/member-management')} /> */}
    </div>
  );
};

export default MemberDetailPage;
