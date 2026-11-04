import CodeBlock from '../components/CodeBlock';

const PROPS: Array<[prop: string, type: string, description: string]> = [
  ['customMessages', 'UserPasskeyManagementMessages', 'Override any text of the component.'],
  ['styling', 'ComponentStyling', 'CSS variables and class overrides, see the Styling page.'],
  ['hideHeader', 'boolean', 'Hide the page header. Defaults to false.'],
  [
    'addAction',
    'ComponentAction<void>',
    'Lifecycle of adding a passkey. onBefore can cancel, onAfter runs on success. Set disabled to hide the add action.',
  ],
  [
    'revokeAction',
    'ComponentAction<Passkey>',
    'Lifecycle of revoking a passkey. onBefore can cancel, onAfter runs on success. Set disabled to hide the revoke action.',
  ],
  ['onFetch', '() => void', 'Called after the passkeys are loaded.'],
];

const PARTS: Array<[parts: string, description: string]> = [
  ['Root', 'Owns data, state, telemetry and the revoke dialog.'],
  ['DefaultLayout', 'The layout of the drop-in component. Takes addAction and renderItem.'],
  [
    'Header, HeaderContent, Title, Description, HeaderActions',
    'Page header. Title and Description show the translated text unless you pass children.',
  ],
  ['Section', 'The passkeys card. Shows the loading state instead of its content.'],
  [
    'SectionHeader, SectionTitle, StatusBadge, EmptyState, SectionActions',
    'The card header: title, the enabled badge, the message shown when there are no passkeys, and the action area.',
  ],
  [
    'AddAction',
    'Starts passkey enrollment. Hidden when addAction.disabled is set. Place it anywhere inside Root.',
  ],
  ['List', 'The passkey rows. Its child is a function of the passkey.'],
  [
    'Item, ItemIcon, ItemDetails, ItemName, ItemMeta, ItemMenu',
    'One row and its pieces. ItemMenu is the default menu with the revoke command.',
  ],
  [
    'RevokeAction',
    'Revokes the passkey of the row, as a button instead of the menu. Opens the confirmation dialog mounted by Root. Described by ItemName.',
  ],
];

