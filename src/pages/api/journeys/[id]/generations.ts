import { z } from 'zod';
import type { APIRoute } from 'astro';
import { DEFAULT_USER_ID, type SupabaseClient } from '../../../../db/supabase.client';
import { AIService, type AIModelConfig, AIServiceError } from '../../../../lib/services/ai.service';
import { RateLimitService, RateLimitError } from '../../../../lib/services/rate-limit.service';
import { type GenerationDTO } from '../../../../types';
import { GenerationService } from '../../../../lib/services/generation.service';

export const prerender = false;

// Shared validation schemas
const paramsSchema = z.object({
  id: z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error('Invalid journey ID format');
    }
    return parsed;
  }),
});

const generationResponseSchema = z.array(
  z.object({
    id: z.number(),
    journey_id: z.number(),
    model: z.string(),
    generated_text: z.string(),
    edited_text: z.string().nullable(),
    status: z.enum(['generated', 'accepted_unedited', 'accepted_edited', 'rejected']),
    source_text_hash: z.string(),
    source_text_length: z.number(),
    created_at: z.string(),
    edited_at: z.string().nullable()
  })
);

// POST specific schemas
const bodySchema = z.object({
  plan_preferences: z.record(z.any()).optional(),
  model_config: z.object({
    model: z.string().optional(),
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().positive().optional(),
  }).optional(),
});

// GET endpoint handler
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = paramsSchema.parse(params);
    const { supabase } = locals;

    const generationService = new GenerationService(supabase);
    const generations = await generationService.getGenerationsForJourney(id);
    const validatedGenerations = generationResponseSchema.parse(generations);

    return new Response(JSON.stringify(validatedGenerations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return new Response(JSON.stringify({ 
        error: 'Data validation failed',
        details: error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (error instanceof Error && error.message === 'Journey not found') {
      return new Response(JSON.stringify({ error: 'Journey not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.error('Error fetching generations:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST endpoint handler
export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const validatedParams = paramsSchema.safeParse(params);
    if (!validatedParams.success) {
      return new Response(JSON.stringify({ error: 'Invalid journey ID' }), {
        status: 400,
      });
    }
    const { id: journeyId } = validatedParams.data;

    const body = await request.json();
    const validatedBody = bodySchema.safeParse(body);
    if (!validatedBody.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request body',
        details: validatedBody.error.errors
      }), {
        status: 400,
      });
    }
    const { plan_preferences, model_config } = validatedBody.data;

    const supabase = locals.supabase as SupabaseClient;

    const rateLimitService = new RateLimitService(supabase);
    try {
      await rateLimitService.checkRateLimit(journeyId);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', message: error.message }),
          { status: 429 }
        );
      }
      throw error;
    }

    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .select('*')
      .eq('id', journeyId)
      .eq('user_id', DEFAULT_USER_ID)
      .single();

    if (journeyError || !journey) {
      return new Response(
        JSON.stringify({ error: 'Journey not found or access denied' }),
        { status: 404 }
      );
    }

    const aiService = new AIService(model_config);

    try {
      const {
        generatedText,
        model,
        sourceTextHash,
        sourceTextLength,
      } = await aiService.generateTravelPlan(journey, plan_preferences);

      const { data: generation, error: generationError } = await supabase
        .from('generations')
        .insert({
          journey_id: journeyId,
          model,
          generated_text: generatedText,
          status: 'generated',
          source_text_hash: sourceTextHash,
          source_text_length: sourceTextLength,
        })
        .select()
        .single();

      if (generationError) {
        throw generationError;
      }

      return new Response(JSON.stringify(generation), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      const errorDetails = {
        journey_id: journeyId,
        model: model_config?.model || 'gpt-4',
        source_text_hash: 'unknown',
        source_text_length: 0,
        error_code: 'UNKNOWN_ERROR',
        error_message: 'Unknown error occurred'
      };

      if (error instanceof AIServiceError) {
        errorDetails.error_code = error.code;
        errorDetails.error_message = error.message;
        if (error.cause && typeof error.cause === 'object') {
          const cause = error.cause as any;
          if (cause.sourceTextHash) errorDetails.source_text_hash = cause.sourceTextHash;
          if (cause.sourceTextLength) errorDetails.source_text_length = cause.sourceTextLength;
        }
      } else if (error instanceof Error) {
        errorDetails.error_code = error.name;
        errorDetails.error_message = error.message;
      }

      await supabase.from('generation_error_logs').insert(errorDetails);
      throw error;
    }
  } catch (error) {
    console.error('Error in generations endpoint:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};