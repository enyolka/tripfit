import { defineMiddleware } from "astro:middleware";
// import type { MiddlewareHandler } from "astro";
// import type { SupabaseClient } from "../db/supabase.client";

import { supabaseClient } from "../db/supabase.client";
export const onRequest = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;
  return next();
});

// export const onRequest: MiddlewareHandler = async (context, next) => {
//   // Skip auth for non-API routes
//   if (!context.url.pathname.startsWith('/api/')) {
//     return next();
//   }

//   const supabase = context.locals.supabase as SupabaseClient;
//   const { data: { session }, error: authError } = await supabase.auth.getSession();

//   // Handle auth errors
//   if (authError) {
//     console.error('Auth error:', authError);
//     return new Response(JSON.stringify({
//       error: "Authentication error",
//       message: "Failed to verify authentication"
//     }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   }

//   // Check if user is authenticated
//   if (!session) {
//     return new Response(JSON.stringify({
//       error: "Unauthorized",
//       message: "You must be logged in to access this resource"
//     }), {
//       status: 401,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   }

//   // Continue to route handler
//   return next();
// };