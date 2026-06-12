interface DocsRedirectNoticeProps {
  componentName: string;
  docsUrl: string;
}

export default function DocsRedirectNotice({ componentName, docsUrl }: DocsRedirectNoticeProps) {
  return (
    <div className="max-w-3xl mx-auto py-16 space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <svg
            className="w-12 h-12 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{componentName}</h1>
          <p className="text-lg text-gray-700">
            This component's documentation is now available on <strong>auth0.com/docs</strong>.
          </p>
        </div>

        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          View Documentation
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          The shadcn component registry is still served from this site. Use{' '}
          <code className="text-xs bg-white px-1.5 py-0.5 rounded border">
            npx shadcn@latest add @auth0/...
          </code>{' '}
          as before.
        </p>
      </div>
    </div>
  );
}
