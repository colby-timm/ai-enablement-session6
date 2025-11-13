import React from 'react';
import { render, screen } from '@testing-library/react';
import OverdueSummary from '../OverdueSummary';

describe('OverdueSummary Component', () => {
  it('should display overdue count when count is greater than 0', () => {
    render(<OverdueSummary count={3} />);
    
    expect(screen.getByText('3 todos overdue')).toBeInTheDocument();
  });

  it('should display singular "todo" when count is 1', () => {
    render(<OverdueSummary count={1} />);
    
    expect(screen.getByText('1 todo overdue')).toBeInTheDocument();
  });

  it('should not render when count is 0', () => {
    const { container } = render(<OverdueSummary count={0} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should have proper ARIA attributes', () => {
    render(<OverdueSummary count={2} />);
    
    const summary = screen.getByRole('status');
    expect(summary).toHaveAttribute('aria-live', 'polite');
  });

  it('should display warning icon', () => {
    render(<OverdueSummary count={5} />);
    
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });
});
