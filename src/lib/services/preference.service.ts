import type { SupabaseClient } from '../../db/supabase.client';
import type { PreferenceDTO, UpdatePreferenceCommand } from '../../types';

export class PreferenceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'CONSTRAINT_VIOLATION' | 'DATABASE_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'PreferenceError';
  }
}

export class PreferenceService {
  constructor(private supabase: SupabaseClient) {}

  async getPreference(userId: string): Promise<PreferenceDTO> {
    try {
      const { data, error } = await this.supabase
        .from('preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // no rows returned
          throw new PreferenceError(
            'Preferences not found',
            'NOT_FOUND'
          );
        }
        throw new PreferenceError(
          'Failed to fetch preferences',
          'DATABASE_ERROR',
          error
        );
      }

      if (!data) {
        throw new PreferenceError(
          'Preferences not found',
          'NOT_FOUND'
        );
      }

      return data;
    } catch (error) {
      if (error instanceof PreferenceError) {
        throw error;
      }

      throw new PreferenceError(
        'An unexpected error occurred while fetching preferences',
        'DATABASE_ERROR',
        error
      );
    }
  }

  async updatePreference(userId: string, command: UpdatePreferenceCommand): Promise<PreferenceDTO> {
    try {
      // Najpierw sprawdzamy, czy istnieją preferencje
      const { data: existing, error: checkError } = await this.supabase
        .from('preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Jeśli nie ma preferencji, tworzymy nowe
        const { data: inserted, error: insertError } = await this.supabase
          .from('preferences')
          .insert({
            user_id: userId,
            preference: command.preference,
            level: command.level
          })
          .select()
          .single();

        if (insertError) {
          throw new PreferenceError(
            'Failed to create preferences',
            'DATABASE_ERROR',
            insertError
          );
        }

        return inserted;
      }

      // Jeśli są preferencje, aktualizujemy je
      const { data: updated, error: updateError } = await this.supabase
        .from('preferences')
        .update({
          preference: command.preference,
          level: command.level,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw new PreferenceError(
          'Failed to update preferences',
          'DATABASE_ERROR',
          updateError
        );
      }

      if (!updated) {
        throw new PreferenceError(
          'Preferences not found',
          'NOT_FOUND'
        );
      }

      return updated;
    } catch (error) {
      if (error instanceof PreferenceError) {
        throw error;
      }

      throw new PreferenceError(
        'An unexpected error occurred',
        'DATABASE_ERROR',
        error
      );
    }
  }
}