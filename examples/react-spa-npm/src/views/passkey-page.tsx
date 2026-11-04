import { UserPasskeyManagement, useUserPasskeyModel } from '@auth0/universal-components-react';

import { CompositionTabs } from '../components/composition-tabs';
import { Button } from '../components/ui/button';

/** Level 2: replace the add button and keep its behavior. */
const NarrowPasskeys = () => (
  <UserPasskeyManagement.Root>
    <UserPasskeyManagement.DefaultLayout
      addAction={
        <UserPasskeyManagement.AddAction
          render={(props, state) => (
            <Button {...props} variant="primary" size="sm">
              {state.pending ? 'Adding…' : 'Add a passkey'}
            </Button>
          )}
        />
      }
    />
  </UserPasskeyManagement.Root>
);

/** Level 3: the add button moves to the page header and each row gets an inline revoke button. */
const StructuralPasskeys = () => (
  <UserPasskeyManagement.Root>
    <UserPasskeyManagement.Header>
      <UserPasskeyManagement.HeaderContent>
        <UserPasskeyManagement.Title />
        <UserPasskeyManagement.Description />
      </UserPasskeyManagement.HeaderContent>
      <UserPasskeyManagement.HeaderActions>
        <UserPasskeyManagement.AddAction render={<Button size="sm">Add a passkey</Button>} />
      </UserPasskeyManagement.HeaderActions>
    </UserPasskeyManagement.Header>

    <UserPasskeyManagement.Section>
      <UserPasskeyManagement.EmptyState />
      <UserPasskeyManagement.List>
        {() => (
          <UserPasskeyManagement.Item>
            <UserPasskeyManagement.ItemIcon />
            <UserPasskeyManagement.ItemDetails>
              <UserPasskeyManagement.ItemName />
              <UserPasskeyManagement.ItemMeta />
            </UserPasskeyManagement.ItemDetails>
            <UserPasskeyManagement.RevokeAction
              render={(props, state) => (
                <Button {...props} variant="outline" size="xs">
                  {state.pending ? 'Revoking…' : 'Revoke'}
                </Button>
              )}
            />
          </UserPasskeyManagement.Item>
        )}
      </UserPasskeyManagement.List>
    </UserPasskeyManagement.Section>
  </UserPasskeyManagement.Root>
);

/**
 * Level 4: the host owns all markup. It must honor `hidden`, `disabled` and `pending`
 * on every action and confirm before revoking.
 */
const HeadlessPasskeys = () => {
  const model = useUserPasskeyModel();
  const add = model.getAddActionProps();

  if (model.isLoading) return <p className="text-sm">Loading…</p>;

  return (
    <div className="space-y-4">
      {!add.hidden && (
        <Button size="sm" onClick={add.onClick} disabled={add.disabled || add.pending}>
          {add.pending ? 'Adding…' : 'Add a passkey'}
        </Button>
      )}

      <ul className="space-y-2">
        {model.passkeys.map((passkey) => {
          const { revokeAction } = model.getItemProps(passkey);
          return (
            <li
              key={passkey.id}
              className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <span className="text-sm">{passkey.name ?? passkey.id}</span>
              {!revokeAction.hidden && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={revokeAction.onClick}
                  disabled={revokeAction.disabled || revokeAction.pending}
                >
                  {revokeAction.pending ? 'Revoking…' : 'Revoke'}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {model.isRevokeModalOpen && (
        <div
          role="alertdialog"
          aria-label="Confirm revoke"
          className="border-border bg-muted flex items-center justify-between gap-3 rounded-lg border p-3"
        >
          <p className="text-sm">Revoke {model.currentPasskey?.name ?? 'this passkey'}?</p>
          <div className="flex gap-2">
            <Button size="xs" onClick={() => void model.handleConfirmRevoke()}>
              Confirm
            </Button>
            <Button size="xs" variant="outline" onClick={() => model.setIsRevokeModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const PasskeyPage = () => {
  return (
    <div className="space-y-6 p-6 pt-8">
      <CompositionTabs
        levels={{
          Default: <UserPasskeyManagement />,
          Narrow: <NarrowPasskeys />,
          Structural: <StructuralPasskeys />,
          Headless: <HeadlessPasskeys />,
        }}
      />
    </div>
  );
};

export default PasskeyPage;
