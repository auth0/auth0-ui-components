import type { OrganizationMemberDetailTab } from '@auth0/universal-components-react';
import { OrganizationMemberDetail } from '@auth0/universal-components-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const MemberDetailPage = () => {
  const navigate = useNavigate();
  const { user_id } = useParams<{ user_id: string }>();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: OrganizationMemberDetailTab | undefined =
    tabParam === 'details' || tabParam === 'roles' ? tabParam : undefined;
  return (
    <div className="p-6 pt-8 space-y-6">
      <OrganizationMemberDetail
        userId={user_id!}
        initialTab={tab}
        onBack={() => navigate('/member-management')}
      />
    </div>
  );
};

export default MemberDetailPage;
