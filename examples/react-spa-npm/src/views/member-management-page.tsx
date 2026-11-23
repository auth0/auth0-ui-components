import { OrganizationMemberManagement } from '@auth0/universal-components-react';
import { useNavigate } from 'react-router-dom';

const MemberManagementPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 pt-8 space-y-6">
      <OrganizationMemberManagement
        viewMemberDetailsAction={{
          onAfter: ({ userId, tab }) => {
            navigate(`/member-management/${userId}${tab ? `?tab=${tab}` : ''}`);
          },
        }}
      />
    </div>
  );
};

export default MemberManagementPage;
