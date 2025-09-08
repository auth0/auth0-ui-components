import * as React from 'react';
import { cn } from '@/lib/theme-utils';

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Section Component
 *
 * A generic component for creating sections with a title and content area.
 * Provides consistent styling and structure for sections across the application.
 *
 * High-level implementation:
 * ```
 * <div>
 *   <SectionTitle />
 *   <SectionContent>
 *     {children}
 *   </SectionContent>
 * </div>
 * ```
 *
 * @param {SectionProps} props - The component props
 * @param {string} props.title - The section title to display
 * @param {string} [props.description] - Optional description text below the title
 * @param {React.ReactNode} props.children - The content to render within the section
 * @param {string} [props.className] - Additional CSS classes for the section container
 *
 * @example
 * ```tsx
 * <Section title="Organization Settings" description="Configure your organization">
 *   <FormField>...</FormField>
 *   <FormField>...</FormField>
 * </Section>
 * ```
 *
 * @returns {React.JSX.Element} The rendered section
 */
export function Section({
  title,
  description,
  children,
  className,
}: SectionProps): React.JSX.Element {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <h3
          className={cn('text-lg text-(length:--font-size-subtitle) font-semibold mb-1 text-left')}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              'text-sm text-muted-foreground text-left text-(length:--font-size-paragraph)',
            )}
          >
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
