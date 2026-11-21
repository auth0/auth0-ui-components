/**
 * Renders instruction content items through the renderer registry.
 * @module instruction-contents
 * @internal
 */

import type {
  InstructionContent,
  InstructionRenderers,
  InstructionSetup,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

const warnedTypes = new Set<string>();

/**
 * Warns once per unknown content type; the API tells clients to ignore types they don't know.
 * @param type - Content type without a renderer.
 */
function warnUnknownType(type: string) {
  if (warnedTypes.has(type)) return;
  warnedTypes.add(type);
  console.warn(`[SsoGuidedSetup] No renderer for instruction content type "${type}"; skipped.`);
}

export interface InstructionContentsProps {
  contents: readonly InstructionContent[];
  setup: InstructionSetup;
  renderers: InstructionRenderers;
}

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
        const Renderer = renderers[content.type];
        if (!Renderer) {
          warnUnknownType(content.type);
          return null;
        }
        return <Renderer key={content.key} content={content} setup={setup} renderers={renderers} />;
      })}
    </>
  );
}
