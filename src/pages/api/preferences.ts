import type { APIRoute } from 'astro';
import type { SupabaseClient } from '../../db/supabase.client';
import type { PreferenceDTO, UpdatePreferenceCommand } from '../../types';
import { PreferenceService, PreferenceError } from '@/lib/services/preference.service';
import { updatePreferenceSchema } from '@/lib/validations/preference';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    // 1. Check if user is authenticated
    const user = locals.user;
    if (!user) {
      return new Response(
        JSON.stringify({ 
          error: "Authentication required" 
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 2. Get user preferences using service
    const preferenceService = new PreferenceService(locals.supabase as SupabaseClient);
    const preferences = await preferenceService.getPreference(user.id);

    // 3. Return preferences data
    return new Response(
      JSON.stringify(preferences), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Preferences fetch error:', error);

    if (error instanceof PreferenceError) {
      switch (error.code) {
        case 'NOT_FOUND':
          return new Response(
            JSON.stringify({ 
              error: "Preferences not found" 
            }), 
            { 
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        default:
          return new Response(
            JSON.stringify({ 
              error: error.message 
            }), 
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
      }
    }

    return new Response(
      JSON.stringify({ 
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Check if user is authenticated
    const user = locals.user;
    if (!user) {
      return new Response(
        JSON.stringify({ 
          error: "Authentication required" 
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 2. Parse and validate request body
    const rawData = await request.json();
    const validationResult = updatePreferenceSchema.safeParse(rawData);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Validation Error",
          details: validationResult.error.errors 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 3. Update preferences using service
    const preferenceService = new PreferenceService(locals.supabase as SupabaseClient);
    const updatedPreferences = await preferenceService.updatePreference(user.id, validationResult.data as UpdatePreferenceCommand);

    // 4. Return updated preferences
    return new Response(
      JSON.stringify(updatedPreferences),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Preferences update error:', error);

    if (error instanceof PreferenceError) {
      switch (error.code) {
        case 'NOT_FOUND':
          return new Response(
            JSON.stringify({ error: "Preferences not found" }), 
            { 
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        case 'CONSTRAINT_VIOLATION':
          return new Response(
            JSON.stringify({ error: error.message }), 
            { 
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        default:
          return new Response(
            JSON.stringify({ error: error.message }), 
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
      }
    }

    return new Response(
      JSON.stringify({ 
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};