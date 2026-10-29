import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { createCompoundContext } from '@/lib/composability/create-compound-context';
import {
  getButtonContract,
  getSubmitContract,
  getSwitchContract,
  mergeProps,
  useRender,
} from '@/lib/composability/use-render';
import type { ActionPartState, RenderProp } from '@/types/composability-types';

interface TestActionProps {
  render?: RenderProp<ActionPartState>;
  onCommand?: () => void;
  disabled?: boolean;
  pending?: boolean;
}

const TestAction = React.forwardRef<HTMLButtonElement, TestActionProps>(function TestAction(
  { render: renderProp, onCommand = vi.fn(), disabled = false, pending = false },
  ref,
) {
  return useRender({
    render: renderProp,
    props: {
      ...getButtonContract({ onClick: onCommand, disabled, pending }),
      'aria-label': 'Add',
      className: 'part-class',
    },
    state: { pending, disabled: disabled || pending },
    ref,
    defaultRender: (props) => <button {...props}>Add</button>,
  });
});

describe('useRender', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the default element with the part contract', async () => {
    const onCommand = vi.fn();
    render(<TestAction onCommand={onCommand} />);
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onCommand).toHaveBeenCalledTimes(1);
  });

  describe('element form', () => {
    it('merges click, pending, disabled and data attributes into the host element', async () => {
      const onCommand = vi.fn();
      render(<TestAction onCommand={onCommand} pending render={<button>Host add</button>} />);
      const button = screen.getByRole('button', { name: 'Add' });
      expect(button).toHaveTextContent('Host add');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('data-pending', '');
      expect(button).toHaveAttribute('data-disabled', '');
    });

    it('keeps the host aria-label so the visible label stays the accessible name', () => {
      render(<TestAction render={<button aria-label="Add connection">Add connection</button>} />);
      expect(screen.getByRole('button', { name: 'Add connection' })).toBeInTheDocument();
    });

    it('runs the host handler first and lets preventDefault cancel the command', async () => {
      const calls: string[] = [];
      const onCommand = vi.fn(() => calls.push('part'));
      const { rerender } = render(
        <TestAction onCommand={onCommand} render={<button onClick={() => calls.push('host')} />} />,
      );
      await userEvent.click(screen.getByRole('button'));
      expect(calls).toEqual(['host', 'part']);

      rerender(
        <TestAction
          onCommand={onCommand}
          render={<button onClick={(e) => e.preventDefault()} />}
        />,
      );
      await userEvent.click(screen.getByRole('button'));
      expect(onCommand).toHaveBeenCalledTimes(1);
    });

    it('concatenates class names and keeps host-only props', () => {
      render(<TestAction render={<button className="host-class" data-track="add" />} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('part-class', 'host-class');
      expect(button).toHaveAttribute('data-track', 'add');
    });

    it('does not let the host override the part type', () => {
      render(<TestAction render={<button type="submit" />} />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('keeps a disabled link inert', async () => {
      const onCommand = vi.fn();
      const onHostClick = vi.fn();
      render(
        <TestAction
          disabled
          onCommand={onCommand}
          render={
            <a href="#add" onClick={onHostClick}>
              Add
            </a>
          }
        />,
      );
      const link = screen.getByText('Add');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      await userEvent.click(link);
      expect(onCommand).not.toHaveBeenCalled();
      expect(onHostClick).not.toHaveBeenCalled();
    });

    it('forwards both the host ref and the part ref', () => {
      const hostRef = React.createRef<HTMLButtonElement>();
      const partRef = React.createRef<HTMLButtonElement>();
      render(<TestAction ref={partRef} render={<button ref={hostRef} />} />);
      expect(hostRef.current).toBeInstanceOf(HTMLButtonElement);
      expect(partRef.current).toBe(hostRef.current);
    });

    it('warns and falls back to the default element for a Fragment', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <TestAction
          render={
            <>
              <span>a</span>
            </>
          }
        />,
      );
      expect(warn).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });
  });

  describe('function form', () => {
    it('passes merged props and state to the host', async () => {
      const onCommand = vi.fn();
      const renderFn = vi.fn((props, state: ActionPartState) => (
        <button {...props}>{state.pending ? 'Saving' : 'Host add'}</button>
      ));
      render(<TestAction onCommand={onCommand} render={renderFn} />);
      expect(renderFn).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'button', 'aria-label': 'Add' }),
        { pending: false, disabled: false },
      );
      await userEvent.click(screen.getByRole('button', { name: 'Add' }));
      expect(onCommand).toHaveBeenCalledTimes(1);
    });

    it('lets the host show pending state', () => {
      render(
        <TestAction
          pending
          render={(props, state) => <button {...props}>{state.pending ? 'Saving' : 'Add'}</button>}
        />,
      );
      expect(screen.getByRole('button')).toHaveTextContent('Saving');
    });
  });
});

describe('mergeProps', () => {
  it('unions disabled', () => {
    expect(mergeProps({ disabled: false }, { disabled: true }).disabled).toBe(true);
    expect(mergeProps({ disabled: true }, { disabled: false }).disabled).toBe(true);
  });

  it('chains non-event handlers such as onCheckedChange', () => {
    const part = vi.fn();
    const host = vi.fn();
    const merged = mergeProps({ onCheckedChange: part }, { onCheckedChange: host });
    (merged.onCheckedChange as (checked: boolean) => void)(true);
    expect(host).toHaveBeenCalledWith(true);
    expect(part).toHaveBeenCalledWith(true);
  });
});

describe('contracts', () => {
  it('submit contract has no click handler and marks pending', () => {
    expect(getSubmitContract({ disabled: false, pending: true, form: 'f' })).toEqual({
      type: 'submit',
      disabled: true,
      'aria-busy': true,
      form: 'f',
    });
  });

  it('switch contract exposes checked and onCheckedChange', () => {
    const onCheckedChange = vi.fn();
    expect(
      getSwitchContract({ checked: true, onCheckedChange, disabled: false, pending: false }),
    ).toMatchObject({ role: 'switch', checked: true, 'aria-checked': true, onCheckedChange });
  });
});

describe('createCompoundContext', () => {
  it('throws a readable error outside the root', () => {
    const [, useTestContext] = createCompoundContext<{ value: number }>('TestComponent');
    function Part() {
      useTestContext('Part');
      return null;
    }
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Part />)).toThrow(
      '<TestComponent.Part> must be rendered inside <TestComponent.Root>.',
    );
  });
});
