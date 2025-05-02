import type { SupabaseClient } from '../../db/supabase.client';
import type { GenerationDTO, UpdateGenerationCommand } from '../../types';

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code: 'JOURNEY_NOT_FOUND' | 'DATABASE_ERROR' | 'GENERATION_NOT_FOUND',
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

  async updateGeneration(generationId: number, command: UpdateGenerationCommand): Promise<GenerationDTO> {
    try {
      // First get the current generation to verify existence and access
      const { data: currentGeneration, error: getError } = await this.supabase
        .from('generations')
        .select('*')
        .eq('id', generationId)
        .single();

      if (getError || !currentGeneration) {
        throw new GenerationError(
          'Generation not found or access denied',
          'GENERATION_NOT_FOUND'
        );
      }

      // Update only the fields that are provided in the command
      const updateData = {
        ...(command.edited_text !== undefined && { edited_text: command.edited_text }),
        status: "accepted_edited",
        edited_at: new Date().toISOString()
      };

      const { data: updatedData, error: updateError } = await this.supabase
        .from('generations')
        .update(updateData)
        .eq('id', generationId)
        .select()
        .single();

      if (updateError) {
        throw new GenerationError(
          'Failed to update generation',
          'DATABASE_ERROR',
          updateError
        );
      }

      if (!updatedData) {
        throw new GenerationError(
          'Generation not found or access denied',
          'GENERATION_NOT_FOUND'
        );
      }

      // Map to DTO and return
      return {
        ...updatedData,
        generated_text: updatedData.generated_text || '',
        edited_text: updatedData.edited_text || undefined,
        status: updatedData.status || 'generated'
      } as GenerationDTO;

    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }

      throw new GenerationError(
        'An unexpected error occurred while updating the generation',
        'DATABASE_ERROR',
        error
      );
    }
  }
}