'use client';

import { SsoProviderCreate } from '@auth0/universal-components-react/rwa';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export default function SsoProviderCreatePage() {
  const router = useRouter();

  const handleCreate = useCallback((): void => {
    router.push('/idp-management/');
  }, [router]);

  const createAction = useMemo(
    () => ({
      onAfter: handleCreate,
    }),
    [handleCreate],
  );

  return (
    <div className="p-6 pt-8 space-y-6">
      <SsoProviderCreate createAction={createAction} />
    </div>
  );
}
