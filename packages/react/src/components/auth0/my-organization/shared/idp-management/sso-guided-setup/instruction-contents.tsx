/**
 * Renders instruction content items through the renderer registry.
 * @module instruction-contents
 * @internal
 */

import * as React from 'react';

import type {
  InstructionContent,
  InstructionRenderers,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

const InstructionRenderersContext = React.createContext<InstructionRenderers>({});

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

/**
 * Supplies the renderer registry to {@link InstructionContents} below it.
 * @param props - Component props.
 * @param props.renderers - Content type → component.
 * @param props.children - Children.
 * @returns JSX element
 */
export function InstructionRenderersProvider({
  renderers,
  children,
}: {
  renderers: InstructionRenderers;
  children: React.ReactNode;
}) {
  return (
    <InstructionRenderersContext.Provider value={renderers}>
      {children}
    </InstructionRenderersContext.Provider>
  );
}

/**
 * Renders content items in order; items without a renderer render nothing.
 * @param props - Component props.
 * @param props.contents - Content items.
 * @returns JSX element
 */
export function InstructionContents({ contents }: { contents: readonly InstructionContent[] }) {
  const renderers = React.useContext(InstructionRenderersContext);

  return (
    <>
      {contents.map((content) => {
        const Renderer = renderers[content.type];
        if (!Renderer) {
          warnUnknownType(content.type);
          return null;
        }
        return <Renderer key={content.key} content={content} />;
      })}
    </>
  );
}
