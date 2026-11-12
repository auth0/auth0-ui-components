/**
 * Multi-line code display with line numbers and optional copy action.
 * @module code-block
 * @internal
 */

import { Copy } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { tokenizeJsonLine, type JsonTokenType } from '@/lib/utils/json-tokens';

const COPIED_RESET_MS = 1000;

const tokenClassNames: Record<JsonTokenType, string> = {
  key: 'text-info-foreground',
  string: 'text-success-foreground',
  number: 'text-warning-foreground',
  boolean: 'text-warning-foreground',
  null: 'text-warning-foreground',
  punctuation: 'text-primary-foreground/70',
};

/** Props for {@link CodeBlock}. */
export interface CodeBlockProps {
  /** Text to display; split on newlines into numbered lines. */
  value: string;
  /** `json` applies syntax coloring. Defaults to `text`. */
  language?: 'json' | 'text';
  /** Copy button label. The button is hidden when omitted. */
  copyLabel?: string;
  /** Label shown briefly after a successful copy. */
  copiedLabel?: string;
  /** Called after the value is copied successfully. */
  onCopy?: () => void;
  className?: string;
}

/**
 * Renders a numbered, scrollable code block with an optional copy button.
 * @param props - {@link CodeBlockProps}
 * @returns The code block element.
 * @internal
 */
export function CodeBlock({
  value,
  language = 'text',
  copyLabel,
  copiedLabel,
  onCopy,
  className,
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
    <div data-slot="code-block" className={cn('flex flex-col gap-2', className)}>
      {copyLabel && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            <Copy aria-hidden="true" />
            <span aria-live="polite">{copied && copiedLabel ? copiedLabel : copyLabel}</span>
          </Button>
        </div>
      )}
      <pre
        tabIndex={0}
        className="bg-primary text-primary-foreground max-h-80 overflow-auto rounded-lg p-4 font-mono text-sm leading-6"
      >
        <code className="table w-full">
          {lines.map((line, index) => (
            <span key={index} className="table-row">
              <span
                aria-hidden="true"
                className="text-primary-foreground/50 table-cell select-none pr-4 text-right"
              >
                {index + 1}
              </span>
              <span className="table-cell whitespace-pre">
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
    </div>
  );
}
