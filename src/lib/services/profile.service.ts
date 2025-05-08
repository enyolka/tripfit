import type { SupabaseClient } from '../../db/supabase.client';
import type { PreferenceDTO, UpdatePreferenceCommand } from '../../types';

export class PreferenceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DATABASE_ERROR' | 'CONSTRAINT_VIOLATION' | 'UNEXPECTED_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'PreferenceError';
  }
}

export class PreferenceService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getUserId(): Promise<string> {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error || !user) {
      throw new PreferenceError('User not authenticated', 'NOT_FOUND');
    }
    return user.id;
  }

  async getPreference(userId: string): Promise<PreferenceDTO> {
    try {
      const { data: preference, error } = await this.supabase
        .from('preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw new PreferenceError(
          'Failed to fetch preference',
          'DATABASE_ERROR',
          error
        );
      }

      if (!preference) {
        throw new PreferenceError(
          'Preference not found',
          'NOT_FOUND'
        );
      }

      return preference as PreferenceDTO;
    } catch (error) {
      if (error instanceof PreferenceError) {
        throw error;
      }

      throw new PreferenceError(
        'An unexpected error occurred while fetching the preference',
        'UNEXPECTED_ERROR',
        error
      );
    }
  }

  async updatePreference(userId: string, command: UpdatePreferenceCommand): Promise<PreferenceDTO> {
    try {
      const { data: updatedPreference, error } = await this.supabase
        .from('preferences')
        .update({
          preferences: command.preference,
          level: command.level
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
          default:
            throw new PreferenceError(
              'Failed to update preference',
              'DATABASE_ERROR',
              error
            );
        }
      }

      if (!updatedPreference) {
        throw new PreferenceError(
          'Preference not found or access denied',
          'NOT_FOUND'
        );
      }

      return updatedPreference as PreferenceDTO;
    } catch (error) {
      if (error instanceof PreferenceError) {
        throw error;
      }

      throw new PreferenceError(
        'An unexpected error occurred while updating the preference',
        'UNEXPECTED_ERROR',
        error
      );
    }
  }
}