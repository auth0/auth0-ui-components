'use client';

import { SsoProviderEdit } from '@auth0/web-ui-components-react/rwa';
import { useRouter, useParams } from 'next/navigation';
import { useCallback } from 'react';

export default function SsoProviderEditPage() {
  const router = useRouter();
  const params = useParams();
  const idpId = params.idpId as string;

  const handleBack = useCallback((): void => {
    router.push('/idp-management/');
  }, [router]);

  return (
    <div className="p-6 pt-8 space-y-6">
      <SsoProviderEdit
        providerId={idpId!}
        sso={{
          deleteAction: {
            onAfter: () => {
              router.push('/idp-management/');
            },
          },
          deleteFromOrgAction: {
            onAfter: () => {
              router.push('/idp-management/');
            },
          },
        }}
        backButton={{ onClick: handleBack }}
      />
    </div>
  );
}
