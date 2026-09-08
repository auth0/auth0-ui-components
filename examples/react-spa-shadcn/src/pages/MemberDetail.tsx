import { useTranslation } from 'react-i18next';
// import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

// import type { OrganizationMemberDetailTab } from '@/components/auth0/my-organization/organization-member-detail';
// import { OrganizationMemberDetail } from '@/components/auth0/my-organization/organization-member-detail';

const MemberDetail = () => {
  const { t } = useTranslation();
  // const navigate = useNavigate();
  // const { user_id } = useParams<{ user_id: string }>();
  // const [searchParams] = useSearchParams();
  // const tab = searchParams.get('tab') as OrganizationMemberDetailTab;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('member-detail.title')}
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
        on how to add Member Detail component.
      </p>
      <div className="bg-background rounded-lg shadow p-6">
        {/* <OrganizationMemberDetail userId={user_id} initialTab={tab} onBack={() => navigate('/member-management')} /> */}
      </div>
    </div>
  );
};

export default MemberDetail;
