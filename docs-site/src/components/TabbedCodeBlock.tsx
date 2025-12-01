import { useState } from 'react';

import CodeBlock from './CodeBlock';

interface CodeTab {
  label: string;
  code: string;
}

interface TabbedCodeBlockProps {
  tabs: CodeTab[];
  language?: string;
  title?: string;
  showCopy?: boolean;
  className?: string;
}

export default function TabbedCodeBlock({
  tabs,
  language = 'bash',
  title,
  showCopy = true,
  className = '',
}: TabbedCodeBlockProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={`relative ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border border-gray-700 border-b-0 rounded-t-lg">
          <span className="text-sm font-medium text-gray-300">{title}</span>
        </div>
      )}
      <div
        className={`flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 ${title ? 'border-t-0' : 'rounded-t-lg'}`}
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === index ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="[&>div]:rounded-t-none [&>div]:border-t-0">
        <CodeBlock
          code={tabs[activeTab]?.code ?? ''}
          language={language}
          showCopy={showCopy}
          className="rounded-t-none"
        />
      </div>
    </div>
  );
}
