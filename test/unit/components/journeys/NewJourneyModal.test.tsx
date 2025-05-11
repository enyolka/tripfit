import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewJourneyModal } from '../../../../src/components/journeys/NewJourneyModal';
import { toast } from 'sonner';
import type { CreateJourneyCommand, PreferenceDTO } from '../../../../src/types';

// Mock the modules
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn()
  }
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('NewJourneyModal', () => {
  // Common props for tests
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit
  };
  
  // Mock console.error
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });

  // Mock data
  const mockPreferences: PreferenceDTO[] = [
    {
        id: "1", user_id: 'user1', activity_name: 'Hiking', level: 3,
        created_at: '',
        updated_at: ''
    },
    {
        id: "2", user_id: 'user1', activity_name: 'Swimming', level: 2,
        created_at: '',
        updated_at: ''
    }
  ];

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const validJourneyData: CreateJourneyCommand = {
      destination: 'Mountains',
      departure_date: formatDate(tomorrowDate),
      return_date: formatDate(nextWeekDate),
      activities: 'Hiking - poziom 3, Swimming - poziom 2',
      additional_notes: [],
      user_id: 'user1'
  };

  // Setup and teardown
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock successful API response by default
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPreferences
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Tests grouped by functionality
  describe('Initialization and API Integration', () => {
    it('should load user preferences when modal opens', async () => {
      render(<NewJourneyModal {...defaultProps} />);
      
      // Verify the loading state is shown
      expect(screen.getByText('Loading your activity preferences...')).toBeInTheDocument();
      
      // Wait for preferences to load
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/preferences');
        expect(screen.queryByText('Loading your activity preferences...')).not.toBeInTheDocument();
      });
      
      // Verify activities are rendered from preferences
      expect(screen.getAllByPlaceholderText('Enter activity')).toHaveLength(2);
      expect(screen.getAllByPlaceholderText('Level 1-5')).toHaveLength(2);
    });
    
    it('should handle API error when fetching preferences', async () => {
      // Mock API error
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Could not load your activity preferences');
        expect(screen.getByText('No activities added. Click "Add Activity" to start.')).toBeInTheDocument();
      });
    });
    
    it('should handle empty preferences response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => []
      });
      
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('No activities added. Click "Add Activity" to start.')).toBeInTheDocument();
      });
    });
    
    it('should handle non-OK API response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
      });
      
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Could not load your activity preferences');
      });
    });
  });
  
  describe('Form Validation', () => {
    it('should prevent submission when destination is missing', async () => {
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // Fill only dates
      fireEvent.change(screen.getByLabelText(/Departure Date/i), { 
        target: { value: validJourneyData.departure_date } 
      });
      fireEvent.change(screen.getByLabelText(/Return Date/i), { 
        target: { value: validJourneyData.return_date } 
      });
      
      // Try to submit
      fireEvent.click(screen.getByText('Create Journey'));
      
      // Verify onSubmit wasn't called
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    
    it('should prevent submission when departure date is missing', async () => {
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // Fill only destination and return date
      fireEvent.change(screen.getByLabelText(/Destination/i), { 
        target: { value: validJourneyData.destination } 
      });
      fireEvent.change(screen.getByLabelText(/Return Date/i), { 
        target: { value: validJourneyData.return_date } 
      });
      
      // Try to submit
      fireEvent.click(screen.getByText('Create Journey'));
      
      // Verify onSubmit wasn't called
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    
    it('should prevent submission when return date is missing', async () => {
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // Fill only destination and departure date
      fireEvent.change(screen.getByLabelText(/Destination/i), { 
        target: { value: validJourneyData.destination } 
      });
      fireEvent.change(screen.getByLabelText(/Departure Date/i), { 
        target: { value: validJourneyData.departure_date } 
      });
      
      // Try to submit
      fireEvent.click(screen.getByText('Create Journey'));
      
      // Verify onSubmit wasn't called
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    
    it('should enforce minimum date on return date based on departure date', async () => {
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // Get the return date input
      const returnDateInput = screen.getByLabelText(/Return Date/i);
      expect(returnDateInput).toHaveAttribute('min', '2024-01-01');
      
      // Set departure date
      fireEvent.change(screen.getByLabelText(/Departure Date/i), { 
        target: { value: validJourneyData.departure_date } 
      });
      
      // Verify min date on return date is updated
      expect(returnDateInput).toHaveAttribute('min', validJourneyData.departure_date);
    });
  });
  
  describe('Activity Management', () => {
    it('should add a new activity when add button is clicked', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => []
      });
      
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading your activity preferences...')).not.toBeInTheDocument();
      });
      
      // Initially no activities
      expect(screen.queryByPlaceholderText('Enter activity')).not.toBeInTheDocument();
      
      // Click add activity button
      fireEvent.click(screen.getByText('+ Add Activity'));
      
      // Verify activity fields were added
      expect(screen.getByPlaceholderText('Enter activity')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Level 1-5')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Level 1-5')).toHaveValue(1); // Default level
    });
    
    it('should remove an activity when remove button is clicked', async () => {
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        expect(screen.getAllByPlaceholderText('Enter activity')).toHaveLength(2);
      });
      
      // Click the first activity's remove button
      const removeButtons = screen.getAllByLabelText('Remove activity');
      fireEvent.click(removeButtons[0]);
      
      // Verify one activity was removed
      expect(screen.getAllByPlaceholderText('Enter activity')).toHaveLength(1);
    });
    
    it('should update activity name correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: 1, user_id: 'user1', activity_name: 'Hiking', level: 3 }]
      });
      
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // Get the activity input and change it
      const activityInput = screen.getByPlaceholderText('Enter activity');
      fireEvent.change(activityInput, { target: { value: 'Mountain Climbing' } });
      
      // Verify input value changed
      expect(activityInput).toHaveValue('Mountain Climbing');
      
      // Submit the form with all required fields
      fireEvent.change(screen.getByLabelText(/Destination/i), { 
        target: { value: validJourneyData.destination } 
      });
      fireEvent.change(screen.getByLabelText(/Departure Date/i), { 
        target: { value: validJourneyData.departure_date } 
      });
      fireEvent.change(screen.getByLabelText(/Return Date/i), { 
        target: { value: validJourneyData.return_date } 
      });
      
      fireEvent.click(screen.getByText('Create Journey'));
      
      // Verify the updated activity was included in submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
          activities: 'Mountain Climbing - poziom 3'
        }));
      });
    });
    
    it('should update activity level correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: 1, user_id: 'user1', activity_name: 'Hiking', level: 3 }]
      });
      
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // Get the level input and change it
      const levelInput = screen.getByPlaceholderText('Level 1-5');
      fireEvent.change(levelInput, { target: { value: '5' } });
      
      // Verify input value changed
      expect(levelInput).toHaveValue(5);
      
      // Submit the form with all required fields
      fireEvent.change(screen.getByLabelText(/Destination/i), { 
        target: { value: validJourneyData.destination } 
      });
      fireEvent.change(screen.getByLabelText(/Departure Date/i), { 
        target: { value: validJourneyData.departure_date } 
      });
      fireEvent.change(screen.getByLabelText(/Return Date/i), { 
        target: { value: validJourneyData.return_date } 
      });
      
      fireEvent.click(screen.getByText('Create Journey'));
      
      // Verify the updated level was included in submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
          activities: 'Hiking - poziom 5'
        }));
      });
    });
    
    it('should correctly format multiple activities as string', async () => {
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        expect(screen.getAllByPlaceholderText('Enter activity')).toHaveLength(2);
      });
      
      // Fill form fields
      fireEvent.change(screen.getByLabelText(/Destination/i), { 
        target: { value: validJourneyData.destination } 
      });
      fireEvent.change(screen.getByLabelText(/Departure Date/i), { 
        target: { value: validJourneyData.departure_date } 
      });
      fireEvent.change(screen.getByLabelText(/Return Date/i), { 
        target: { value: validJourneyData.return_date } 
      });
      
      fireEvent.click(screen.getByText('Create Journey'));
      
      // Verify activities string format
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
          activities: 'Hiking - poziom 3, Swimming - poziom 2'
        }));
      });
    });
  });
  
  describe('Form Submission', () => {
    it('should submit form with all data when all required fields are filled', async () => {
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/Destination/i), { 
        target: { value: validJourneyData.destination } 
      });
      fireEvent.change(screen.getByLabelText(/Departure Date/i), { 
        target: { value: validJourneyData.departure_date } 
      });
      fireEvent.change(screen.getByLabelText(/Return Date/i), { 
        target: { value: validJourneyData.return_date } 
      });
      
      fireEvent.click(screen.getByText('Create Journey'));
      
      // Check submit was called with correct data
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
          destination: validJourneyData.destination,
          departure_date: validJourneyData.departure_date,
          return_date: validJourneyData.return_date,
          activities: validJourneyData.activities
        }));
      });
    });
    
    it('should disable submit button during form submission', async () => {
      // Mock onSubmit to resolve after a delay
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/Destination/i), { 
        target: { value: validJourneyData.destination } 
      });
      fireEvent.change(screen.getByLabelText(/Departure Date/i), { 
        target: { value: validJourneyData.departure_date } 
      });
      fireEvent.change(screen.getByLabelText(/Return Date/i), { 
        target: { value: validJourneyData.return_date } 
      });
      
      // Submit form
      const submitButton = screen.getByText('Create Journey');
      fireEvent.click(submitButton);
      
      // Verify button is disabled during submission
      expect(submitButton).toBeDisabled();
      
      // Wait for submission to complete
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
      it('should handle submission errors gracefully', async () => {
      // Mock onSubmit to reject and spy on console.error
      const errorMessage = 'Network error';
      mockOnSubmit.mockRejectedValue(new Error(errorMessage));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/Destination/i), { 
        target: { value: validJourneyData.destination } 
      });
      fireEvent.change(screen.getByLabelText(/Departure Date/i), { 
        target: { value: validJourneyData.departure_date } 
      });
      fireEvent.change(screen.getByLabelText(/Return Date/i), { 
        target: { value: validJourneyData.return_date } 
      });
      
      // Submit form
      fireEvent.click(screen.getByText('Create Journey'));
      
      // Wait for error to be handled
      await waitFor(() => {
        // Verify console.error was called with error message
        expect(consoleSpy).toHaveBeenCalledWith('Failed to create journey:', expect.any(Error));
        // Verify modal remains open (onClose not called)
        expect(mockOnClose).not.toHaveBeenCalled();
        // Verify button is re-enabled
        expect(screen.getByText('Create Journey')).not.toBeDisabled();
      });
      
      // Clean up the spy
      consoleSpy.mockRestore();
    });
    
    it('should close modal after successful submission', async () => {
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/Destination/i), { 
        target: { value: validJourneyData.destination } 
      });
      fireEvent.change(screen.getByLabelText(/Departure Date/i), { 
        target: { value: validJourneyData.departure_date } 
      });
      fireEvent.change(screen.getByLabelText(/Return Date/i), { 
        target: { value: validJourneyData.return_date } 
      });
      
      // Submit form
      fireEvent.click(screen.getByText('Create Journey'));
      
      // Wait for submission and verify modal was closed
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });
  
  describe('UI Rendering', () => {
    it('should render empty state when no activities and preferences loaded', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => []
      });
      
      render(<NewJourneyModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        expect(screen.getByText('No activities added. Click "Add Activity" to start.')).toBeInTheDocument();
      });
    });
    
    it('should close modal when Cancel button is clicked', async () => {
      render(<NewJourneyModal {...defaultProps} />);
      
      // Click Cancel button
      fireEvent.click(screen.getByText('Cancel'));
      
      // Verify onClose was called
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
