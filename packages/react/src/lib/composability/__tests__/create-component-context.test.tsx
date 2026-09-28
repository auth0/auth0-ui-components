import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createComponentContext } from '@/lib/composability/create-component-context';

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Builds a minimal compound component off the factory: a `Root` (provides the
 * value + wraps children in the dev `Boundary`), a required `Content` part that
 * registers itself, and an optional `Header` part that does not.
 */
function makeWidget(requiredParts?: readonly string[]) {
  const [Context, useWidgetContext, parts] = createComponentContext<{ value: number }>('Widget', {
    requiredParts,
  });

  function Root({ children }: { children?: React.ReactNode }) {
    return (
      <Context.Provider value={{ value: 1 }}>
        <parts.Boundary>{children}</parts.Boundary>
      </Context.Provider>
    );
  }

  function Content() {
    parts.useRegisterPart('Content');
    useWidgetContext();
    return <div>content</div>;
  }

  function Header() {
    useWidgetContext();
    return <div>header</div>;
  }

  return { Root, Content, Header };
}

describe('createComponentContext — missing-required-part warning', () => {
  it('warns, naming the missing part, when a required part never mounts', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { Root, Header } = makeWidget(['Content']);

    render(
      <Root>
        <Header />
      </Root>,
    );

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<Widget.Root>'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<Widget.Content>'));
  });

  it('does not warn when the required part is present, even nested in host markup', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { Root, Content, Header } = makeWidget(['Content']);

    // Content is wrapped in host elements — a shallow children scan would miss
    // it; effect registration finds it regardless of nesting depth.
    render(
      <Root>
        <Header />
        <section>
          <div>
            <Content />
          </div>
        </section>
      </Root>,
    );

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(warn).not.toHaveBeenCalled();
  });

  it('never warns when the component declares no required parts', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { Root, Header } = makeWidget();

    render(
      <Root>
        <Header />
      </Root>,
    );

    expect(warn).not.toHaveBeenCalled();
  });

  it('does not warn in production builds', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { Root, Header } = makeWidget(['Content']);
      render(
        <Root>
          <Header />
        </Root>,
      );
      expect(warn).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = previous;
    }
  });

  it('does not warn under StrictMode double-invocation when the part is present', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { Root, Content } = makeWidget(['Content']);

    render(
      <React.StrictMode>
        <Root>
          <Content />
        </Root>
      </React.StrictMode>,
    );

    expect(warn).not.toHaveBeenCalled();
  });

  it('still throws when a compound part is rendered outside Root', () => {
    // The guard hook is unchanged; a part read without a provider must throw.
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { Header } = makeWidget(['Content']);

    expect(() => render(<Header />)).toThrow(
      'Widget compound parts must be rendered inside <Widget.Root>.',
    );
    error.mockRestore();
  });
});
