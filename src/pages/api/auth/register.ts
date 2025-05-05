import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/login?confirmation=confirmed`,
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({ 
          error: error.message 
        }), 
        { status: 400 }
      );
    }

    // Return success with confirmation message
    return new Response(
      JSON.stringify({
        user: data.user,
        message: 'Registration successful! Please check your email to confirm your account.'
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred during registration.' 
      }), 
      { status: 500 }
    );
  }
};