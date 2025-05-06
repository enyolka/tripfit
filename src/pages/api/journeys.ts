import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { CreateJourneyCommand } from '../../types';
import { JourneyService } from '../../lib/services/journey.service';
import type { SupabaseClient } from '../../db/supabase.client';

// Disable static pre-rendering for API routes
export const prerender = false;

// Validation schema for journey creation with database date format (YYYY-MM-DD)
const createJourneySchema = z.object({
  destination: z.string().min(1),
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  return_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  activities: z.string().nullable().optional(),
  additional_notes: z.array(z.string()).default([])
}).refine((data) => {
  const departure = new Date(data.departure_date);
  const returnDate = new Date(data.return_date);
  return departure <= returnDate;
}, {
  message: "Departure date must be before or equal to return date",
  path: ["departure_date"]
});

export const GET: APIRoute = async ({ locals }) => {
  try {
    const journeyService = new JourneyService(locals.supabase as SupabaseClient);
    const journeys = await journeyService.getJourneys();

    return new Response(JSON.stringify({ journeys }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching journeys:', error);

    // Handle service-specific errors
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'JourneyServiceError' && 'code' in error) {
        switch (error.code) {
          case 'UNAUTHORIZED':
            return new Response(JSON.stringify({
              error: "You must be logged in to view journeys"
            }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            });
        }
      }
    }

    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const journeyService = new JourneyService(locals.supabase as SupabaseClient);
    
    // Parse and validate request body
    const rawData = await request.json();
    const validationResult = createJourneySchema.safeParse(rawData);

    if (!validationResult.success) {
      return new Response(JSON.stringify({
        error: "Validation Error",
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const createdJourney = await journeyService.createJourney(validationResult.data);

    return new Response(JSON.stringify(createdJourney), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating journey:', error);

    // Handle service-specific errors
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'JourneyServiceError' && 'code' in error) {
        switch (error.code) {
          case 'UNAUTHORIZED':
            return new Response(JSON.stringify({
              error: "You must be logged in to create a journey"
            }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            });
        }
      }
    }

    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};