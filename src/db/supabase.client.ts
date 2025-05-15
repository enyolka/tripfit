import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName, type SupabaseClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export type { SupabaseClient };

export const cookieOptions: CookieOptionsWithName = {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
};

export function createSupabaseServerInstance(context: { headers: Headers; cookies: AstroCookies }) {
    const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
        cookies: {
            get(name: string) {
                return context.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptionsWithName) {
                context.cookies.set(name, value, {
                    ...cookieOptions,
                    ...options,
                });
            },
            remove(name: string, options: CookieOptionsWithName) {
                context.cookies.delete(name, {
                    ...cookieOptions,
                    ...options,
                });
            },
        },
    });

    return supabase;
}
