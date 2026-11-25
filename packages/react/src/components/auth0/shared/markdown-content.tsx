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
import { spinnerVariants } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export type MarkdownContentVariant = 'default' | 'notice';

export interface MarkdownContentProps {
  text: string;
  baseUrl?: string;
  values?: Record<string, string | undefined>;
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

/**
 * Image that holds a fixed-ratio box with a spinner until it loads, so the text around it
 * doesn't shift. Renders nothing if the image fails to load.
 * @param props - `img` element props.
 * @param props.src - Image URL.
 * @param props.alt - Alternative text.
 * @returns JSX element, or `null` after a load error.
 */
function InstructionImage({ src, alt, ...props }: React.ComponentProps<'img'>) {
  const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const imageRef = React.useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) setStatus('loaded');
  }, []);

  if (status === 'error') return null;
  const isLoading = status === 'loading';

  return (
    <span
      data-slot="instruction-image"
      aria-busy={isLoading}
      className={cn(
        'border-border relative my-6 block w-full overflow-hidden rounded-xl border',
        isLoading && 'bg-muted/50 aspect-video',
      )}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className={cn(spinnerVariants({ colorScheme: 'muted' }), 'absolute inset-0 m-auto')}
        />
      )}
      <img
        ref={imageRef}
        src={src}
        alt={alt ?? ''}
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={cn('block h-auto w-full', isLoading && 'absolute inset-0 opacity-0')}
        {...props}
      />
    </span>
  );
}

const instructionComponents: Components = {
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
    src ? <InstructionImage key={src} src={src} alt={alt} {...props} /> : null,
  pre: ({ node: _node, children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock>,
};

/**
 * Renders instruction markdown with the guided-setup typography.
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
      variant="instruction"
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
