// import { OrganizationMemberDetail } from '@auth0/universal-components-react';
// import { useNavigate, useParams } from 'react-router-dom';

const MemberDetailPage = () => {
  return (
    <div className="p-6 pt-8 space-y-6">
      <p className="text-primary">
        Follow{' '}
        <a
          href="https://github.com/auth0/auth0-ui-components/tree/main/examples/react-spa-npm#adding-a-universal-component-to-your-app"
          target="_blank"
        >
          <u>Quickstart guidance</u>
        </a>{' '}
        on how to add Member Detail component.
      </p>
      {/* <OrganizationMemberDetail userId={user_id!} onBack={() => navigate('/member-management')} /> */}
    </div>
  );
};

export default MemberDetailPage;
