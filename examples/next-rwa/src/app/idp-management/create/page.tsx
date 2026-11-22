'use client';

import { SsoProviderCreate } from '@auth0/universal-components-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export default function SsoProviderCreatePage() {
  const router = useRouter();

  const handleCreate = useCallback((): void => {
    router.push('/idp-management/');
  }, [router]);

  const handleBack = useCallback((): void => {
    router.push('/idp-management');
  }, [router]);

  const handleGuidedComplete = useCallback(
    (provider: { id?: string }): void => {
      router.push(provider.id ? `/idp-management/edit/${provider.id}` : '/idp-management/');
    },
    [router],
  );

  const guidedSetup = useMemo(() => ({ onComplete: handleGuidedComplete }), [handleGuidedComplete]);

  const createAction = useMemo(
    () => ({
      onAfter: handleCreate,
    }),
    [handleCreate],
  );

  return (
    <div className="p-6 pt-8 space-y-6">
      <SsoProviderCreate
        createAction={createAction}
        guidedSetup={guidedSetup}
        backButton={{ onClick: handleBack }}
      />
    </div>
  );
}
