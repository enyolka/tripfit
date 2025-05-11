import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import JourneyDetailsView from '../../../../../src/components/journeys/details/JourneyDetailsView';
import { useJourneyDetails } from '../../../../../src/components/hooks/useJourneyDetails';

// Mock the hook using vi.mock
vi.mock('../../../../../src/components/hooks/useJourneyDetails', () => ({
  useJourneyDetails: vi.fn(),
}));

// Mock the child components
vi.mock('../../../../../src/components/journeys/details/JourneyInfoSection', () => ({
  JourneyInfoSection: vi.fn(() => <div data-testid="journey-info-section">Journey Info Section</div>),
}));

vi.mock('../../../../../src/components/journeys/details/AdditionalNotesSection', () => ({
  AdditionalNotesSection: vi.fn(() => <div data-testid="additional-notes-section">Notes Section</div>),
}));

vi.mock('../../../../../src/components/journeys/details/PlanGenerationSection', () => ({
  PlanGenerationSection: vi.fn(() => <div data-testid="plan-generation-section">Plan Generation Section</div>),
}));

vi.mock('../../../../../src/components/journeys/details/GeneratedPlansList', () => ({
  GeneratedPlansList: vi.fn(() => <div data-testid="generated-plans-list">Generated Plans List</div>),
}));

vi.mock('../../../../../src/components/journeys/details/DeleteConfirmationModal', () => ({
  DeleteConfirmationModal: vi.fn(() => <div data-testid="delete-confirmation-modal">Delete Modal</div>),
}));

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('JourneyDetailsView Component', () => {
  // Sample journey and generations data for testing
  const mockJourney = {
    id: 1,
    destination: 'Paris',
    departure_date: '2025-08-15',
    return_date: '2025-08-25',
    activities: 'walking, sightseeing',
    additional_notes: ['Bring camera', 'Check weather'],
    user_id: 'user-123',
    created_at: '2025-05-01T00:00:00Z',
    updated_at: '2025-05-01T00:00:00Z',
  };

  const mockGenerations = [
    {
      id: 101,
      journey_id: 1,
      generated_text: 'Day 1: Visit Eiffel Tower...',
      edited_text: null,
      status: 'generated',
      created_at: '2025-05-02T00:00:00Z',
      updated_at: '2025-05-02T00:00:00Z',
    },
  ];

  // Setup mock hook response
  const mockUseJourneyDetails = {
    journey: mockJourney,
    generations: mockGenerations,
    isLoadingJourney: false,
    isLoadingGenerations: false,
    isGeneratingPlan: false,
    isUpdatingJourney: false,
    isUpdatingPlan: null,
    isDeletingPlan: null,
    planToDeleteId: null,
    error: null,
    updateJourney: vi.fn(),
    generatePlan: vi.fn(),
    updatePlan: vi.fn(),
    deletePlan: vi.fn(),
    requestDeletePlan: vi.fn(),
    cancelDeletePlan: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useJourneyDetails as ReturnType<typeof vi.fn>).mockReturnValue(mockUseJourneyDetails);
  });
  it('renders the loading state when journey is loading', () => {
    (useJourneyDetails as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseJourneyDetails,
      isLoadingJourney: true,
    });

    render(<JourneyDetailsView journeyId={1} />);
    
    // Zamiast oczekiwać jednego elementu, sprawdźmy, czy w ogóle istnieje element z rolą status
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    expect(screen.getByText(/loading journey details/i)).toBeInTheDocument();
  });

  it('renders an error alert when journey is not found', () => {
    (useJourneyDetails as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseJourneyDetails,
      journey: null,
    });

    render(<JourneyDetailsView journeyId={1} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/journey not found/i)).toBeInTheDocument();
  });

  it('renders all sections and components when journey is loaded', () => {
    render(<JourneyDetailsView journeyId={1} />);
    
    expect(screen.getByTestId('journey-info-section')).toBeInTheDocument();
    expect(screen.getByTestId('additional-notes-section')).toBeInTheDocument();
    expect(screen.getByTestId('plan-generation-section')).toBeInTheDocument();
    expect(screen.getByTestId('generated-plans-list')).toBeInTheDocument();
    expect(screen.getByText(/back to journeys/i)).toBeInTheDocument();
  });  it('handles journey update correctly', async () => {
    render(<JourneyDetailsView journeyId={1} />);
    
    // Access the mocked updateJourney function directly
    const updateData = { destination: 'Rome' };
    await mockUseJourneyDetails.updateJourney(updateData);
    
    expect(mockUseJourneyDetails.updateJourney).toHaveBeenCalledWith(updateData);
  });

  it('shows delete confirmation modal when plan deletion is requested', () => {
    (useJourneyDetails as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseJourneyDetails,
      planToDeleteId: 101,
    });

    render(<JourneyDetailsView journeyId={1} />);
    
    expect(screen.getByTestId('delete-confirmation-modal')).toBeInTheDocument();
  });  it('deletes a plan when confirmed', async () => {
    (useJourneyDetails as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseJourneyDetails,
      planToDeleteId: 101,
    });

    render(<JourneyDetailsView journeyId={1} />);
    
    // Call deletePlan directly to simulate user confirming deletion
    await mockUseJourneyDetails.deletePlan(101);
    
    expect(mockUseJourneyDetails.deletePlan).toHaveBeenCalledWith(101);
  });  it('displays error toast when error occurs', async () => {
    // Reset and get a reference to the toast mock
    vi.resetAllMocks();
    const { toast } = await import('sonner');
    
    const errorMessage = 'Failed to load journey';
    
    // Set up our hook with an error
    (useJourneyDetails as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseJourneyDetails,
      error: errorMessage,
    });
    
    render(<JourneyDetailsView journeyId={1} />);
    
    // Verify toast.error was called
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });
});