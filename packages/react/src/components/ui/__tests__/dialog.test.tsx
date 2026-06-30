import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Dialog, DialogContent, DialogTitle } from '../dialog';

describe('DialogContent', () => {
  it('applies default z-50 class to the overlay', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
          body
        </DialogContent>
      </Dialog>,
    );
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay?.className).toContain('z-50');
  });

  it('applies default z-[999] class to the content', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
          body
        </DialogContent>
      </Dialog>,
    );
    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content?.className).toContain('z-[999]');
  });

  it('merges consumer className onto the content element', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent className="z-[9000] max-w-2xl">
          <DialogTitle>Test</DialogTitle>
          body
        </DialogContent>
      </Dialog>,
    );
    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content?.className).toContain('z-[9000]');
    expect(content?.className).toContain('max-w-2xl');
  });
});
