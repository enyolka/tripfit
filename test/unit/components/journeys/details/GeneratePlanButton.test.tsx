import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GeneratePlanButton } from '../../../../../src/components/journeys/details/GeneratePlanButton';

describe('GeneratePlanButton Component', () => {
  const mockGeneratePlan = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneratePlan.mockResolvedValue(undefined);
  });
  
  it('renders correctly with default state', () => {
    render(<GeneratePlanButton onGeneratePlan={mockGeneratePlan} isLoading={false} />);
      const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/generate travel plan/i);
    expect(button).not.toBeDisabled();
  });
  
  it('shows loading state when isLoading is true', () => {
    render(<GeneratePlanButton onGeneratePlan={mockGeneratePlan} isLoading={true} />);
      const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText(/generating plan/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // For the spinner
  });
  
  it('calls onGeneratePlan when clicked', () => {
    render(<GeneratePlanButton onGeneratePlan={mockGeneratePlan} isLoading={false} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockGeneratePlan).toHaveBeenCalledTimes(1);
  });
  
  it('has proper accessibility attributes', () => {
    // Test regular state
    const { rerender } = render(
      <GeneratePlanButton onGeneratePlan={mockGeneratePlan} isLoading={false} />
    );
    
    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'false');
    
    // Test loading state
    rerender(<GeneratePlanButton onGeneratePlan={mockGeneratePlan} isLoading={true} />);    button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    
    // Check for loading indicator or screen reader text
    expect(screen.getByText(/generating plan/i)).toBeInTheDocument();
    expect(screen.getByText(/please wait while your travel plan is being generated/i)).toBeInTheDocument();
  });
  
  it('does not allow clicking when loading', () => {
    render(<GeneratePlanButton onGeneratePlan={mockGeneratePlan} isLoading={true} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockGeneratePlan).not.toHaveBeenCalled();
  });
});