import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

export default function WithMfaStepUpDocs() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">withMfaStepUp</h1>
        <p className="text-xl text-gray-600">
          Asks the user to pass MFA when your own API call needs it, then runs the call again.
        </p>
      </div>

      {/* Provider settings */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Configure the dialog</h2>
        <p className="text-gray-600">
          One dialog opens for the whole app, whether the request came from a component or from your
          own call wrapped in <code className="text-xs">withMfaStepUp</code>. Pass{' '}
          <code className="text-xs">mfaStepUpSettings</code> to{' '}
          <code className="text-xs">Auth0ComponentProvider</code> to hide steps, add your own
          screens and style the dialog. Every property is optional.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  name: 'flow.add',
                  type: 'MfaCustomStep[]',
                  description:
                    'Your own steps. Each has an id, and optionally before or after (a step path to place it next to) and when (a condition that narrows when it shows).',
                },
                {
                  name: 'flow.hide',
                  type: 'Record<step, boolean | condition>',
                  description:
                    'Skip a built-in step: enroll.install, enroll.recovery or challenge.confirm. Pass true, or a condition that receives the flow facts.',
                },
                {
                  name: 'flow.skipListForSingleOption',
                  type: 'boolean',
                  description: 'Skip the method list when the user has only one option.',
                },
                {
                  name: 'screens',
                  type: 'Record<step, Component>',
                  description:
                    'The screen of each added step, by its id, or a replacement for a built-in step, by its path. A screen receives snapshot, machine and classes.',
                },
                {
                  name: 'actionsAlign',
                  type: "'left' | 'center' | 'right'",
                  description:
                    "Where the buttons at the bottom of the built-in screens sit. Defaults to 'right'.",
                },
                {
                  name: 'classes',
                  type: 'MfaStepUpClasses',
                  description:
                    'Class overrides for the parts of the dialog, such as MfaStepUp-title, MfaStepUp-primaryButton and MfaStepUp-dialogContent.',
                },
              ].map(({ name, type, description }) => (
                <tr key={name}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code className="text-xs">{type}</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="my-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-2">
          <p>
            <strong>Step paths:</strong> <code className="text-xs">list</code>,{' '}
            <code className="text-xs">enroll.install</code>,{' '}
            <code className="text-xs">enroll.contact</code>,{' '}
            <code className="text-xs">enroll.qr</code>,{' '}
            <code className="text-xs">enroll.verify</code>,{' '}
            <code className="text-xs">enroll.recovery</code>,{' '}
            <code className="text-xs">challenge.confirm</code>,{' '}
            <code className="text-xs">challenge</code> and{' '}
            <code className="text-xs">challenge.newRecoveryCode</code>. Use{' '}
            <code className="text-xs">MFA_STEP</code> instead of typing them.
          </p>
          <p>
            <strong>Placing a step:</strong> A step you add shows only where the step it is placed
            next to applies. Use <code className="text-xs">before</code> or{' '}
            <code className="text-xs">after</code>, not both. A step without either goes last.
          </p>
        </div>

        <TabbedCodeBlock
          title="mfaStepUpSettings examples"
          language="tsx"
          tabs={[
            {
              label: 'Add a screen',
              code: `import { MFA_STEP, type MfaStepScreenProps } from '@auth0/universal-components-react';

function TermsScreen({ machine }: MfaStepScreenProps) {
  return (
    <div>
      <p>Accept the terms to continue.</p>
      <button onClick={() => machine.back()}>Back</button>
      <button onClick={() => machine.next()}>Accept</button>
    </div>
  );
}

<Auth0ComponentProvider
  mode="proxy"
  domain="your-tenant.auth0.com"
  proxyConfig={{ baseUrl: '/api/auth' }}
  mfaStepUpSettings={{
    flow: { add: [{ id: 'terms', after: MFA_STEP.list }] },
    screens: { terms: TermsScreen },
  }}
>
  <App />
</Auth0ComponentProvider>`,
            },
            {
              label: 'Hide steps',
              code: `<Auth0ComponentProvider
  mode="proxy"
  domain="your-tenant.auth0.com"
  proxyConfig={{ baseUrl: '/api/auth' }}
  mfaStepUpSettings={{
    flow: {
      hide: { [MFA_STEP.confirm]: true },
      skipListForSingleOption: true,
    },
  }}
>
  <App />
</Auth0ComponentProvider>`,
            },
            {
              label: 'Style the dialog',
              code: `<Auth0ComponentProvider
  mode="proxy"
  domain="your-tenant.auth0.com"
  proxyConfig={{ baseUrl: '/api/auth' }}
  mfaStepUpSettings={{
    actionsAlign: 'center',
    classes: {
      'MfaStepUp-title': 'text-xl',
      'MfaStepUp-primaryButton': 'rounded-full',
    },
  }}
>
  <App />
</Auth0ComponentProvider>`,
            },
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">When to use it</h2>
        <p className="text-gray-600">
          The Auth0 components ask for MFA on their own. Use{' '}
          <code className="text-xs">withMfaStepUp</code> for calls you make yourself, with your own
          fetcher or SDK client. If the server answers <code className="text-xs">mfa_required</code>
          , the MFA step-up dialog opens. Once the user passes MFA, your call runs again and returns
          its result.
        </p>
        <p className="text-gray-600">
          The dialog comes from <code className="text-xs">Auth0ComponentProvider</code>, so your
          call must run under it. To customize the dialog, see{' '}
          <code className="text-xs">mfaStepUpSettings</code> above.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Usage</h2>
        <CodeBlock
          title="withMfaStepUp"
          language="tsx"
          code={`import { withMfaStepUp } from '@auth0/universal-components-react';

async function updateProfile(accessToken: string, data: object) {
  const response = await withMfaStepUp(() =>
    fetch('https://api.example.com/profile', {
      method: 'PATCH',
      headers: { Authorization: \`Bearer \${accessToken}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  );
  return response.json();
}`}
        />
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-2">
          <p>
            <strong>Pass a function, not a promise.</strong> A promise has already sent the request
            and cannot be sent again. The function runs again after MFA, so it must be safe to
            repeat.
          </p>
          <p>
            <strong>What counts as MFA required.</strong> A thrown error with the Auth0{' '}
            <code className="text-xs">mfa_required</code> body, or a{' '}
            <code className="text-xs">403</code> response whose body is{' '}
            <code className="text-xs">mfa_required</code>. Your API has to return that body, with
            the <code className="text-xs">mfa_token</code>, for the dialog to open.
          </p>
          <p>
            <strong>One dialog.</strong> Calls that need MFA at the same time share the same dialog.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">When the user cancels</h2>
        <p className="text-gray-600">
          If the user closes the dialog, or MFA cannot be completed, the call rejects with an{' '}
          <code className="text-xs">MfaStepUpError</code>. Any other error from your call is thrown
          unchanged, so a normal <code className="text-xs">try/catch</code> works.
        </p>
        <CodeBlock
          title="Handling errors"
          language="tsx"
          code={`try {
  const response = await withMfaStepUp(() => fetch(url, init));
  return await response.json();
} catch (error) {
  showError(error); // includes the case where the user cancelled MFA
}`}
        />
      </section>
    </div>
  );
}
