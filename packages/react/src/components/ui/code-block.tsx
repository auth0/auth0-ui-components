/**
 * Multi-line code display with line numbers, JSON coloring and an optional copy action.
 * Synced from the UDS code-block component.
 * @module code-block
 * @internal
 */

'use client';

import { Check, Copy } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COPIED_RESET_MS = 1000;

type JsonTokenType = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation';

interface JsonToken {
  type: JsonTokenType;
  text: string;
}

const JSON_TOKEN_PATTERN =
  /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false)\b|\b(null)\b/g;

// Palette steps rather than semantic status tokens: step 11 keeps 4.5:1 contrast on `bg-page` in light and dark themes.
const tokenClassNames: Record<JsonTokenType, string> = {
  key: 'text-(--color-blue-11)',
  string: 'text-(--color-green-11)',
  number: 'text-(--color-indigo-11)',
  boolean: 'text-(--color-indigo-11)',
  null: 'text-(--color-indigo-11)',
  punctuation: 'text-(--color-neutral-11)',
};

/**
 * Splits one line of pretty-printed JSON into typed tokens.
 * Tokens are rendered as text, never as HTML.
 * @param line - A single line of JSON text.
 * @returns Tokens in order; joining their `text` reproduces the line.
 * @internal
 */
function tokenizeJsonLine(line: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let cursor = 0;

  const pushPunctuation = (text: string) => {
    if (!text) return;
    const last = tokens.at(-1);
    if (last?.type === 'punctuation') {
      last.text += text;
    } else {
      tokens.push({ type: 'punctuation', text });
    }
  };

  for (const match of line.matchAll(JSON_TOKEN_PATTERN)) {
    const [whole, str, colon, num, bool, nul] = match;
    const index = match.index ?? 0;
    pushPunctuation(line.slice(cursor, index));

    if (str !== undefined) {
      tokens.push({ type: colon ? 'key' : 'string', text: str });
      pushPunctuation(colon ?? '');
    } else if (num !== undefined) {
      tokens.push({ type: 'number', text: num });
    } else if (bool !== undefined) {
      tokens.push({ type: 'boolean', text: bool });
    } else if (nul !== undefined) {
      tokens.push({ type: 'null', text: nul });
    }

    cursor = index + whole.length;
  }

  pushPunctuation(line.slice(cursor));
  return tokens;
}

/** Props for {@link CodeBlock}. */
export interface CodeBlockProps extends Omit<React.ComponentProps<'div'>, 'children' | 'onCopy'> {
  /** Text to display; split on newlines into numbered lines. */
  value: string;
  /** `json` applies syntax coloring. Defaults to `text`. */
  language?: 'json' | 'text';
  /** Accessible label for the copy button. The button is hidden when omitted. */
  copyLabel?: string;
  /** Announced to screen readers after a successful copy. */
  copiedLabel?: string;
  /** Called after the value is copied successfully. */
  onCopy?: () => void;
}

/**
 * Renders a numbered, scrollable code block with an optional copy button.
 * @param props - {@link CodeBlockProps}
 * @returns The code block element.
 * @internal
 */
function CodeBlock({
  value,
  language = 'text',
  copyLabel,
  copiedLabel,
  onCopy,
  className,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const resetTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lines = React.useMemo(() => value.split('\n'), [value]);

  React.useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
      onCopy?.();
    } catch {
      setCopied(false);
    }
  };

  return (
    <div data-slot="code-block" className={cn('relative', className)} {...props}>
      <pre
        tabIndex={0}
        className={cn(
          'bg-page shadow-bevel-xs focus-visible:ring-ring max-h-80 overflow-auto rounded-2xl p-4 font-mono text-sm leading-6 font-medium tracking-tight outline-none focus-visible:ring-4',
          copyLabel && 'pr-12',
        )}
      >
        <code className="table w-full">
          {lines.map((line, index) => (
            <span key={index} className="table-row">
              <span
                aria-hidden="true"
                className="table-cell w-px pr-4 text-right whitespace-nowrap text-(--color-neutral-11) select-none"
              >
                {index + 1}
              </span>
              <span className="text-foreground table-cell whitespace-pre">
                {language === 'json'
                  ? tokenizeJsonLine(line).map((token, tokenIndex) => (
                      <span
                        key={tokenIndex}
                        data-token={token.type}
                        className={tokenClassNames[token.type]}
                      >
                        {token.text}
                      </span>
                    ))
                  : line}
              </span>
            </span>
          ))}
        </code>
      </pre>
      {copyLabel && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={copyLabel}
          onClick={handleCopy}
          className="absolute top-2 right-2"
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </Button>
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </div>
  );
}

export { CodeBlock };
