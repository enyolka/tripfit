import type { SupabaseClient } from '../../db/supabase.client';
import type { GenerationDTO } from '../../types';

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code: 'JOURNEY_NOT_FOUND' | 'DATABASE_ERROR',
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

export class GenerationService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getGenerationsForJourney(journeyId: number): Promise<GenerationDTO[]> {
    try {
      // TEMPORARY: Skip user verification, just check if journey exists
      const { data: journey, error: journeyError } = await this.supabase
        .from('journeys')
        .select('id')
        .eq('id', journeyId)
        .single();

      if (journeyError) {
        throw new GenerationError(
          'Failed to fetch journey',
          'DATABASE_ERROR',
          journeyError
        );
      }

      if (!journey) {
        throw new GenerationError(
          'Journey not found',
          'JOURNEY_NOT_FOUND'
        );
      }

      // Get all generations for the journey
      const { data: generations, error: generationsError } = await this.supabase
        .from('generations')
        .select('*')
        .eq('journey_id', journeyId)
        .order('created_at', { ascending: false });

      if (generationsError) {
        throw new GenerationError(
          'Failed to fetch generations',
          'DATABASE_ERROR',
          generationsError
        );
      }

      // Map and normalize the data
      return generations?.map(generation => ({
        ...generation,
        generated_text: generation.generated_text || '',
        status: generation.status || 'generated'
      } as GenerationDTO)) || [];
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }

      // Wrap unknown errors
      throw new GenerationError(
        'Unexpected error occurred while fetching generations',
        'DATABASE_ERROR',
        error
      );
    }
  }
}