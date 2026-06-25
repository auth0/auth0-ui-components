// import { OrganizationMemberManagement } from '@auth0/universal-components-react';
// import { useNavigate } from 'react-router-dom';

const MemberManagementPage = () => {
  // const navigate = useNavigate();

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
        on how to add Member Management component.
      </p>
      {/* <OrganizationMemberManagement
        viewMemberDetailsAction={{
          onAfter: (userId) => {
            navigate(`/member-management/${userId}`);
          },
        }}
      /> */}
    </div>
  );
};

export default MemberManagementPage;
