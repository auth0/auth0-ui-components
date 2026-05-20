'use client';

import { OrganizationMemberDetail } from '@auth0/universal-components-react';
import { useRouter, useParams } from 'next/navigation';

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const user_id = decodeURIComponent(params.user_id as string);

  return (
    <div className="p-6 pt-8">
      <OrganizationMemberDetail userId={user_id} onBack={() => router.push('/member-management')} />
    </div>
  );
}
