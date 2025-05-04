import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';
import { registerSchema } from '../../../lib/validations/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
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
    
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Successful registration - redirect to login with a success message
    return redirect('/login?registered=true');
    
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