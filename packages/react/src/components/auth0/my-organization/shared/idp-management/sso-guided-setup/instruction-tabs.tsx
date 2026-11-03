/**
 * `tabs_component` renderer.
 * @module instruction-tabs
 * @internal
 */

import type { IdpInstructionsTabsComponent } from '@auth0/universal-components-core';

import { InstructionContents } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-contents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { InstructionContentProps } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Renders tabbed instruction content, opening `default_tab` first.
 * @param props - Component props.
 * @param props.content - Instruction content item.
 * @returns JSX element, or `null` without tabs.
 */
export function InstructionTabs({ content }: InstructionContentProps) {
  const tabs = (content as { tabs_component?: IdpInstructionsTabsComponent }).tabs_component;

  if (!tabs?.tabs?.length) {
    return null;
  }

  const defaultIndex =
    tabs.default_tab !== undefined && tabs.default_tab < tabs.tabs.length ? tabs.default_tab : 0;

  return (
    <Tabs defaultValue={String(defaultIndex)} data-slot="instruction-tabs">
      <TabsList>
        {tabs.tabs.map((tab, index) => (
          <TabsTrigger key={index} value={String(index)}>
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.tabs.map((tab, index) => (
        <TabsContent key={index} value={String(index)} className="pt-3">
          <InstructionContents contents={tab.contents} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
