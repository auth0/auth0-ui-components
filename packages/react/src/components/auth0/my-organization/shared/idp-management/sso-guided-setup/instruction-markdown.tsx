/**
 * `markdown_component` renderer.
 * @module instruction-markdown
 * @internal
 */

import { MarkdownContent } from '@/components/auth0/shared/markdown-content';
import { useGuidedSetupInstructions } from '@/hooks/my-organization/idp-management/sso-guided-setup/use-guided-setup-instructions';
import type { InstructionContentProps } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Renders instruction markdown with `base_url` images and `{{companyName}}`
 * @param props - Component props.
 * @param props.content - Instruction content item.
 * @param props.setup - Guided setup state; picks the instructions to read.
 * @returns JSX element, or `null` without text.
 */
export function InstructionMarkdown({ content, setup }: InstructionContentProps) {
  const { baseUrl, companyName } = useGuidedSetupInstructions(setup.kind, setup.strategy);
  const markdown = content.markdown_component;

  if (!markdown?.text) {
    return null;
  }

  const isNotice = 'variant' in markdown && markdown.variant === 'notice';

  return (
    <MarkdownContent
      text={markdown.text}
      baseUrl={baseUrl}
      values={{ companyName }}
      variant={isNotice ? 'notice' : 'default'}
    />
  );
}
