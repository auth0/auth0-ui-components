/** @internal */
import { useState } from 'react';

import { ActionRow } from './elements/action-row';
import { AuthenticatorCard, getMethodGroup } from './elements/authenticator-card';
import {
  MfaButton,
  MfaDialogDescription,
  MfaDialogHeader,
  MfaDialogTitle,
} from './elements/dialog-elements';

import { RadioGroup } from '@/components/ui/radio-group';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import { useGateKeeperContext } from '@/providers/gate-keeper-context';
import type { MfaStepScreenProps } from '@/types/mfa-step-up-types';

/**
 * After the user picked an authenticator: shows the ones of that method, to confirm or change
 * the pick, and sends the challenge when they go on.
 *
 * @param props - Component props.
 * @param props.snapshot - The flow's snapshot. Its `selected` is the pick, and its options the choices.
 * @param props.machine - The flow's machine. Confirming and cancelling go through it.
 * @returns Confirm step element.
 * @internal
 */
export function ConfirmStep({ snapshot, machine }: MfaStepScreenProps) {
  const { t } = useTranslator('gate_keeper');
  const classes = useGateKeeperContext().mfaStepUp?.classes;
  const [selectedId, setSelectedId] = useState(snapshot.selected?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const group = snapshot.selected ? getMethodGroup(snapshot.selected) : undefined;
  const options = group
    ? snapshot.options.filter((option) => getMethodGroup(option).key === group.key)
    : [];
  // A push is only sent when it can be approved here. Otherwise the user reads a code from the app.
  const sendsPush = group?.key === 'push' && !!snapshot.push?.canApprove;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await machine.next(selectedId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MfaDialogHeader>
        <MfaDialogTitle>{t('mfa.title')}</MfaDialogTitle>
        <MfaDialogDescription>
          {sendsPush ? t('mfa.confirm.push_description') : t('mfa.subtitle')}
        </MfaDialogDescription>
      </MfaDialogHeader>
      {group && (
        <RadioGroup
          value={selectedId}
          onValueChange={setSelectedId}
          disabled={isSubmitting}
          aria-label={t(`mfa.confirm.method.${group.key}`)}
        >
          <section
            className={cn('space-y-2 rounded-xl bg-muted p-3', classes?.['MfaStepUp-methodGroup'])}
          >
            <h3
              className={cn(
                'flex items-center gap-2 px-1 text-sm font-medium',
                classes?.['MfaStepUp-methodGroupTitle'],
              )}
            >
              <group.icon className="size-4" />
              {t(`mfa.confirm.method.${group.key}`)}
            </h3>
            {options.map((option) => (
              <AuthenticatorCard key={option.id} option={option} />
            ))}
          </section>
        </RadioGroup>
      )}
      <ActionRow>
        <MfaButton
          variant="primary"
          onClick={handleConfirm}
          disabled={!selectedId || isSubmitting}
          aria-label={sendsPush ? t('mfa.confirm.send_push') : t('mfa.confirm.verify_selected')}
        >
          {isSubmitting ? (
            <Spinner size="sm" colorScheme="foreground" />
          ) : sendsPush ? (
            t('mfa.confirm.send_push')
          ) : (
            t('mfa.confirm.verify_selected')
          )}
        </MfaButton>
        <MfaButton
          variant="outline"
          onClick={machine.cancel}
          disabled={isSubmitting}
          aria-label={t('mfa.cancel')}
        >
          {t('mfa.cancel')}
        </MfaButton>
      </ActionRow>
    </>
  );
}
