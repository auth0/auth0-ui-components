/**
 * Markdown renderer styled through element overrides (no typography plugin).
 * Ported from the UDS markdown component onto react-markdown v8, which keeps the
 * React 16 peer range supported.
 * @module markdown
 * @internal
 */

import * as React from 'react';
import ReactMarkdown, { type Components, type Options, uriTransformer } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type MarkdownVariant = 'default' | 'instruction';

export interface MarkdownProps {
  children: string;
  className?: string;
  variant?: MarkdownVariant;
  components?: Components;
  transformImageUri?: Options['transformImageUri'];
  transformLinkUri?: Options['transformLinkUri'];
  skipHtml?: boolean;
}

const remarkPlugins = [remarkGfm];

const defaultComponents: Components = {
  h1: ({ node: _node, children, ...props }) => (
    <h1 className="mb-6 text-4xl leading-relaxed font-bold tracking-tight" {...props}>
      {children}
    </h1>
  ),
  h2: ({ node: _node, children, ...props }) => (
    <h2 className="mb-4 text-3xl font-bold tracking-tight" {...props}>
      {children}
    </h2>
  ),
  h3: ({ node: _node, children, ...props }) => (
    <h3 className="mb-3 text-2xl font-semibold tracking-tight" {...props}>
      {children}
    </h3>
  ),
  h4: ({ node: _node, children, ...props }) => (
    <h4 className="mb-2 text-xl font-medium" {...props}>
      {children}
    </h4>
  ),
  h5: ({ node: _node, children, ...props }) => (
    <h5 className="mb-2 text-lg font-medium" {...props}>
      {children}
    </h5>
  ),
  h6: ({ node: _node, children, ...props }) => (
    <h6 className="mb-1 text-base font-medium" {...props}>
      {children}
    </h6>
  ),
  p: ({ node: _node, children, ...props }) => (
    <p className="text-foreground mb-4 text-base leading-relaxed" {...props}>
      {children}
    </p>
  ),
  a: ({ node: _node, children, href, ...props }) => (
    <a
      href={href}
      className="text-primary hover:text-primary/80 transition-colors hover:underline"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ node: _node, ordered: _ordered, depth: _depth, children, ...props }) => (
    <ul className="mb-2 list-inside list-disc pl-0" {...props}>
      {children}
    </ul>
  ),
  ol: ({ node: _node, ordered: _ordered, depth: _depth, children, ...props }) => (
    <ol className="mb-2 list-inside list-decimal pl-0" {...props}>
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
    <li className="text-foreground text-base" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ node: _node, children, ...props }) => (
    <blockquote
      className="border-border text-muted-foreground mb-4 border-l-2 pl-4 font-mono"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ node: _node, inline, children, className, ...props }) =>
    inline ? (
      <code
        className="bg-background shadow-bevel-xs relative rounded-lg px-[0.35rem] py-[0.2rem] font-mono text-sm font-medium tracking-tight"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    ),
  pre: ({ node: _node, children, ...props }) => (
    <pre
      className="bg-page shadow-bevel-xs relative mb-4 flex overflow-x-auto rounded-2xl p-4 font-mono text-sm font-medium tracking-tight"
      {...props}
    >
      {children}
    </pre>
  ),
  hr: ({ node: _node, ...props }) => <hr className="border-border my-6" {...props} />,
  table: ({ node: _node, children, ...props }) => <Table {...props}>{children}</Table>,
  thead: ({ node: _node, children, ...props }) => <TableHeader {...props}>{children}</TableHeader>,
  tbody: ({ node: _node, children, ...props }) => <TableBody {...props}>{children}</TableBody>,
  tr: ({ node: _node, isHeader: _isHeader, children, ...props }) => (
    <TableRow {...props}>{children}</TableRow>
  ),
  th: ({ node: _node, isHeader: _isHeader, children, ...props }) => (
    <TableHead {...props}>{children}</TableHead>
  ),
  td: ({ node: _node, isHeader: _isHeader, children, ...props }) => (
    <TableCell {...props}>{children}</TableCell>
  ),
  strong: ({ node: _node, children, ...props }) => (
    <strong className="text-foreground font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ node: _node, children, ...props }) => (
    <em className="text-foreground italic" {...props}>
      {children}
    </em>
  ),
};

type StyledTag = 'h3' | 'h4' | 'h5' | 'p' | 'strong' | 'ul' | 'ol' | 'li';
type StyledComponent = React.FC<Record<string, unknown> & { children?: React.ReactNode }>;

/**
 * Builds an element override that renders `Tag` with fixed classes and drops the props
 * react-markdown adds (`node`, `ordered`, ...) so they don't reach the DOM.
 * @param Tag - Element to render.
 * @param className - Classes for the element.
 * @returns A react-markdown component override.
 */
function styled(Tag: StyledTag, className: string): StyledComponent {
  function Styled({
    node: _node,
    ordered: _ordered,
    depth: _depth,
    index: _index,
    checked: _checked,
    children,
    ...props
  }: Record<string, unknown> & { children?: React.ReactNode }) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }
  return Styled;
}

/** Compact, muted typography for setup instructions. Headings step down one level. */
const instructionComponents = {
  h1: styled('h3', 'text-foreground mb-2 text-base font-semibold'),
  h2: styled('h4', 'text-foreground mb-2 text-sm font-semibold'),
  h3: styled('h5', 'text-foreground mb-2 text-sm font-medium'),
  p: styled('p', 'text-muted-foreground mb-4 text-sm leading-5 last:mb-0'),
  strong: styled('strong', 'text-foreground font-medium'),
  ul: styled(
    'ul',
    'text-muted-foreground mb-4 list-outside list-disc space-y-1 pl-5 text-sm last:mb-0',
  ),
  ol: styled(
    'ol',
    'text-muted-foreground mb-4 list-outside list-decimal space-y-1 pl-5 text-sm last:mb-0',
  ),
  li: styled('li', 'text-muted-foreground text-sm leading-5'),
} as unknown as Components;

const variantComponents: Record<MarkdownVariant, Components> = {
  default: defaultComponents,
  instruction: { ...defaultComponents, ...instructionComponents },
};

function Markdown({
  children,
  className,
  variant = 'default',
  components,
  transformImageUri = uriTransformer,
  transformLinkUri,
  skipHtml,
}: MarkdownProps) {
  const mergedComponents = React.useMemo(
    () =>
      components ? { ...variantComponents[variant], ...components } : variantComponents[variant],
    [variant, components],
  );

  return (
    <div className={cn('text-foreground', className)} data-slot="markdown">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        components={mergedComponents}
        transformImageUri={transformImageUri}
        transformLinkUri={transformLinkUri}
        skipHtml={skipHtml}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export { Markdown };
