/**
 * Helper text with an optional external "Where do I find…?" link.
 * @module sso-help-text
 * @internal
 */

import { Link } from '@/components/ui/link';
import { useTranslator } from '@/hooks/shared/use-translator';

export interface SsoHelpTextProps {
  messageKey: string;
  href?: string;
  linkKey?: string;
  customMessages?: Partial<Record<string, unknown>>;
}

/**
 * Renders a field's helper text; when `href` is given the `<link>` part opens it in a new tab.
 * @param props - Component props.
 * @param props.messageKey - Helper text message key.
 * @param props.href - Help URL.
 * @param props.linkKey - React key of the link.
 * @param props.customMessages - Custom translation messages.
 * @returns Helper text.
 */
export function SsoHelpText({ messageKey, href, linkKey, customMessages = {} }: SsoHelpTextProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  if (!href) {
    return <>{t(messageKey)}</>;
  }

  return (
    <>
      {t.trans(messageKey, {
        components: {
          link: (children: string) => (
            <Link key={linkKey} href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </Link>
          ),
        },
      })}
    </>
  );
}
