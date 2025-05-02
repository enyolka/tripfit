import { useState, useCallback } from 'react';
import type { JourneyDTO, CreateJourneyCommand } from '../../types';

interface UseJourneysReturn {
    journeys: JourneyDTO[];
    isLoading: boolean;
    error: string | null;
    fetchJourneys: () => Promise<void>;
    deleteJourney: (id: number) => Promise<void>;
    filterJourneys: (searchQuery: string, sortBy: 'date' | 'status' | 'name') => void;
    createJourney: (journey: CreateJourneyCommand) => Promise<void>;
}

export function useJourneys(): UseJourneysReturn {
    const [journeys, setJourneys] = useState<JourneyDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [originalJourneys, setOriginalJourneys] = useState<JourneyDTO[]>([]);

    const fetchJourneys = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/journeys');
            if (!response.ok) {
                throw new Error('Failed to fetch journeys');
            }
            const { journeys: data } = await response.json();
            setJourneys(data);
            setOriginalJourneys(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching journeys');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createJourney = useCallback(async (journey: CreateJourneyCommand) => {
        try {
            setError(null);
            const response = await fetch('/api/journeys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(journey),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create journey');
            }
            
            const newJourney = await response.json();
            setJourneys(prev => [...prev, newJourney]);
            setOriginalJourneys(prev => [...prev, newJourney]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while creating journey');
            throw err;
        }
    }, []);

    const deleteJourney = useCallback(async (id: number) => {
        try {
            setError(null);
            const response = await fetch(`/api/journeys/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete journey');
            }
            setJourneys(prev => prev.filter(journey => journey.id !== id));
            setOriginalJourneys(prev => prev.filter(journey => journey.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while deleting journey');
            throw err;
        }
    }, []);

    const filterJourneys = useCallback((searchQuery: string, sortBy: 'date' | 'status' | 'name') => {
        let filtered = [...originalJourneys];

        if (searchQuery) {
            filtered = filtered.filter(journey => 
                journey.destination.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.departure_date).getTime() - new Date(a.departure_date).getTime();
                case 'name':
                    return a.destination.localeCompare(b.destination);
                case 'status':
                    // Add status comparison logic if needed
                    return 0;
                default:
                    return 0;
            }
        });

        setJourneys(filtered);
    }, [originalJourneys]);

    return {
        journeys,
        isLoading,
        error,
        fetchJourneys,
        deleteJourney,
        filterJourneys,
        createJourney
    };
}