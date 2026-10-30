import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MarkdownContent } from '@/components/auth0/shared/markdown-content';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({ t: (key: string) => key }),
}));

const BASE_URL = 'https://acme.auth0.com/my-org/public/instructions';

describe('MarkdownContent', () => {
  describe('preprocessing', () => {
    it('dedents indented text so it is not rendered as a code block', () => {
      const { container } = render(
        <MarkdownContent text={'\n    Select **Applications**.\n\n    Then save.\n'} />,
      );

      expect(container.querySelector('pre')).toBeNull();
      expect(screen.getByText('Applications').tagName).toBe('STRONG');
      expect(screen.getByText('Then save.')).toBeInTheDocument();
    });

    it('interpolates the company name', () => {
      render(
        <MarkdownContent
          text="To provision users to {{companyName}}, create an app."
          values={{ companyName: 'Acme' }}
        />,
      );

      expect(screen.getByText('To provision users to Acme, create an app.')).toBeInTheDocument();
    });
  });

  describe('images', () => {
    it('resolves relative image paths against base_url', () => {
      render(<MarkdownContent text="![Okta apps](/img/okta/1.png)" baseUrl={BASE_URL} />);

      const img = screen.getByRole('img', { name: 'Okta apps' });
      expect(img).toHaveAttribute('src', `${BASE_URL}/img/okta/1.png`);
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it.each(['javascript:alert(1)', 'data:image/png;base64,AA', 'http://insecure.test/a.png'])(
      'does not render an image for %s',
      (src) => {
        const { container } = render(<MarkdownContent text={`![x](${src})`} baseUrl={BASE_URL} />);

        expect(container.querySelector('img')).toBeNull();
      },
    );

    it('does not render relative images without a base_url', () => {
      const { container } = render(<MarkdownContent text="![x](/img/1.png)" />);

      expect(container.querySelector('img')).toBeNull();
    });
  });

  describe('links', () => {
    it('opens external links in a new tab without an opener', () => {
      render(<MarkdownContent text="[Okta docs](https://help.okta.com)" />);

      const link = screen.getByRole('link', { name: 'Okta docs' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('keeps in-page links in the same tab', () => {
      render(<MarkdownContent text="[Below](#below)" />);

      expect(screen.getByRole('link', { name: 'Below' })).not.toHaveAttribute('target');
    });
  });

  describe('raw HTML', () => {
    it('never renders raw HTML elements', () => {
      const { container } = render(
        <MarkdownContent
          text={'Hi <b>there</b> <img src="x" onerror="alert(1)"> <script>alert(1)</script>'}
        />,
      );

      expect(container.querySelector('b, script, img')).toBeNull();
      expect(container.textContent).toContain('Hi there');
    });
  });

  describe('code blocks', () => {
    let writeText: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('adds a copy button that copies the block text', async () => {
      render(<MarkdownContent text={'```\nemails[type eq "work"].value\n```'} />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'copy' }));
      });

      expect(writeText).toHaveBeenCalledWith('emails[type eq "work"].value');
    });

    it('does not add a copy button for inline code', () => {
      render(<MarkdownContent text="Append `?aadOptscim062020` to the URL." />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('notice variant', () => {
    it('renders the text inside an info callout', () => {
      const { container } = render(
        <MarkdownContent text="This is a **separate** application." variant="notice" />,
      );

      const callout = screen.getByRole('note');
      expect(callout).toHaveAttribute('data-slot', 'alert');
      expect(callout).toHaveAttribute('data-variant', 'notice');
      expect(callout).toHaveTextContent('This is a separate application.');
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('does not announce as a live alert', () => {
      render(<MarkdownContent text="Note" variant="notice" />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('renders the default variant without a callout', () => {
      render(<MarkdownContent text="Plain" />);

      expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });
  });

  it('applies className to the outer element for both variants', () => {
    const { container, rerender } = render(<MarkdownContent text="a" className="custom" />);
    expect(container.firstElementChild).toHaveClass('custom');

    rerender(<MarkdownContent text="a" className="custom" variant="notice" />);
    expect(container.firstElementChild).toHaveClass('custom');
  });
});
