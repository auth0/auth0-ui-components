/**
 * `markdown_component` renderer.
 * @module instruction-markdown
 * @internal
 */

import { useSsoGuidedSetupContext } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup-context';
import { MarkdownContent } from '@/components/auth0/shared/markdown-content';
import type { InstructionContentProps } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Renders instruction markdown with `base_url` images and `{{companyName}}`; the `notice`
 * variant renders as a callout.
 * @param props - Component props.
 * @param props.content - Instruction content item.
 * @returns JSX element, or `null` without text.
 */
export function InstructionMarkdown({ content }: InstructionContentProps) {
  const { baseUrl, companyName } = useSsoGuidedSetupContext();
  const markdown = content.markdown_component as { text?: string; variant?: 'notice' } | undefined;

  if (!markdown?.text) {
    return null;
  }

  return (
    <MarkdownContent
      text={markdown.text}
      baseUrl={baseUrl}
      values={{ companyName }}
      variant={markdown.variant === 'notice' ? 'notice' : 'default'}
    />
  );
}
