/**
 * Markdown for API-provided instruction text: dedent, placeholder substitution,
 * `base_url` image resolution, safe external links, copyable code blocks, notice callouts.
 * @module markdown-content
 * @internal
 */

import {
  dedentText,
  isExternalUrl,
  resolveAssetUrl,
  substitutePlaceholders,
} from '@auth0/universal-components-core';
import { Info } from 'lucide-react';
import * as React from 'react';
import type { Components } from 'react-markdown';

import { CopyButton } from '@/components/auth0/shared/copy-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Markdown } from '@/components/ui/markdown';
import { cn } from '@/lib/utils';

export type MarkdownContentVariant = 'default' | 'notice';

export interface MarkdownContentProps {
  /** Markdown text from the API. */
  text: string;
  /** Payload `base_url`; relative image paths are resolved against it. */
  baseUrl?: string;
  /** Placeholder values, e.g. `{ companyName }` for `{{companyName}}`. */
  values?: Record<string, string | undefined>;
  /** `notice` renders the text inside an info callout. */
  variant?: MarkdownContentVariant;
  className?: string;
}

/**
 * Fenced code block with a copy button for its text.
 * @param props - `pre` element props.
 * @param props.children - Rendered code element.
 * @returns JSX element
 */
function CodeBlock({ children, ...props }: React.ComponentProps<'pre'>) {
  const preRef = React.useRef<HTMLPreElement>(null);

  return (
    <div className="relative mb-3">
      <pre
        ref={preRef}
        className="bg-page shadow-bevel-xs m-0 overflow-x-auto rounded-2xl p-4 pr-12 font-mono text-sm"
        {...props}
      >
        {children}
      </pre>
      <CopyButton
        value={() => preRef.current?.textContent?.replace(/\n$/, '') ?? ''}
        className="absolute top-2 right-2 h-8 w-8"
      />
    </div>
  );
}

const instructionComponents: Components = {
  h1: ({ node: _node, children, ...props }) => (
    <h3 className="text-foreground mb-2 text-base font-semibold" {...props}>
      {children}
    </h3>
  ),
  h2: ({ node: _node, children, ...props }) => (
    <h4 className="text-foreground mb-2 text-sm font-semibold" {...props}>
      {children}
    </h4>
  ),
  h3: ({ node: _node, children, ...props }) => (
    <h5 className="text-foreground mb-2 text-sm font-medium" {...props}>
      {children}
    </h5>
  ),
  p: ({ node: _node, children, ...props }) => (
    <p className="text-muted-foreground mb-3 text-sm leading-relaxed last:mb-0" {...props}>
      {children}
    </p>
  ),
  strong: ({ node: _node, children, ...props }) => (
    <strong className="text-foreground font-medium" {...props}>
      {children}
    </strong>
  ),
  ul: ({ node: _node, ordered: _ordered, depth: _depth, children, ...props }) => (
    <ul
      className="text-muted-foreground mb-3 list-outside list-disc space-y-1 pl-5 text-sm"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ node: _node, ordered: _ordered, depth: _depth, children, ...props }) => (
    <ol
      className="text-muted-foreground mb-3 list-outside list-decimal space-y-1 pl-5 text-sm"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({
    node: _node,
    ordered: _ordered,
    index: _index,
    checked: _checked,
    children,
    ...props
  }) => (
    <li className="text-muted-foreground text-sm leading-relaxed" {...props}>
      {children}
    </li>
  ),
  a: ({ node: _node, href, children, ...props }) => {
    const external = isExternalUrl(href);
    return (
      <a
        href={href}
        className="text-primary hover:text-primary/80 underline-offset-2 hover:underline"
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ node: _node, src, alt, ...props }) =>
    src ? (
      <img
        src={src}
        alt={alt ?? ''}
        loading="lazy"
        className="border-border my-3 block h-auto max-w-full rounded-xl border"
        {...props}
      />
    ) : null,
  pre: ({ node: _node, children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock>,
};

/**
 * Renders instruction markdown with the guided-setup typography.
 * Raw HTML is dropped; image URLs must resolve to https under `baseUrl` or they are not rendered.
 * @param props - Component props.
 * @param props.text - Markdown text.
 * @param props.baseUrl - Base for relative image paths.
 * @param props.values - Placeholder values.
 * @param props.variant - `default` or `notice`.
 * @param props.className - Wrapper class names.
 * @returns JSX element
 */
function MarkdownContent({
  text,
  baseUrl,
  values,
  variant = 'default',
  className,
}: MarkdownContentProps) {
  const source = React.useMemo(
    () => substitutePlaceholders(dedentText(text), values ?? {}),
    [text, values],
  );
  const transformImageUri = React.useCallback(
    (src: string) => resolveAssetUrl(baseUrl, src) ?? '',
    [baseUrl],
  );

  const markdown = (
    <Markdown
      components={instructionComponents}
      transformImageUri={transformImageUri}
      skipHtml
      className={variant === 'default' ? className : undefined}
    >
      {source}
    </Markdown>
  );

  if (variant !== 'notice') {
    return markdown;
  }

  return (
    <Alert variant="info" role="note" className={cn('mb-3', className)} data-variant="notice">
      <Info aria-hidden="true" />
      <AlertDescription>{markdown}</AlertDescription>
    </Alert>
  );
}

export { MarkdownContent };
