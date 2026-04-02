import { OrganizationMemberDetail } from '@auth0/universal-components-react/spa';
import { useNavigate, useParams } from 'react-router-dom';

const MemberDetailPage = () => {
  const navigate = useNavigate();
  const { user_id } = useParams<{ user_id: string }>();

  return (
    <div className="p-6 pt-8">
      <OrganizationMemberDetail userId={user_id!} onBack={() => navigate('/member-management')} />
    </div>
  );
};

export default MemberDetailPage;
