'use client';

import { ConfigureSsoForm } from '@auth0-web-ui-components/react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export default function SsoProviderCreatePage() {
  const router = useRouter();

  const handleCreate = useCallback((): void => {
    router.push('/idp-management/');
  }, []);

  const createAction = useMemo(
    () => ({
      onAfter: handleCreate,
    }),
    [handleCreate],
  );

  return (
    <div className="p-6 pt-8 space-y-6">
      <ConfigureSsoForm create={createAction} />
    </div>
  );
}
