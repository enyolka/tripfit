import type { APIRoute } from 'astro';
import type { SupabaseClient } from '../../../db/supabase.client';
import type { ProfileDTO, UpdateProfileCommand } from '../../../types';
import { updateProfileSchema } from '../../../lib/validations/profile';
import { ProfileService, ProfileError } from '../../../lib/services/profile.service';

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

    // 2. Get user profile using service
    const profileService = new ProfileService(locals.supabase as SupabaseClient);
    const profile = await profileService.getProfile(user.id);

    // 3. Return profile data
    return new Response(
      JSON.stringify(profile), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Profile fetch error:', error);

    if (error instanceof ProfileError) {
      switch (error.code) {
        case 'NOT_FOUND':
          return new Response(
            JSON.stringify({ 
              error: "Profile not found" 
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
    const validationResult = updateProfileSchema.safeParse(rawData);

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

    // 3. Update profile using service
    const profileService = new ProfileService(locals.supabase as SupabaseClient);
    const updatedProfile = await profileService.updateProfile(user.id, validationResult.data as UpdateProfileCommand);

    // 4. Return updated profile
    return new Response(
      JSON.stringify(updatedProfile),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Profile update error:', error);

    if (error instanceof ProfileError) {
      switch (error.code) {
        case 'NOT_FOUND':
          return new Response(
            JSON.stringify({ error: "Profile not found" }), 
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