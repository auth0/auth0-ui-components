/** @internal */
import type { MfaOption } from '@auth0/universal-components-core';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Asterisk, Bell, CreditCard, MailOpen, MessageSquareText, ShieldCheck } from 'lucide-react';
import type { ComponentType } from 'react';

import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import { useGateKeeperContext } from '@/providers/gate-keeper-context';

export interface MethodGroup {
  key: string;
  factors: string[];
  icon: ComponentType<{ className?: string }>;
}

export const METHOD_GROUPS: MethodGroup[] = [
  { key: 'otp', factors: ['otp'], icon: Asterisk },
  { key: 'push', factors: ['push'], icon: Bell },
  { key: 'phone', factors: ['sms', 'voice'], icon: MessageSquareText },
  { key: 'email', factors: ['email'], icon: MailOpen },
  { key: 'recovery', factors: ['recovery-code'], icon: CreditCard },
];

export const OTHER_GROUP: MethodGroup = { key: 'other', factors: [], icon: ShieldCheck };

/**
 * @param option - An authenticator the user can answer with.
 * @returns The group of methods it belongs to.
 */
export const getMethodGroup = (option: MfaOption): MethodGroup =>
  METHOD_GROUPS.find(({ factors }) => factors.includes(option.factor)) ?? OTHER_GROUP;

const formatDate = (iso?: string) => {
  const date = iso ? new Date(iso) : undefined;
  if (!date || Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * One authenticator, to pick inside a radio group: its name, and when it was last used or added.
 *
 * @param props - Component props.
 * @param props.option - The authenticator.
 * @returns A radio card.
 * @internal
 */
export function AuthenticatorCard({ option }: { option: MfaOption }) {
  const { t } = useTranslator('gate_keeper');
  const classes = useGateKeeperContext().mfaStepUp?.classes;
  const group = getMethodGroup(option);
  const { name, lastAuth, createdAt } = option.authenticator ?? {};

  let title = name ?? t(`mfa.method.${group.key}`);
  if (group.key === 'phone') {
    const digits = name?.replace(/\D/g, '').slice(-4);
    title = digits ? t('mfa.ending_in', { digits }) : title;
  } else if (group.key === 'recovery') {
    title = t('mfa.method.recovery');
  }

  const lastUsed = formatDate(lastAuth);
  const added = formatDate(createdAt);
  let subtitle: string | undefined;
  if (lastUsed) subtitle = t('mfa.last_used_on', { date: lastUsed });
  else if (added) subtitle = t('mfa.added_on', { date: added });

  return (
    <RadioGroupPrimitive.Item
      value={option.id}
      className={cn(
        'focus-visible:ring-ring block w-full cursor-pointer rounded-xl border border-border bg-card p-4 text-left data-[state=checked]:border-foreground data-[state=checked]:ring-1 data-[state=checked]:ring-foreground focus-visible:ring-2 disabled:cursor-not-allowed',
        classes?.['MfaStepUp-card'],
      )}
    >
      <span className="block font-semibold">{title}</span>
      {subtitle && <span className="block text-sm text-muted-foreground">{subtitle}</span>}
    </RadioGroupPrimitive.Item>
  );
}
