import * as React from 'react';

import { cn } from '../libs/utils';

export const COMPOSITION_LEVELS = ['Default', 'Narrow', 'Structural', 'Headless'] as const;

export type CompositionLevel = (typeof COMPOSITION_LEVELS)[number];

interface CompositionTabsProps {
  /** What to render at each composition level. */
  levels: Record<CompositionLevel, React.ReactNode>;
}

/**
 * Shows one composition level of a component at a time. The host theme stays the
 * same across levels, so they can be compared side by side.
 * @param props - Component props.
 * @param props.levels - What to render at each composition level.
 * @returns The level tabs and the selected level.
 */
export function CompositionTabs({ levels }: CompositionTabsProps) {
  const [level, setLevel] = React.useState<CompositionLevel>('Default');

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Composition level"
        className="border-border flex gap-1 border-b"
      >
        {COMPOSITION_LEVELS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            id={`composition-tab-${name}`}
            aria-selected={level === name}
            aria-controls="composition-panel"
            onClick={() => setLevel(name)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium',
              level === name
                ? 'border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {name}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="composition-panel" aria-labelledby={`composition-tab-${level}`}>
        {levels[level]}
      </div>
    </div>
  );
}
