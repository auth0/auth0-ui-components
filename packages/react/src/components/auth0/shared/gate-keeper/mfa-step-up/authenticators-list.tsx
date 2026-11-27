/** @internal */
import type { MfaStepUpMachine, MfaStepUpSnapshot } from '@auth0/universal-components-core';
import { useState } from 'react';

import { ActionRow } from './elements/action-row';
import {
  AuthenticatorCard,
  METHOD_GROUPS,
  OTHER_GROUP,
  getMethodGroup,
} from './elements/authenticator-card';
import { MfaButton } from './elements/dialog-elements';

import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';
import { List, ListItem } from '@/components/ui/list';
import { RadioGroup } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { MfaStepUpClasses } from '@/types/mfa-step-up-types';

interface AuthenticatorsListProps {
  snapshot: MfaStepUpSnapshot;
  machine: MfaStepUpMachine;
  classes?: MfaStepUpClasses;
}

const UNKNOWN_FACTOR = 'oob';

/**
 * @param props - Component props.
 * @param props.snapshot - The flow's snapshot. Its options are listed.
 * @param props.machine - The flow's machine. Picking an option and cancelling go through it.
 * @returns Enrollment list element.
 * @internal
 */
function EnrollList({ snapshot, machine, classes }: AuthenticatorsListProps) {
  const { t } = useTranslator('gate_keeper');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const handleSelect = async (optionId: string) => {
    setActiveItemId(optionId);
    try {
      await machine.next(optionId);
    } finally {
      setActiveItemId(null);
    }
  };

  const items = snapshot.options.map((option) => ({
    key: option.id,
    label:
      option.factor === UNKNOWN_FACTOR
        ? option.authenticator?.name
        : t(`mfa.authenticator_type.${option.factor}`),
    buttonLabel: option.kind === 'enroll' ? t('mfa.enroll_button') : t('mfa.verify_button'),
    onSelect: () => handleSelect(option.id),
  }));

  return (
    <div className="space-y-6">
      <List className="flex flex-col gap-3">
        {items.map((item) => (
          <ListItem key={item.key} aria-label={item.label}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-left">{item.label}</CardTitle>
                <CardAction>
                  <MfaButton
                    classes={classes}
                    variant="primary"
                    onClick={item.onSelect}
                    disabled={activeItemId !== null}
                    aria-label={`${item.buttonLabel} ${item.label}`}
                  >
                    {activeItemId === item.key ? (
                      <Spinner size="sm" colorScheme="foreground" />
                    ) : (
                      item.buttonLabel
                    )}
                  </MfaButton>
                </CardAction>
              </CardHeader>
            </Card>
          </ListItem>
        ))}
      </List>
      <Separator />
      <ActionRow classes={classes}>
        <MfaButton
          classes={classes}
          variant="outline"
          onClick={machine.cancel}
          disabled={activeItemId !== null}
          aria-label={t('mfa.cancel')}
        >
          {t('mfa.cancel')}
        </MfaButton>
      </ActionRow>
    </div>
  );
}

/**
 * @param props - Component props.
 * @param props.snapshot - The flow's snapshot. Its options are the authenticators to choose from.
 * @param props.machine - The flow's machine. Continuing and cancelling go through it.
 * @returns Authenticators grouped by method, to pick one from.
 * @internal
 */
function ChallengeList({ snapshot, machine, classes }: AuthenticatorsListProps) {
  const { t } = useTranslator('gate_keeper');
  const [selectedId, setSelectedId] = useState(snapshot.options[0]?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groups = [...METHOD_GROUPS, OTHER_GROUP]
    .map((group) => ({
      ...group,
      options: snapshot.options.filter((option) => getMethodGroup(option) === group),
    }))
    .filter(({ options }) => options.length > 0);

  const handleContinue = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      await machine.next(selectedId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedId}
        onValueChange={setSelectedId}
        disabled={isSubmitting}
        aria-label={t('mfa.verify_title')}
        className="space-y-3"
      >
        {groups.map((group) => (
          <section
            key={group.key}
            className={cn('space-y-2 rounded-xl bg-muted p-3', classes?.['MfaStepUp-methodGroup'])}
          >
            <h3
              className={cn(
                'flex items-center gap-2 px-1 text-sm font-medium',
                classes?.['MfaStepUp-methodGroupTitle'],
              )}
            >
              <group.icon className="size-4" />
              {t(`mfa.method.${group.key}`)}
            </h3>
            {group.options.map((option) => (
              <AuthenticatorCard classes={classes} key={option.id} option={option} />
            ))}
          </section>
        ))}
      </RadioGroup>
      <ActionRow classes={classes}>
        <MfaButton
          classes={classes}
          variant="primary"
          onClick={handleContinue}
          disabled={!selectedId || isSubmitting}
          aria-label={t('mfa.continue')}
        >
          {isSubmitting ? <Spinner size="sm" colorScheme="foreground" /> : t('mfa.continue')}
        </MfaButton>
        <MfaButton
          classes={classes}
          variant="outline"
          onClick={machine.cancel}
          disabled={isSubmitting}
          aria-label={t('mfa.cancel')}
        >
          {t('mfa.cancel')}
        </MfaButton>
      </ActionRow>
    </div>
  );
}

/**
 * @param props - Component props.
 * @param props.snapshot - The flow's snapshot. Its options are listed.
 * @param props.machine - The flow's machine. Picking an option and cancelling go through it.
 * @returns Authenticator list element.
 * @internal
 */
export function AuthenticatorsList({ snapshot, machine, classes }: AuthenticatorsListProps) {
  return snapshot.options[0]?.kind === 'challenge' ? (
    <ChallengeList classes={classes} snapshot={snapshot} machine={machine} />
  ) : (
    <EnrollList classes={classes} snapshot={snapshot} machine={machine} />
  );
}
