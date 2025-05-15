import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { recoverSchema } from "../../../lib/validations/auth";

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const validationResult = recoverSchema.safeParse(data);

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

        const { email } = validationResult.data;

        const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${new URL(request.url).origin}/reset-password`,
        });

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Return success even if email doesn't exist (security best practice)
        return new Response(JSON.stringify({ message: "Recovery email sent" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Password recovery error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
