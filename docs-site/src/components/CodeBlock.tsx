import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showCopy?: boolean;
  className?: string;
}

export default function CodeBlock({
  code,
  language = 'typescript',
  title,
  showCopy = true,
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-gray-700">
          <span className="text-sm font-medium text-gray-300">{title}</span>
          {showCopy && (
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            background: '#1e1e1e',
          }}
          showLineNumbers={false}
        >
          {code}
        </SyntaxHighlighter>
        {showCopy && !title && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 bg-gray-800 rounded transition-colors z-10"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
