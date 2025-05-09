import type { SupabaseClient } from '../../db/supabase.client';
import type { PreferenceDTO, CreatePreferenceCommand, UpdatePreferenceCommand } from '../../types';

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

  async getPreferences(userId: string): Promise<PreferenceDTO[]> {
    try {
      const { data, error } = await this.supabase
        .from('preferences')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new PreferenceError(
          'Failed to fetch preferences',
          'DATABASE_ERROR',
          error
        );
      }

      return data || [];
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

  async createPreference(userId: string, command: CreatePreferenceCommand): Promise<PreferenceDTO> {
    try {
      const { data, error } = await this.supabase
        .from('preferences')
        .insert({
          user_id: userId,
          activity_name: command.activity_name,
          level: command.level
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // unique_violation
          throw new PreferenceError(
            'Ta aktywność już istnieje w Twoich preferencjach',
            'CONSTRAINT_VIOLATION',
            error
          );
        }
        throw new PreferenceError(
          'Failed to create preference',
          'DATABASE_ERROR',
          error
        );
      }

      if (!data) {
        throw new PreferenceError(
          'Failed to create preference - no data returned',
          'DATABASE_ERROR'
        );
      }

      return data;
    } catch (error) {
      if (error instanceof PreferenceError) {
        throw error;
      }

      throw new PreferenceError(
        'An unexpected error occurred while creating preference',
        'DATABASE_ERROR',
        error
      );
    }
  }

  async updatePreference(userId: string, preferenceId: string, command: UpdatePreferenceCommand): Promise<PreferenceDTO> {
    try {
      const { data, error } = await this.supabase
        .from('preferences')
        .update({
          activity_name: command.activity_name,
          level: command.level,
          updated_at: new Date().toISOString()
        })
        .eq('id', preferenceId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // unique_violation
          throw new PreferenceError(
            'Ta aktywność już istnieje w Twoich preferencjach',
            'CONSTRAINT_VIOLATION',
            error
          );
        }
        throw new PreferenceError(
          'Failed to update preference',
          'DATABASE_ERROR',
          error
        );
      }

      if (!data) {
        throw new PreferenceError(
          'Preference not found or access denied',
          'NOT_FOUND'
        );
      }

      return data;
    } catch (error) {
      if (error instanceof PreferenceError) {
        throw error;
      }

      throw new PreferenceError(
        'An unexpected error occurred while updating preference',
        'DATABASE_ERROR',
        error
      );
    }
  }

  async deletePreference(userId: string, preferenceId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('preferences')
        .delete()
        .eq('id', preferenceId)
        .eq('user_id', userId);

      if (error) {
        throw new PreferenceError(
          'Failed to delete preference',
          'DATABASE_ERROR',
          error
        );
      }
    } catch (error) {
      if (error instanceof PreferenceError) {
        throw error;
      }

      throw new PreferenceError(
        'An unexpected error occurred while deleting preference',
        'DATABASE_ERROR',
        error
      );
    }
  }
}