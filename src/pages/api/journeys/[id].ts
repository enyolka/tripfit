import type { APIRoute } from 'astro';
import { z } from 'zod';
import { JourneyService } from '../../../lib/services/journey.service';
import type { SupabaseClient } from '../../../db/supabase.client';

// Prevent static generation
export const prerender = false;

// Validation schema for URL parameters
const paramsSchema = z.object({
  id: z.string().min(1).transform(Number),
});

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // 1. Validate journey ID from URL params
    const validatedParams = paramsSchema.safeParse(params);
    if (!validatedParams.success) {
      return new Response(JSON.stringify({
        error: "Invalid journey ID format",
        details: validatedParams.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id: journeyId } = validatedParams.data;

    // 2. Initialize service with Supabase client
    const journeyService = new JourneyService(locals.supabase as SupabaseClient);

    // 3. Delete journey
    await journeyService.deleteJourney(journeyId);

    // 4. Return success response
    return new Response(JSON.stringify({
      message: "Journey successfully deleted"
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error deleting journey:', error);

    // Handle known errors
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'JourneyServiceError' && 'code' in error) {
        switch (error.code) {
          case 'NOT_FOUND':
            return new Response(JSON.stringify({
              error: "Journey not found or access denied"
            }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            });
          case 'DATABASE_ERROR':
            return new Response(JSON.stringify({
              error: "Database operation failed",
              message: "Failed to delete journey"
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
        }
      }
    }

    // Handle unexpected errors
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};