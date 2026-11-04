import { UserMFAManagement, useUserMFAModel } from '@auth0/universal-components-react';

import { CompositionTabs } from '../components/composition-tabs';
import { Button } from '../components/ui/button';

/** Level 2: replace the enroll button of every factor and keep its behavior. */
const NarrowMFA = () => (
  <UserMFAManagement.Root>
    <UserMFAManagement.DefaultLayout
      enrollAction={
        <UserMFAManagement.EnrollAction
          render={(props, state) => (
            <Button {...props} variant="primary" size="sm">
              {state.pending ? 'Starting…' : 'Set up'}
            </Button>
          )}
        />
      }
    />
  </UserMFAManagement.Root>
);

/** Level 3: own the header, add host content, drop a factor and draw the enrolled rows. */
const StructuralMFA = () => (
  <UserMFAManagement.Root>
    <UserMFAManagement.Header>
      <UserMFAManagement.HeaderContent>
        <UserMFAManagement.Title />
        <UserMFAManagement.Description />
      </UserMFAManagement.HeaderContent>
      <UserMFAManagement.HeaderActions>
        <a
          href="https://auth0.com/docs/secure/multi-factor-authentication"
          target="_blank"
          rel="noreferrer"
          className="text-sm underline"
        >
          About MFA
        </a>
      </UserMFAManagement.HeaderActions>
    </UserMFAManagement.Header>

    <p className="border-border bg-muted mb-4 rounded-lg border p-3 text-sm">
      Host-owned notice: this text stays visible while the factors load.
    </p>

    <UserMFAManagement.Factors>
      {(factorType) =>
        factorType === 'recovery-code' ? null : (
          <UserMFAManagement.Factor>
            <UserMFAManagement.FactorHeader>
              <UserMFAManagement.FactorTitle />
              <UserMFAManagement.FactorActions>
                <UserMFAManagement.EnrollAction render={<Button size="sm">Set up</Button>} />
              </UserMFAManagement.FactorActions>
            </UserMFAManagement.FactorHeader>
            <UserMFAManagement.FactorList>
              {() => (
                <div className="flex items-center justify-between gap-3">
                  <UserMFAManagement.EnrolledFactorName />
                  <UserMFAManagement.DeleteAction
                    render={(props, state) => (
                      <Button {...props} variant="outline" size="xs">
                        {state.pending ? 'Removing…' : 'Remove'}
                      </Button>
                    )}
                  />
                </div>
              )}
            </UserMFAManagement.FactorList>
          </UserMFAManagement.Factor>
        )
      }
    </UserMFAManagement.Factors>
  </UserMFAManagement.Root>
);

/**
 * Level 4: the host owns all markup. It must honor `hidden`, `disabled` and `pending`
 * on every action and confirm before deleting. Enrollment is a multi-step flow driven by
 * `model.enrollmentPhase`, so this demo lists and removes authenticators only.
 */
const HeadlessMFA = () => {
  const model = useUserMFAModel();

  if (model.isLoadingFactors) return <p className="text-sm">Loading…</p>;

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {model.visibleFactorTypes.flatMap((factorType) =>
          model.getFactorProps(factorType).activeFactors.map((factor) => {
            const { deleteAction } = model.getEnrolledFactorProps(factor, factorType);
            return (
              <li
                key={factor.id}
                className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <span className="text-sm">
                  {factorType}: {factor.name ?? factor.id}
                </span>
                {!deleteAction.hidden && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={deleteAction.onClick}
                    disabled={deleteAction.disabled || deleteAction.pending}
                  >
                    {deleteAction.pending ? 'Removing…' : 'Remove'}
                  </Button>
                )}
              </li>
            );
          }),
        )}
      </ul>

      {model.isDeleteDialogOpen && (
        <div
          role="alertdialog"
          aria-label="Confirm removal"
          className="border-border bg-muted flex items-center justify-between gap-3 rounded-lg border p-3"
        >
          <p className="text-sm">Remove this authenticator?</p>
          <div className="flex gap-2">
            <Button size="xs" onClick={() => void model.handleConfirmDelete()}>
              Confirm
            </Button>
            <Button size="xs" variant="outline" onClick={model.handleCancelDelete}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const MFAPage = () => {
  return (
    <div className="space-y-6 p-6 pt-8">
      <CompositionTabs
        levels={{
          Default: <UserMFAManagement />,
          Narrow: <NarrowMFA />,
          Structural: <StructuralMFA />,
          Headless: <HeadlessMFA />,
        }}
      />
    </div>
  );
};

export default MFAPage;
