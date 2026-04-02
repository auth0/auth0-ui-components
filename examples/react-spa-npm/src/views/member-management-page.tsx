import { useNavigate } from 'react-router-dom';

const mockMembers = [
  { user_id: 'auth0|123234235', name: 'Test User', email: 'testuser@example.com' },
  { user_id: 'auth0|987654321', name: 'Jane Smith', email: 'janesmith@example.com' },
  { user_id: 'auth0|567891234', name: 'Alice Johnson', email: 'alicejohnson@example.com' },
];

const MemberManagementPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 pt-8 space-y-6">
      <h2 className="text-xl font-semibold text-primary">Members</h2>
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">User ID</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockMembers.map((member) => (
              <tr key={member.user_id} className="bg-background hover:bg-muted/50">
                <td className="px-4 py-3 font-medium text-primary">{member.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {member.user_id}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => navigate(`/member-management/${member.user_id}`)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberManagementPage;
