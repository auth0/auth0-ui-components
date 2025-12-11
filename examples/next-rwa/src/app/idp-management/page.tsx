'use client';

import { SsoProviderTable, type IdentityProvider } from '@auth0/universal-components-react/rwa';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export default function IdpManagementPage() {
  const router = useRouter();
  const handleCreate = useCallback((): void => {
    router.push('/idp-management/create/');
  }, [router]);

  const handleEdit = useCallback(
    (provider: IdentityProvider): void => {
      router.push(`/idp-management/edit/${provider.id}`);
    },
    [router],
  );

  const createAction = useMemo(
    () => ({
      onAfter: handleCreate,
      disabled: false,
    }),
    [handleCreate],
  );

  const editAction = useMemo(
    () => ({
      onAfter: handleEdit,
      disabled: false,
    }),
    [handleEdit],
  );

  return (
    <div className="p-6 pt-8 space-y-6">
      <SsoProviderTable createAction={createAction} editAction={editAction} />
    </div>
  );
}
