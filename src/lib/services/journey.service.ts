import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateJourneyCommand, JourneyDTO } from '../../types';
import type { Database } from '../../db/database.types';
import { DEFAULT_USER_ID } from '../../db/supabase.client';

class JourneyServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'JourneyServiceError';
  }
}

export class JourneyService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createJourney(command: CreateJourneyCommand): Promise<JourneyDTO> {
    try {
      const { data, error } = await this.supabase
        .from('journeys')
        .insert({
          destination: command.destination,
          departure_date: command.departure_date,
          return_date: command.return_date,
          activities: command.activities,
          additional_notes: command.additional_notes || [],
          user_id: DEFAULT_USER_ID
        })
        .select()
        .single();

      if (error) {
        // Handle specific database errors
        switch (error.code) {
          case '23505': // unique_violation
            throw new JourneyServiceError(
              'A journey with these details already exists',
              'DUPLICATE_JOURNEY',
              error
            );
          case '23503': // foreign_key_violation
            throw new JourneyServiceError(
              'Referenced user does not exist',
              'INVALID_USER_REFERENCE',
              error
            );
          case '23514': // check_violation
            throw new JourneyServiceError(
              'Journey data violates database constraints',
              'CONSTRAINT_VIOLATION',
              error
            );
          default:
            throw new JourneyServiceError(
              'Failed to create journey',
              'DATABASE_ERROR',
              error
            );
        }
      }

      if (!data) {
        throw new JourneyServiceError(
          'No data returned after journey creation',
          'NO_DATA_RETURNED'
        );
      }

      return {
        ...data,
        additional_notes: Array.isArray(data.additional_notes) 
          ? data.additional_notes 
          : []
      };
    } catch (error) {
      if (error instanceof JourneyServiceError) {
        throw error;
      }

      throw new JourneyServiceError(
        'An unexpected error occurred while creating the journey',
        'UNEXPECTED_ERROR',
        error
      );
    }
  }

  async getJourneys(): Promise<JourneyDTO[]> {
    try {
      const { data, error } = await this.supabase
        .from('journeys')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false });

      if (error) {
        throw new JourneyServiceError(
          'Failed to fetch journeys',
          'DATABASE_ERROR',
          error
        );
      }

      if (!data) {
        return [];
      }

      return data.map(journey => ({
        ...journey,
        additional_notes: Array.isArray(journey.additional_notes)
          ? journey.additional_notes
          : []
      }));
    } catch (error) {
      if (error instanceof JourneyServiceError) {
        throw error;
      }

      throw new JourneyServiceError(
        'An unexpected error occurred while fetching journeys',
        'UNEXPECTED_ERROR',
        error
      );
    }
  }

  async deleteJourney(journeyId: number): Promise<void> {
    try {
      // First check if journey exists and belongs to user
      const { data: journey, error: checkError } = await this.supabase
        .from('journeys')
        .select('id')
        .eq('id', journeyId)
        .eq('user_id', DEFAULT_USER_ID)
        .single();

      if (checkError || !journey) {
        throw new JourneyServiceError(
          'Journey not found or access denied',
          'NOT_FOUND'
        );
      }

      // Delete the journey (related records will be deleted via ON DELETE CASCADE)
      const { error: deleteError } = await this.supabase
        .from('journeys')
        .delete()
        .eq('id', journeyId)
        .eq('user_id', DEFAULT_USER_ID);

      if (deleteError) {
        throw new JourneyServiceError(
          'Failed to delete journey',
          'DATABASE_ERROR',
          deleteError
        );
      }
    } catch (error) {
      if (error instanceof JourneyServiceError) {
        throw error;
      }

      throw new JourneyServiceError(
        'An unexpected error occurred while deleting the journey',
        'UNEXPECTED_ERROR',
        error
      );
    }
  }
}