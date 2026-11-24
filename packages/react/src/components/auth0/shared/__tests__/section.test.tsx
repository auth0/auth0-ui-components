import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Section } from '@/components/auth0/shared/section';

describe('Section', () => {
  it('renders the title and description', () => {
    render(
      <Section title="Heading" description="Details">
        <p>content</p>
      </Section>,
    );

    expect(screen.getByRole('heading', { name: 'Heading' })).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders no header row without a title, description or actions', () => {
    const { container } = render(
      <Section>
        <p>content</p>
      </Section>,
    );

    expect(container.firstElementChild?.children).toHaveLength(1);
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
