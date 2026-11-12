/**
 * Minimal JSON tokenizer for syntax-colored display.
 * Produces plain text tokens so callers render them as text, never as HTML.
 * @module json-tokens
 * @internal
 */

export type JsonTokenType = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation';

export interface JsonToken {
  type: JsonTokenType;
  text: string;
}

const TOKEN_PATTERN =
  /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false)\b|\b(null)\b/g;

/**
 * Splits one line of pretty-printed JSON into typed tokens.
 * Joining the tokens' `text` reproduces the input line exactly.
 * @param line - A single line of JSON text.
 * @returns Tokens in order.
 * @internal
 */
export function tokenizeJsonLine(line: string): JsonToken[] {
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

  for (const match of line.matchAll(TOKEN_PATTERN)) {
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
