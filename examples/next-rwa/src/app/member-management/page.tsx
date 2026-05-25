'use client';

// import { OrganizationMemberManagement } from '@auth0/universal-components-react';
// import { useRouter } from 'next/navigation';

export default function MemberManagementPage() {
  // const router = useRouter();
  return (
    <div className="p-6 pt-8 space-y-6">
      <p className="text-primary">
        Follow{' '}
        <a
          href="https://github.com/auth0/auth0-ui-components/tree/main/examples/next-rwa#adding-a-universal-component-to-your-app"
          target="_blank"
        >
          <u>Quickstart guidance</u>
        </a>{' '}
        on how to add Member Management component.
      </p>
      {/* <OrganizationMemberManagement
        viewMemberDetailsAction={{
          onAfter: (userId) => {
            router.push(`/member-management/${userId}`);
          },
        }}
      /> */}
    </div>
  );
}