export default function UserPasskeyManagement() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-700/10 rounded-xl"></div>
        <div
          className="relative space-y-4 p-6 border-l-4 border-gradient-to-b from-blue-600 to-purple-600"
          style={{ borderImage: 'linear-gradient(to bottom, rgb(37 99 235), rgb(147 51 234)) 1' }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
              My Account
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              BETA
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">UserPasskeyManagement Component</h1>
          <p className="text-xl text-gray-600">
            Lets users see, add and revoke the passkeys on their account.
          </p>
        </div>
      </div>

      {/* Setup */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Setup Requirements</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm">
            <code>UserPasskeyManagement</code> reads and writes the user's authentication methods
            through the My Account API, like <code>UserMFAManagement</code>. Follow the setup in{' '}
            <a
              href="/my-account/user-mfa-management"
              className="underline font-medium text-blue-700"
            >
              UserMFAManagement
            </a>{' '}
            and wrap your app in the provider described in Getting Started.
          </p>
        </div>
      </section>

      {/* Basic Usage */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Basic Usage</h2>
        <CodeBlock
          code={`// For SPA/Next.js/RWA applications:
import { UserPasskeyManagement } from '@auth0/universal-components-react';

// For shadcn users:
// import { UserPasskeyManagement } from '@/components/auth0/my-account/user-passkey-management';

export function SecurityPage() {
  return (
    <div>
      <h1>Security Settings</h1>
      <UserPasskeyManagement />
    </div>
  );
}`}
          language="tsx"
          title="Basic implementation"
        />
      </section>

      {/* Props */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Props</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prop
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {PROPS.map(([prop, type, description]) => (
                <tr key={prop}>
                  <td className="px-4 py-2 text-gray-700 align-top">
                    <code>{prop}</code>
                  </td>
                  <td className="px-4 py-2 text-gray-700 align-top">
                    <code>{type}</code>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Composition */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Composition</h2>
        <p className="text-gray-600">
          <code>UserPasskeyManagement</code> is built from public parts, so you can go from the
          drop-in component to your own markup one step at a time. Pick the lowest level that fits.
          Every level uses the same data, the same revoke dialog and the same permissions, and the
          component keeps your application theme.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  You want to
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Use
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              <tr>
                <td className="px-4 py-2 text-gray-700">Use the component as it is</td>
                <td className="px-4 py-2 text-gray-700">
                  Level 1: <code>&lt;UserPasskeyManagement /&gt;</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-700">
                  Replace one element, such as the add button, and keep its behavior
                </td>
                <td className="px-4 py-2 text-gray-700">
                  Level 2: <code>render</code> on an action part
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-700">
                  Add, omit, move or gate a region, such as the header, the add button or the rows
                </td>
                <td className="px-4 py-2 text-gray-700">
                  Level 3: parts inside <code>UserPasskeyManagement.Root</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-700">Own all the markup</td>
                <td className="px-4 py-2 text-gray-700">
                  Level 4: <code>useUserPasskeyModel()</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Level 2: replace one element</h3>
            <p className="text-gray-600 mb-4">
              <code>AddAction</code> and <code>RevokeAction</code> accept <code>render</code>. Pass
              an element, or a function that receives the props to spread and the action state. The
              part keeps the click handler, the disabled and pending state and the accessible name.
              Your element supplies its own content, because the part does not insert its label into
              it.
            </p>
            <CodeBlock
              code={`import { UserPasskeyManagement } from '@auth0/universal-components-react';

<UserPasskeyManagement.Root>
  <UserPasskeyManagement.DefaultLayout
    addAction={
      <UserPasskeyManagement.AddAction
        render={(props, state) => (
          <ProductButton {...props} loading={state.pending}>
            Add a passkey
          </ProductButton>
        )}
      />
    }
  />
</UserPasskeyManagement.Root>`}
              language="tsx"
              title="Use your own button for the add action"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Level 3: arrange the parts</h3>
            <p className="text-gray-600 mb-4">
              Place the parts you want inside <code>Root</code>. Content that is not a part stays
              visible while data loads, and <code>Root</code> mounts the revoke dialog, so it works
              however you arrange the parts. Error and MFA step-up states replace the whole tree.
              Each <code>AddAction</code> you render works on its own, so the add button can sit in
              the page header, in the card or both.
            </p>
            <CodeBlock
              code={`<UserPasskeyManagement.Root>
  <UserPasskeyManagement.Header>
    <UserPasskeyManagement.HeaderContent>
      <UserPasskeyManagement.Title />
      <UserPasskeyManagement.Description />
    </UserPasskeyManagement.HeaderContent>
    <UserPasskeyManagement.HeaderActions>
      <UserPasskeyManagement.AddAction
        render={<ProductButton>Add a passkey</ProductButton>}
      />
    </UserPasskeyManagement.HeaderActions>
  </UserPasskeyManagement.Header>

  <UserPasskeyManagement.Section>
    <UserPasskeyManagement.EmptyState />
    <UserPasskeyManagement.List>
      {() => (
        <UserPasskeyManagement.Item>
          <UserPasskeyManagement.ItemIcon />
          <UserPasskeyManagement.ItemDetails>
            <UserPasskeyManagement.ItemName />
            <UserPasskeyManagement.ItemMeta />
          </UserPasskeyManagement.ItemDetails>
          <UserPasskeyManagement.RevokeAction
            render={<ProductButton variant="outline">Revoke</ProductButton>}
          />
        </UserPasskeyManagement.Item>
      )}
    </UserPasskeyManagement.List>
  </UserPasskeyManagement.Section>
</UserPasskeyManagement.Root>`}
              language="tsx"
              title="The add button in the header and an inline revoke button instead of the menu"
            />
            <p className="text-gray-600 mt-4 text-sm">
              <code>RevokeAction</code> is described by <code>ItemName</code>, so screen readers say
              which passkey a revoke button acts on. Render <code>ItemName</code> in every custom
              row. Host components inside <code>Root</code> can read the same data with{' '}
              <code>useUserPasskeyManagementContext()</code> and{' '}
              <code>useUserPasskeyItemContext()</code>.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Parts</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Part
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      What it is
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {PARTS.map(([parts, description]) => (
                    <tr key={parts}>
                      <td className="px-4 py-2 text-gray-700 align-top">
                        <code>{parts}</code>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Level 4: headless</h3>
            <p className="text-gray-600 mb-4">
              <code>useUserPasskeyModel()</code> returns the data, the state flags and the revoke
              confirmation state, plus <code>getAddActionProps()</code> and{' '}
              <code>getItemProps(passkey)</code>. You own the markup, the loading and error states
              and the confirmation.
            </p>
            <CodeBlock
              code={`import { useUserPasskeyModel } from '@auth0/universal-components-react';

function HostPasskeys() {
  const model = useUserPasskeyModel();
  const add = model.getAddActionProps();

  return (
    <>
      {!add.hidden && (
        <HostButton onClick={add.onClick} disabled={add.disabled} loading={add.pending}>
          Add a passkey
        </HostButton>
      )}
      {model.passkeys.map((passkey) => {
        const { revokeAction } = model.getItemProps(passkey);
        return (
          <HostRow key={passkey.id} name={passkey.name}>
            {!revokeAction.hidden && (
              <HostButton onClick={revokeAction.onClick} disabled={revokeAction.disabled}>
                Revoke
              </HostButton>
            )}
          </HostRow>
        );
      })}
      {model.isRevokeModalOpen && (
        <HostConfirm
          name={model.currentPasskey?.name}
          onConfirm={model.handleConfirmRevoke}
          onCancel={() => model.setIsRevokeModalOpen(false)}
        />
      )}
    </>
  );
}`}
              language="tsx"
              title="Headless usage"
            />
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 text-sm">
                A headless host must honor the whole model: respect <code>hidden</code>,{' '}
                <code>disabled</code> and <code>pending</code> on every action, and render a
                confirmation from <code>isRevokeModalOpen</code> before calling{' '}
                <code>handleConfirmRevoke</code>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
