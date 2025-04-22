import { z } from "zod";
import type { APIRoute } from "astro";
import { DEFAULT_USER_ID, type SupabaseClient } from "../../../../db/supabase.client";
import { AIService, type AIModelConfig, AIServiceError } from "../../../../lib/services/ai.service";
import { RateLimitService, RateLimitError } from "../../../../lib/services/rate-limit.service";

// Prevent static generation of this endpoint
export const prerender = false;

// Validation schema for URL parameters
const paramsSchema = z.object({
  id: z.string().min(1).transform(Number),
});

// Validation schema for request body with AI model configuration
const bodySchema = z.object({
  plan_preferences: z.record(z.any()).optional(),
  model_config: z.object({
    model: z.string().optional(),
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().positive().optional(),
  }).optional(),
});

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Validate URL parameters
    const validatedParams = paramsSchema.safeParse(params);
    if (!validatedParams.success) {
      return new Response(JSON.stringify({ error: "Invalid journey ID" }), {
        status: 400,
      });
    }
    const { id: journeyId } = validatedParams.data;

    // 2. Validate request body
    const body = await request.json();
    const validatedBody = bodySchema.safeParse(body);
    if (!validatedBody.success) {
      return new Response(JSON.stringify({ 
        error: "Invalid request body",
        details: validatedBody.error.errors
      }), {
        status: 400,
      });
    }
    const { plan_preferences, model_config } = validatedBody.data;

    // 3. Get Supabase client from context
    const supabase = locals.supabase as SupabaseClient;

    // 4. Check rate limit
    const rateLimitService = new RateLimitService(supabase);
    try {
      await rateLimitService.checkRateLimit(journeyId);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded", message: error.message }),
          { status: 429 }
        );
      }
      throw error;
    }

    // 5. Fetch full journey details
    const { data: journey, error: journeyError } = await supabase
      .from("journeys")
      .select("*")
      .eq("id", journeyId)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (journeyError || !journey) {
      return new Response(
        JSON.stringify({ error: "Journey not found or access denied" }),
        { status: 404 }
      );
    }

    // 6. Initialize AI service with configuration
    const aiService = new AIService(model_config);

    // 7. Generate AI response
    try {
      const {
        generatedText,
        model,
        sourceTextHash,
        sourceTextLength,
      } = await aiService.generateTravelPlan(journey, plan_preferences);

      // 8. Save generation to database
      const { data: generation, error: generationError } = await supabase
        .from("generations")
        .insert({
          journey_id: journeyId,
          model,
          generated_text: generatedText,
          status: "generated",
          source_text_hash: sourceTextHash,
          source_text_length: sourceTextLength,
        })
        .select()
        .single();

      if (generationError) {
        throw generationError;
      }

      // 9. Return successful response
      return new Response(JSON.stringify(generation), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });

    } catch (error) {
      // 10. Log generation error
      const errorDetails = {
        journey_id: journeyId,
        model: model_config?.model || "gpt-4",
        source_text_hash: "unknown",
        source_text_length: 0,
        error_code: "UNKNOWN_ERROR",
        error_message: "Unknown error occurred"
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

      await supabase.from("generation_error_logs").insert(errorDetails);
      throw error;
    }
  } catch (error) {
    console.error("Error in generations endpoint:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};