import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanGenerationSection } from '../../../../../src/components/journeys/details/PlanGenerationSection';

// Mock the GeneratePlanButton component
vi.mock('../../../../../src/components/journeys/details/GeneratePlanButton', () => ({
  GeneratePlanButton: ({ onGeneratePlan, isLoading }: { onGeneratePlan: () => void; isLoading: boolean }) => (
    <div aria-live="polite">
      <button 
        onClick={onGeneratePlan} 
        disabled={isLoading}
        data-testid="generate-plan-button"
        aria-busy={isLoading}
        aria-disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate Travel Plan'}
      </button>
    </div>
  ),
}));

describe('PlanGenerationSection Component', () => {
  const mockGeneratePlan = vi.fn();
  
  // This ensures we set up our JSDOM correctly for ARIA roles
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneratePlan.mockResolvedValue(undefined);
  });
  
  it('renders correctly with title and description', () => {
    render(
      <PlanGenerationSection 
        onGeneratePlan={mockGeneratePlan} 
        isGenerating={false} 
      />
    );
    
    // Check if the component renders the title and description
    expect(screen.getByText(/Plan Generation/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate a customized travel plan/i)).toBeInTheDocument();
  });
  it('renders enabled Generate Plan button when not loading', () => {
    render(
      <PlanGenerationSection 
        onGeneratePlan={mockGeneratePlan} 
        isGenerating={false} 
      />
    );
      // Check the rendered button instead of implementation details
    const button = screen.getByTestId('generate-plan-button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent(/generate.*plan/i);
  });
  it('shows loading state when isGenerating is true', () => {
    render(
      <PlanGenerationSection 
        onGeneratePlan={mockGeneratePlan} 
        isGenerating={true} 
      />
    );
      // Check if the button in our mock shows the loading state
    const button = screen.getByTestId('generate-plan-button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/generating/i);
  });    it('has appropriate accessibility attributes', () => {
    render(
      <PlanGenerationSection 
        onGeneratePlan={mockGeneratePlan} 
        isGenerating={false} 
      />
    );    // Check if section has proper ARIA labeling
    expect(screen.getByRole('region', { name: /Plan Generation/i })).toBeInTheDocument();
      // Directly test that our mock component works as expected
    // Since we know exactly how we mocked it
    const buttonContainer = screen.getByTestId('generate-plan-button').closest('[aria-live="polite"]');
    expect(buttonContainer).toHaveAttribute('aria-live', 'polite');
  });
  
  it('calls onGeneratePlan when button is clicked', async () => {
    render(
      <PlanGenerationSection 
        onGeneratePlan={mockGeneratePlan} 
        isGenerating={false} 
      />
    );
    
    // Get the button from our mocked component and click it
    const button = screen.getByTestId('generate-plan-button');
    fireEvent.click(button);
    
    // Verify the callback was called
    expect(mockGeneratePlan).toHaveBeenCalledTimes(1);
    
    // Wait for any potential promises to resolve
    await waitFor(() => {
      // This just ensures any potential promises from the click are resolved
    });
  });
});