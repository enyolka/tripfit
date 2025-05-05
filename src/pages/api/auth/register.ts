import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';
import { registerSchema } from '../../../lib/validations/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();
    const validationResult = registerSchema.safeParse(data);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Validation failed", 
          details: validationResult.error.errors 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { email, password } = validationResult.data;
    
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    
    // Register the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/login`,
      }});

    if (signUpError) {
      return new Response(
        JSON.stringify({ error: signUpError.message }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user" }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create user profile with default values
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        preferences: {},
        level: 1, // Default fitness level
      });

    if (profileError) {
      console.error('Failed to create profile:', profileError);
      // We don't want to fail the registration if profile creation fails
      // but we should log it and handle it appropriately
    }

    // Return success with appropriate status
    return new Response(
      JSON.stringify({ 
        user: authData.user,
        message: authData.user.email_confirmed_at 
          ? "Registration successful" 
          : "Please check your email to confirm your account"
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};