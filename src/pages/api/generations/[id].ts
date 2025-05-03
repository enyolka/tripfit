import { z } from 'zod';
import type { APIRoute } from 'astro';
import type { SupabaseClient } from '../../../db/supabase.client';
import { type GenerationDTO, type UpdateGenerationCommand } from '../../../types';
import { GenerationService } from '../../../lib/services/generation.service';
import { GenerationError } from '../../../lib/services/generation.service';

export const prerender = false;

// Validation schemas
const paramsSchema = z.object({
  id: z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error('Invalid generation ID format');
    }
    return parsed;
  }),
});

const updateGenerationSchema = z.object({
  edited_text: z.string()
});

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Validate generation ID from URL params
    const validatedParams = paramsSchema.safeParse(params);
    if (!validatedParams.success) {
      return new Response(JSON.stringify({
        error: "Invalid generation ID format",
        details: validatedParams.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id: generationId } = validatedParams.data;

    // 2. Parse and validate request body
    const rawData = await request.json();
    const validationResult = updateGenerationSchema.safeParse(rawData);

    if (!validationResult.success) {
      return new Response(JSON.stringify({
        error: "Validation Error",
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Create update command with forced accepted_edited status
    const updateCommand: UpdateGenerationCommand = {
      edited_text: validationResult.data.edited_text,
      status: 'accepted_edited'
    };

    // 4. Initialize service and update generation
    const generationService = new GenerationService(locals.supabase as SupabaseClient);
    const updatedGeneration = await generationService.updateGeneration(generationId, updateCommand);

    // 5. Return successful response
    return new Response(JSON.stringify(updatedGeneration), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating generation:', error);

    if (error instanceof Error) {
      if (error.message === 'Generation not found' || error.message === 'Generation not found or access denied') {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
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

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Validate input parameters
    const result = paramsSchema.safeParse(params);
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid generation ID',
          details: result.error.issues 
        }),
        { status: 400 }
      );
    }

    const generationService = new GenerationService(locals.supabase);
    const generation = await generationService.getGeneration(result.data.id);

    return new Response(JSON.stringify(generation), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    if (error instanceof GenerationError) {
      const status = error.code === 'GENERATION_NOT_FOUND' ? 404 : 500;
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred' 
      }), 
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // 1. Validate generation ID from URL params
    const validatedParams = paramsSchema.safeParse(params);
    if (!validatedParams.success) {
      return new Response(JSON.stringify({
        error: "Invalid generation ID format",
        details: validatedParams.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id: generationId } = validatedParams.data;

    // 2. Initialize service and delete generation
    const generationService = new GenerationService(locals.supabase as SupabaseClient);
    await generationService.deleteGeneration(generationId);

    // 3. Return success response
    return new Response(JSON.stringify({ 
      message: "Generation successfully deleted" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error deleting generation:', error);

    if (error instanceof Error) {
      if (error.message === 'Generation not found' || error.message === 'Generation not found or access denied') {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
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