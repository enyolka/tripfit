import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { CreateJourneyCommand } from '../../types';
import { JourneyService } from '../../lib/services/journey.service';
import { DEFAULT_USER_ID } from '../../db/supabase.client';

// Disable static pre-rendering for API routes
export const prerender = false;

// Validation schema for journey creation with European date format (DD.MM.YYYY)
const createJourneySchema = z.object({
  destination: z.string().min(1),
  departure_date: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Date must be in DD.MM.YYYY format"),
  return_date: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Date must be in DD.MM.YYYY format"),
  activities: z.string().optional(),
  additional_notes: z.array(z.string()).default([])
}).refine((data) => {
  // Convert DD.MM.YYYY to Date objects for comparison
  const [depDay, depMonth, depYear] = data.departure_date.split('.');
  const [retDay, retMonth, retYear] = data.return_date.split('.');
  
  const departure = new Date(+depYear, +depMonth - 1, +depDay);
  const returnDate = new Date(+retYear, +retMonth - 1, +retDay);
  
  return departure <= returnDate;
}, {
  message: "Departure date must be before or equal to return date",
  path: ["departure_date"]
});

export const GET: APIRoute = async ({ locals }) => {
  try {
    const journeyService = new JourneyService(locals.supabase);
    const journeys = await journeyService.getJourneys();

    return new Response(JSON.stringify({ journeys }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching journeys:', error);
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
    // 1. Get and validate the auth context
    // const supabase = locals.supabase;
    // const { data: { user } } = await supabase.auth.getUser();

    // if (!user) {
    //   return new Response(JSON.stringify({
    //     error: "Unauthorized - You must be logged in to create a journey"
    //   }), {
    //     status: 401,
    //     headers: { 'Content-Type': 'application/json' }
    //   });
    // }

    // 2. Parse and validate request body
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

    // Create journey using service with default user
    const journeyService = new JourneyService(locals.supabase);
    const command: CreateJourneyCommand = {
      ...validationResult.data,
    //   user_id: user.id
      user_id: DEFAULT_USER_ID // Add default user ID
    };

    const createdJourney = await journeyService.createJourney(command);

    // 5. Return successful response with created journey
    return new Response(JSON.stringify(createdJourney), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating journey:', error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};