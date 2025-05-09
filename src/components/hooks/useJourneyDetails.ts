import { useState, useCallback, useEffect } from 'react';
import type { JourneyDTO, GenerationDTO, UpdateJourneyCommand, CreateGenerationCommand } from '../../types';
import { toast } from 'sonner';

interface UseJourneyDetailsReturn {
  journey: JourneyDTO | null;
  generations: GenerationDTO[];
  isLoadingJourney: boolean;
  isLoadingGenerations: boolean;
  isGeneratingPlan: boolean;
  isUpdatingJourney: boolean;
  isUpdatingPlan: number | null;
  isDeletingPlan: number | null;
  planToDeleteId: number | null;
  error: string | null;
  fetchJourneyDetails: () => Promise<void>;
  updateJourney: (data: UpdateJourneyCommand) => Promise<void>;
  generatePlan: (preferences?: Record<string, any>) => Promise<void>;
  updatePlan: (id: number, editedText: string) => Promise<void>;
  deletePlan: (id: number) => Promise<void>;
  requestDeletePlan: (id: number) => void;
  cancelDeletePlan: () => void;
}

export function useJourneyDetails(journeyId: number): UseJourneyDetailsReturn {
  const [journey, setJourney] = useState<JourneyDTO | null>(null);
  const [generations, setGenerations] = useState<GenerationDTO[]>([]);
  const [isLoadingJourney, setIsLoadingJourney] = useState(true);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isUpdatingJourney, setIsUpdatingJourney] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState<number | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState<number | null>(null);
  const [planToDeleteId, setPlanToDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchJourneyDetails = useCallback(async () => {
    setError(null);
    setIsLoadingJourney(true);
    setIsLoadingGenerations(true);

    try {
      // First fetch journey details
      const journeyResponse = await fetch(`/api/journeys/${journeyId}`);
      if (!journeyResponse.ok) {
        const journeyError = await journeyResponse.json();
        throw new Error(journeyError.error || 'Failed to fetch journey details');
      }
      const journeyData = await journeyResponse.json();
      setJourney(journeyData);

      // Then fetch generations if journey exists
      try {
        const generationsResponse = await fetch(`/api/journeys/${journeyId}/generations`);
        if (generationsResponse.ok) {
          const generationsData = await generationsResponse.json();
          setGenerations(generationsData);
        } else if (generationsResponse.status !== 404) {
          // Only treat non-404 responses as errors
          const generationsError = await generationsResponse.json();
          console.warn('Failed to fetch generations:', generationsError);
          setGenerations([]); // Set empty array only on error
        } else {
          // Set empty array for new journeys or 404 cases
          setGenerations([]);
        }
      } catch (genErr) {
        console.warn('Error fetching generations:', genErr);
        setGenerations([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      setJourney(null);
      setGenerations([]);
    } finally {
      setIsLoadingJourney(false);
      setIsLoadingGenerations(false);
    }
  }, [journeyId]);

  const updateJourney = async (data: UpdateJourneyCommand) => {
    try {
      setIsUpdatingJourney(true);
      setError(null);

      const response = await fetch(`/api/journeys/${journeyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update journey');
      }

      const updatedJourney = await response.json();
      setJourney(updatedJourney);
      toast.success('Journey updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update journey';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsUpdatingJourney(false);
    }
  };

  const generatePlan = async (preferences?: Record<string, any>) => {
    try {
      setIsGeneratingPlan(true);
      setError(null);

      const response = await fetch(`/api/journeys/${journeyId}/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_preferences: preferences }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Format error message, prioritizing the error message from the API
        const errorMessage = data.message || data.error || `Failed to generate plan (${response.status})`;
        throw new Error(errorMessage);
      }

      setGenerations(prev => [data, ...prev]);
      toast.success('Plan generated successfully');
    } catch (err) {
      // Set error state but don't show toast - error message is already shown by the ErrorBoundary
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(errorMessage);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const updatePlan = async (id: number, editedText: string) => {
    try {
      setIsUpdatingPlan(id);
      setError(null);

      const response = await fetch(`/api/generations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edited_text: editedText,
          status: 'accepted_edited',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }

      const updatedPlan = await response.json();
      setGenerations(prev =>
        prev.map(plan => (plan.id === id ? updatedPlan : plan))
      );
      toast.success('Plan updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update plan';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsUpdatingPlan(null);
    }
  };

  const deletePlan = async (id: number) => {
    try {
      setIsDeletingPlan(id);
      setError(null);

      const response = await fetch(`/api/generations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete plan');
      }

      setGenerations(prev => prev.filter(plan => plan.id !== id));
      setPlanToDeleteId(null);
      toast.success('Plan deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete plan';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsDeletingPlan(null);
    }
  };

  const requestDeletePlan = (id: number) => {
    setPlanToDeleteId(id);
  };

  const cancelDeletePlan = () => {
    setPlanToDeleteId(null);
  };

  useEffect(() => {
    fetchJourneyDetails();
  }, [fetchJourneyDetails]);

  return {
    journey,
    generations,
    isLoadingJourney,
    isLoadingGenerations,
    isGeneratingPlan,
    isUpdatingJourney,
    isUpdatingPlan,
    isDeletingPlan,
    planToDeleteId,
    error,
    fetchJourneyDetails,
    updateJourney,
    generatePlan,
    updatePlan,
    deletePlan,
    requestDeletePlan,
    cancelDeletePlan,
  };
}