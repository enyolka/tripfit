import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useJourneyDetails } from '../../../../src/components/hooks/useJourneyDetails';
import { toast } from 'sonner';

// Mock fetch API
global.fetch = vi.fn();

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useJourneyDetails Hook', () => {
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

  const mockFetchResponse = (status: number, data: any) =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches journey details on mount', async () => {
    // Mock successful fetch calls
    (fetch as any)
      .mockImplementationOnce(() => mockFetchResponse(200, mockJourney))
      .mockImplementationOnce(() => mockFetchResponse(200, mockGenerations));

    const { result } = renderHook(() => useJourneyDetails(1));

    // Initial state should show loading
    expect(result.current.isLoadingJourney).toBe(true);
    expect(result.current.isLoadingGenerations).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoadingJourney).toBe(false);
      expect(result.current.isLoadingGenerations).toBe(false);
    });

    // Verify data is loaded correctly
    expect(result.current.journey).toEqual(mockJourney);
    expect(result.current.generations).toEqual(mockGenerations);

    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledWith(`/api/journeys/1`);
    expect(fetch).toHaveBeenCalledWith(`/api/journeys/1/generations`);
  });

  it('handles update journey correctly', async () => {
    // Mock fetch responses
    (fetch as any)
      .mockImplementationOnce(() => mockFetchResponse(200, mockJourney))
      .mockImplementationOnce(() => mockFetchResponse(200, mockGenerations))
      .mockImplementationOnce(() => mockFetchResponse(200, { ...mockJourney, destination: 'Rome' }));

    const { result } = renderHook(() => useJourneyDetails(1));

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.isLoadingJourney).toBe(false);
    });

    // Call the update function
    const updateData = { destination: 'Rome' };
    await act(async () => {
      await result.current.updateJourney(updateData);
    });

    // Verify loading states were managed correctly
    expect(result.current.isUpdatingJourney).toBe(false);

    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledWith(`/api/journeys/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    // Verify toast was called
    expect(toast.success).toHaveBeenCalledWith('Journey updated successfully');
  });

  it('handles generate plan correctly', async () => {
    const newPlan = {
      id: 102,
      journey_id: 1,
      generated_text: 'New plan content',
      edited_text: null,
      status: 'generated',
      created_at: '2025-05-10T00:00:00Z',
      updated_at: '2025-05-10T00:00:00Z',
    };

    // Mock fetch responses
    (fetch as any)
      .mockImplementationOnce(() => mockFetchResponse(200, mockJourney))
      .mockImplementationOnce(() => mockFetchResponse(200, mockGenerations))
      .mockImplementationOnce(() => mockFetchResponse(201, newPlan));

    const { result } = renderHook(() => useJourneyDetails(1));

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.isLoadingJourney).toBe(false);
    });

    // Call the generate plan function
    await act(async () => {
      await result.current.generatePlan();
    });

    // Verify loading states were managed correctly
    expect(result.current.isGeneratingPlan).toBe(false);

    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledWith(`/api/journeys/1/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_preferences: undefined }),
    });

    // Verify toast was called
    expect(toast.success).toHaveBeenCalledWith('Plan generated successfully');

    // Verify new plan is added to the list (at the beginning)
    expect(result.current.generations[0]).toEqual(newPlan);
  });

  it('handles plan deletion correctly', async () => {
    // Mock fetch responses
    (fetch as any)
      .mockImplementationOnce(() => mockFetchResponse(200, mockJourney))
      .mockImplementationOnce(() => mockFetchResponse(200, mockGenerations))
      .mockImplementationOnce(() => mockFetchResponse(200, {}));

    const { result } = renderHook(() => useJourneyDetails(1));

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.isLoadingJourney).toBe(false);
    });

    // Set up the plan to delete
    act(() => {
      result.current.requestDeletePlan(101);
    });
    
    expect(result.current.planToDeleteId).toBe(101);

    // Delete the plan
    await act(async () => {
      await result.current.deletePlan(101);
    });

    // Verify loading states were managed correctly
    expect(result.current.isDeletingPlan).toBe(null);
    expect(result.current.planToDeleteId).toBe(null);

    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledWith(`/api/generations/101`, {
      method: 'DELETE',
    });

    // Verify toast was called
    expect(toast.success).toHaveBeenCalledWith('Plan deleted successfully');

    // Verify plan is removed from the list
    expect(result.current.generations).toHaveLength(0);
  });

  it('handles error cases properly', async () => {
    const errorMessage = 'Journey not found';
    
    // Mock failed fetch
    (fetch as any).mockImplementationOnce(() => 
      mockFetchResponse(404, { error: errorMessage })
    );

    const { result } = renderHook(() => useJourneyDetails(999));

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isLoadingJourney).toBe(false);
    });

    // Verify error state is set
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.journey).toBe(null);
    
    // Verify toast error was called
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('handles update plan correctly', async () => {
    const planId = 101;
    const editedText = 'Updated itinerary content';
    const updatedPlan = {
      ...mockGenerations[0],
      edited_text: editedText,
      status: 'accepted_edited'
    };

    // Mock fetch responses
    (fetch as any)
      .mockImplementationOnce(() => mockFetchResponse(200, mockJourney))
      .mockImplementationOnce(() => mockFetchResponse(200, mockGenerations))
      .mockImplementationOnce(() => mockFetchResponse(200, updatedPlan));

    const { result } = renderHook(() => useJourneyDetails(1));

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.isLoadingJourney).toBe(false);
    });

    // Update the plan
    await act(async () => {
      await result.current.updatePlan(planId, editedText);
    });

    // Verify loading states were managed correctly
    expect(result.current.isUpdatingPlan).toBe(null);

    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledWith(`/api/generations/${planId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        edited_text: editedText,
        status: 'accepted_edited',
      }),
    });

    // Verify toast was called
    expect(toast.success).toHaveBeenCalledWith('Plan updated successfully');

    // Verify plan is updated in the list
    expect(result.current.generations[0]).toEqual(updatedPlan);
  });
});