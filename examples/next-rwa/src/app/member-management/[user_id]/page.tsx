'use client';

// import { OrganizationMemberDetail } from '@auth0/universal-components-react';
// import { useRouter, useParams } from 'next/navigation';

export default function MemberDetailPage() {
  // const router = useRouter();
  // const params = useParams();
  // const user_id = decodeURIComponent(params.user_id as string);

  return (
    <div className="p-6 pt-8">
      <p className="text-primary">
        Follow{' '}
        <a
          href="https://github.com/auth0/auth0-ui-components/tree/main/examples/next-rwa#adding-a-universal-component-to-your-app"
          target="_blank"
        >
          <u>Quickstart guidance</u>
        </a>{' '}
        on how to add Member Detail component.
      </p>
      {/* <OrganizationMemberDetail userId={user_id} onBack={() => router.push('/member-management')} /> */}
    </div>
  );
}
