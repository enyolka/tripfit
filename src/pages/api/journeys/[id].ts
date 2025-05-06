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

// Validation schema for request body - all fields are optional for PATCH
const updateJourneySchema = z.object({
  destination: z.string().min(1).optional(),
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  return_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  activities: z.string().nullable().optional(),
  additional_notes: z.array(z.string()).optional()
}).refine((data) => {
  // Only validate dates if both are provided
  if (data.departure_date && data.return_date) {
    const departure = new Date(data.departure_date);
    const returnDate = new Date(data.return_date);
    return departure <= returnDate;
  }
  return true;
}, {
  message: "Departure date must be before or equal to return date",
  path: ["departure_date"]
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

export const GET: APIRoute = async ({ params, locals }) => {
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

    // 3. Fetch journey data
    const journey = await journeyService.getJourney(journeyId);

    // 4. Return successful response
    return new Response(JSON.stringify(journey), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching journey:', error);

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
              message: "Failed to fetch journey"
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

export const PATCH: APIRoute = async ({ params, request, locals }) => {
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

    // 2. Parse and validate request body
    const rawData = await request.json();
    const validationResult = updateJourneySchema.safeParse(rawData);

    if (!validationResult.success) {
      return new Response(JSON.stringify({
        error: "Validation Error",
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Initialize service and update journey
    const journeyService = new JourneyService(locals.supabase as SupabaseClient);
    const updatedJourney = await journeyService.updateJourney(journeyId, validationResult.data);

    // 4. Return successful response
    return new Response(JSON.stringify(updatedJourney), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating journey:', error);

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
          case 'CONSTRAINT_VIOLATION':
            return new Response(JSON.stringify({
              error: "Journey data violates database constraints",
              message: error instanceof Error ? error.message : "Invalid data constraints"
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          case 'DATABASE_ERROR':
            return new Response(JSON.stringify({
              error: "Database operation failed",
              message: "Failed to update journey"
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