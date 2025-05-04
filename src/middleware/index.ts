import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance } from '../db/supabase.client';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/recover',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/recover',
];

export const onRequest = defineMiddleware(
  async ({ locals, cookies, request, url, redirect }, next) => {
    // Skip auth check for public paths
    if (PUBLIC_PATHS.includes(url.pathname)) {
      return next();
    }

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Get user session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // If it's an API route, return 401
      if (url.pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // For regular routes, redirect to login
      const redirectTo = encodeURIComponent(url.pathname);
      return redirect(`/login?redirect_to=${redirectTo}`);
    }

    // Make user and supabase client available in routes
    locals.user = {
      id: user.id,
      email: user.email,
    };
    locals.supabase = supabase;

    return next();
  },
);