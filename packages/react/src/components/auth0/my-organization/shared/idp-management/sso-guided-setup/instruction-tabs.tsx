/**
 * `tabs_component` renderer.
 * @module instruction-tabs
 * @internal
 */

import { InstructionContents } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-contents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { InstructionContentProps } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Renders tabbed instruction content, opening `default_tab` first.
 * @param props - Component props.
 * @param props.content - Instruction content item.
 * @param props.setup - Guided setup state for the renderers.
 * @param props.renderers - Content type → component.
 * @returns JSX element, or `null` without tabs.
 */
export function InstructionTabs({ content, setup, renderers }: InstructionContentProps) {
  const { t } = useTranslator('idp_management.sso_guided_setup', setup.customMessages);
  const tabs = 'tabs_component' in content ? content.tabs_component : undefined;

  if (!tabs?.tabs?.length) {
    return null;
  }

  const items = tabs.tabs.map((tab, index) => ({ ...tab, value: `${index}-${tab.title}` }));
  const defaultItem = items[tabs.default_tab ?? 0] ?? items[0];

  return (
    <Tabs defaultValue={defaultItem?.value} data-slot="instruction-tabs">
      <TabsList aria-label={t('instruction_tabs_label')}>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value} className="pt-3">
          <InstructionContents contents={item.contents} setup={setup} renderers={renderers} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
