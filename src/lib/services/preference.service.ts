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
      const { data, error } = await this.supabase
        .from('preferences')
        .update({
          preference: command.preference,
          level: command.level,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        switch (error.code) {
          case '23514': // check_violation
            throw new PreferenceError(
              'Preference data violates database constraints',
              'CONSTRAINT_VIOLATION',
              error
            );
          case '23503': // foreign_key_violation
            throw new PreferenceError(
              'Referenced user does not exist',
              'NOT_FOUND',
              error
            );
          default:
            throw new PreferenceError(
              'Failed to update preferences',
              'DATABASE_ERROR',
              error
            );
        }
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
        'An unexpected error occurred while updating preferences',
        'DATABASE_ERROR',
        error
      );
    }
  }
}