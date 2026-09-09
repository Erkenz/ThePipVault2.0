import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the main heading correctly', () => {
    render(<HomePage />);
    
    // We zoeken naar een H1 element
    const heading = screen.getByRole('heading', { level: 1 });
    
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Trading Success. Systematized./i);
  });

  it('renders the call to action button', () => {
    render(<HomePage />);
    
    const link = screen.getByRole('link', { name: /Start journaling free/i });
    
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
  });
});