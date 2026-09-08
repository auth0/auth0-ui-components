'use client';

// import type { OrganizationMemberDetailTab } from '@auth0/universal-components-react';
// import { OrganizationMemberDetail } from '@auth0/universal-components-react';
// import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function MemberDetailPage() {
  // const router = useRouter();
  // const params = useParams();
  // const searchParams = useSearchParams();
  // const user_id = decodeURIComponent(params.user_id as string);
  // const tab = searchParams.get('tab') as OrganizationMemberDetailTab;

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
      {/* <OrganizationMemberDetail
        userId={user_id}
        initialTab={tab}
        onBack={() => router.push('/member-management')}
      /> */}
    </div>
  );
}
