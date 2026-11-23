/** @internal */
import type { MfaPushPhase } from '@auth0/universal-components-core';
import { Bell, CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import { ActionRow } from './elements/action-row';
import {
  MfaButton,
  MfaDialogDescription,
  MfaDialogHeader,
  MfaDialogTitle,
  MfaLink,
} from './elements/dialog-elements';

import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import { useGateKeeperContext } from '@/providers/gate-keeper-context';
import type { MfaStepScreenProps } from '@/types/mfa-step-up-types';

const PHASE_ICONS: Record<
  Exclude<MfaPushPhase, 'waiting'>,
  { icon: ComponentType<{ className?: string }>; className: string }
> = {
  approved: { icon: CircleCheck, className: 'bg-success/15 text-success' },
  denied: { icon: CircleAlert, className: 'bg-destructive/15 text-destructive' },
  expired: { icon: TriangleAlert, className: 'bg-warning/15 text-warning' },
};

/**
 * @param props - Component props.
 * @param props.phase - Which answer to a push the icon stands for.
 * @returns A round icon.
 * @internal
 */
function PhaseIcon({ phase }: { phase: Exclude<MfaPushPhase, 'waiting'> }) {
  const { icon: Icon, className } = PHASE_ICONS[phase];
  const classes = useGateKeeperContext().mfaStepUp?.classes;
  return (
    <span
      className={cn(
        'mx-auto flex size-12 items-center justify-center rounded-full',
        className,
        classes?.['MfaStepUp-statusIcon'],
      )}
    >
      <Icon className="size-6" />
    </span>
  );
}

/**
 * @param props - Component props.
 * @param props.title - What the dialog is about.
 * @param props.description - Why, in a sentence.
 * @param props.children - What the user can do.
 * @returns A centered message.
 * @internal
 */
function PushMessage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6 text-center">
      <MfaDialogHeader className="items-center text-center">
        {children}
        <MfaDialogTitle>{title}</MfaDialogTitle>
        <MfaDialogDescription>{description}</MfaDialogDescription>
      </MfaDialogHeader>
    </div>
  );
}

/**
 * The push notification step of a challenge: waiting for the user to approve it on their device,
 * and what to do when they approved it, denied it, or let it expire.
 *
 * @param props - Component props.
 * @param props.snapshot - The flow's snapshot. Its `push` says which phase this is.
 * @param props.machine - The flow's machine.
 * @returns Push challenge element.
 * @internal
 */
export function PushChallenge({ snapshot, machine }: MfaStepScreenProps) {
  const { t } = useTranslator('gate_keeper');
  const classes = useGateKeeperContext().mfaStepUp?.classes;
  const device = snapshot.selected?.authenticator?.name;
  const phase = snapshot.push?.phase ?? 'waiting';

  const anotherMethod = snapshot.canChooseAnotherFactor ? (
    <MfaButton type="button" variant="outline" onClick={machine.chooseAnotherFactor}>
      {t('mfa.challenge.use_another_method')}
    </MfaButton>
  ) : (
    <MfaButton type="button" variant="outline" onClick={machine.cancel}>
      {t('mfa.cancel')}
    </MfaButton>
  );

  if (phase === 'approved') {
    return (
      <PushMessage
        title={t('mfa.challenge.push_approved_title')}
        description={t('mfa.challenge.push_approved_description')}
      >
        <PhaseIcon phase="approved" />
      </PushMessage>
    );
  }

  if (phase === 'denied') {
    return (
      <div className="space-y-6">
        <PushMessage
          title={t('mfa.challenge.push_denied_title')}
          description={
            device
              ? t('mfa.challenge.push_denied_description', { device })
              : t('mfa.challenge.push_denied_description_generic')
          }
        >
          <PhaseIcon phase="denied" />
        </PushMessage>
        <ActionRow className="justify-center">
          <MfaButton type="button" variant="primary" onClick={machine.resend}>
            {t('mfa.challenge.push_try_again')}
          </MfaButton>
          {anotherMethod}
        </ActionRow>
      </div>
    );
  }

  if (phase === 'expired') {
    return (
      <div className="space-y-6">
        <PushMessage
          title={t('mfa.challenge.push_expired_title')}
          description={t('mfa.challenge.push_expired_description')}
        >
          <PhaseIcon phase="expired" />
        </PushMessage>
        <ActionRow className="justify-center">
          <MfaButton type="button" variant="primary" onClick={machine.resend}>
            {t('mfa.challenge.push_resend')}
          </MfaButton>
          {anotherMethod}
        </ActionRow>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PushMessage
        title={t('mfa.challenge.push_waiting_title')}
        description={
          device
            ? t('mfa.challenge.push_waiting_description', { device })
            : t('mfa.challenge.push_waiting_description_generic')
        }
      />
      <div
        className={cn(
          'flex items-center justify-center gap-2 text-sm text-muted-foreground',
          classes?.['MfaStepUp-pushStatus'],
        )}
        role="status"
        aria-live="polite"
      >
        <Bell className="size-4" />
        {t('mfa.challenge.push_waiting_status')}
        <Spinner size="sm" colorScheme="muted" />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {t('mfa.challenge.push_not_received')}{' '}
        <MfaLink onClick={machine.resend} className="text-sm">
          {t('mfa.challenge.push_resend')}
        </MfaLink>{' '}
        ·{' '}
        <MfaLink onClick={machine.switchToCode} className="text-sm">
          {t('mfa.challenge.push_enter_code')}
        </MfaLink>
      </p>
      <ActionRow className="justify-center">
        <MfaButton type="button" variant="outline" onClick={machine.cancel}>
          {t('mfa.cancel')}
        </MfaButton>
      </ActionRow>
    </div>
  );
}
