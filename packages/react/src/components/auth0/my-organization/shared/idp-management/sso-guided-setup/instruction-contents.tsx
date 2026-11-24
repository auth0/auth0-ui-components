/**
 * Renders instruction content items through the renderer registry.
 * @module instruction-contents
 * @internal
 */

import { warnUnknownInstructionType } from '@/lib/utils/my-organization/idp-management/idp-management-utils';
import type { InstructionContentsProps } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Renders content items in order; items without a renderer render nothing.
 * @param props - Component props.
 * @param props.contents - Content items.
 * @param props.setup - Guided setup state for the renderers.
 * @param props.renderers - Content type → component.
 * @returns JSX element
 */
export function InstructionContents({ contents, setup, renderers }: InstructionContentsProps) {
  return (
    <>
      {contents.map((content) => {
        const Renderer = Object.hasOwn(renderers, content.type)
          ? renderers[content.type]
          : undefined;
        if (!Renderer) {
          warnUnknownInstructionType(content.type);
          return null;
        }
        return <Renderer key={content.key} content={content} setup={setup} renderers={renderers} />;
      })}
    </>
  );
}
