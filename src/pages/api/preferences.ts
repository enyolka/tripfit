import type { APIRoute } from "astro";
import type { SupabaseClient } from "../../db/supabase.client";
import type { CreatePreferenceCommand, UpdatePreferenceCommand } from "../../types";
import { PreferenceService, PreferenceError } from "@/lib/services/preference.service";
import { createPreferenceSchema, updatePreferenceSchema } from "@/lib/validations/preference";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
    try {
        // 1. Check if user is authenticated
        const user = locals.user;
        if (!user) {
            return new Response(
                JSON.stringify({
                    error: "Authentication required",
                }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // 2. Get user preferences using service
        const preferenceService = new PreferenceService(locals.supabase as SupabaseClient);
        const preferences = await preferenceService.getPreferences(user.id);

        // 3. Return preferences data
        return new Response(JSON.stringify(preferences), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Preferences fetch error:", error);

        return new Response(
            JSON.stringify({
                error: "Internal Server Error",
                message: error instanceof Error ? error.message : "Unknown error occurred",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        // 1. Check if user is authenticated
        const user = locals.user;
        if (!user) {
            return new Response(
                JSON.stringify({
                    error: "Authentication required",
                }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // 2. Parse and validate request body
        const rawData = await request.json();
        const validationResult = createPreferenceSchema.safeParse(rawData);

        if (!validationResult.success) {
            return new Response(
                JSON.stringify({
                    error: "Validation Error",
                    details: validationResult.error.errors,
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // 3. Create preference using service
        const preferenceService = new PreferenceService(locals.supabase as SupabaseClient);
        const newPreference = await preferenceService.createPreference(
            user.id,
            validationResult.data as CreatePreferenceCommand
        );

        // 4. Return created preference
        return new Response(JSON.stringify(newPreference), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Preference creation error:", error);

        if (error instanceof PreferenceError) {
            if (error.code === "CONSTRAINT_VIOLATION") {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        return new Response(
            JSON.stringify({
                error: "Internal Server Error",
                message: error instanceof Error ? error.message : "Unknown error occurred",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
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
                    error: "Authentication required",
                }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // 2. Get preferenceId from URL
        const url = new URL(request.url);
        const preferenceId = url.searchParams.get("id");
        if (!preferenceId) {
            return new Response(
                JSON.stringify({
                    error: "Preference ID is required",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // 3. Parse and validate request body
        const rawData = await request.json();
        const validationResult = updatePreferenceSchema.safeParse(rawData);

        if (!validationResult.success) {
            return new Response(
                JSON.stringify({
                    error: "Validation Error",
                    details: validationResult.error.errors,
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // 4. Update preference using service
        const preferenceService = new PreferenceService(locals.supabase as SupabaseClient);
        const updatedPreference = await preferenceService.updatePreference(
            user.id,
            preferenceId,
            validationResult.data as UpdatePreferenceCommand
        );

        // 5. Return updated preference
        return new Response(JSON.stringify(updatedPreference), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Preference update error:", error);

        if (error instanceof PreferenceError) {
            switch (error.code) {
                case "NOT_FOUND":
                    return new Response(JSON.stringify({ error: "Preference not found or access denied" }), {
                        status: 404,
                        headers: { "Content-Type": "application/json" },
                    });
                case "CONSTRAINT_VIOLATION":
                    return new Response(JSON.stringify({ error: error.message }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
            }
        }

        return new Response(
            JSON.stringify({
                error: "Internal Server Error",
                message: error instanceof Error ? error.message : "Unknown error occurred",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
    try {
        // 1. Check if user is authenticated
        const user = locals.user;
        if (!user) {
            return new Response(
                JSON.stringify({
                    error: "Authentication required",
                }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // 2. Get preferenceId from URL
        const url = new URL(request.url);
        const preferenceId = url.searchParams.get("id");
        if (!preferenceId) {
            return new Response(
                JSON.stringify({
                    error: "Preference ID is required",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // 3. Delete preference using service
        const preferenceService = new PreferenceService(locals.supabase as SupabaseClient);
        await preferenceService.deletePreference(user.id, preferenceId);

        // 4. Return success response
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Preference deletion error:", error);

        if (error instanceof PreferenceError) {
            if (error.code === "NOT_FOUND") {
                return new Response(JSON.stringify({ error: "Preference not found or access denied" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        return new Response(
            JSON.stringify({
                error: "Internal Server Error",
                message: error instanceof Error ? error.message : "Unknown error occurred",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};
