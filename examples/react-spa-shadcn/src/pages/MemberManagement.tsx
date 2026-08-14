import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router-dom';

// import { OrganizationMemberManagement } from '@/components/auth0/my-organization/organization-member-management';

const MemberManagement = () => {
  const { t } = useTranslation();
  // const navigate = useNavigate();

  // const viewMemberDetailsAction = {
  //   onAfter: ({ userId, tab }: { userId: string; tab?: string }) => {
  //     navigate(`/member-management/${userId}${tab ? `?tab=${tab}` : ''}`);
  //   },
  // };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('member-management.title')}
      </h1>
      <p>
        Follow{' '}
        <a
          href="https://github.com/auth0/auth0-ui-components/tree/main/examples/react-spa-shadcn#adding-a-universal-component-with-shadcn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <u>Quickstart guidance</u>
        </a>{' '}
        on how to add Member Management component.
      </p>
      <div className="bg-background rounded-lg shadow p-6">
        {/* <OrganizationMemberManagement viewMemberDetailsAction={viewMemberDetailsAction} /> */}
      </div>
    </div>
  );
};

export default MemberManagement;
