import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths accessible to unauthenticated users
const PUBLIC_PATHS = ["/login", "/register", "/recover"];

// Protected paths requiring authentication
const PROTECTED_PATHS = ["/journeys", "/journey"];

export const onRequest = defineMiddleware(async (context, next) => {
    const { cookies, url, request } = context;

    // Initialize Supabase client
    const supabase = createSupabaseServerInstance({
        cookies,
        headers: request.headers,
    });

    // Always set supabase in locals for API routes to use
    context.locals.supabase = supabase;

    // Get current user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        console.error("Auth error:", authError);
    }

    const currentPath = url.pathname;

    // Set user in locals if authenticated
    if (user) {
        context.locals.user = {
            id: user.id,
            email: user.email,
        };

        // Redirect logged-in users from public paths to /journeys
        if (PUBLIC_PATHS.some((path) => currentPath.startsWith(path))) {
            return context.redirect("/journeys");
        }
    } else {
        // Handle unauthenticated users
        if (PROTECTED_PATHS.some((path) => currentPath.startsWith(path))) {
            // Save the intended destination for post-login redirect
            const redirectUrl = new URL("/login", url);
            redirectUrl.searchParams.set("redirect_to", url.pathname);
            return context.redirect(redirectUrl.toString());
        }
    }

    return next();
});
