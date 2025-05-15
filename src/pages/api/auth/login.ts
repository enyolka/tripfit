import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { loginSchema } from "../../../lib/validations/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const validationResult = loginSchema.safeParse(data);

        if (!validationResult.success) {
            return new Response(
                JSON.stringify({
                    error: "Validation failed",
                    details: validationResult.error.errors,
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const { email, password } = validationResult.data;

        const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status || 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(
            JSON.stringify({
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                },
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Login error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
