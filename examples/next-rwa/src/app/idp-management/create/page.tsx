'use client';

import { SsoProviderCreate } from '@auth0/universal-components-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function SsoProviderCreatePage() {
  const router = useRouter();

  const createAction = useMemo(
    () => ({ onAfter: () => router.push('/idp-management/') }),
    [router],
  );

  const completeGuidedSetupAction = useMemo(
    () => ({
      onAfter: (_data: unknown, provider?: { id?: string }) =>
        router.push(provider?.id ? `/idp-management/edit/${provider.id}` : '/idp-management/'),
    }),
    [router],
  );

  const backButtonAction = useMemo(
    () => ({ onClick: () => router.push('/idp-management') }),
    [router],
  );

  return (
    <div className="p-6 pt-8 space-y-6">
      <SsoProviderCreate
        createAction={createAction}
        completeGuidedSetupAction={completeGuidedSetupAction}
        backButton={backButtonAction}
      />
    </div>
  );
}
