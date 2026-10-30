/**
 * Markdown renderer styled through element overrides (no typography plugin).
 * Ported from the UDS markdown component onto react-markdown v8, which keeps the
 * React 16 peer range supported.
 * @module markdown
 * @internal
 */

import * as React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
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

export interface MarkdownProps {
  children: string;
  className?: string;
  /** Per-element overrides merged over the defaults. */
  components?: Components;
}

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

function Markdown({ children, className, components }: MarkdownProps) {
  const mergedComponents = React.useMemo(
    () => (components ? { ...defaultComponents, ...components } : defaultComponents),
    [components],
  );

  return (
    <div className={cn('text-foreground', className)} data-slot="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mergedComponents}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

export { Markdown };
