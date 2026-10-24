import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

/**
 * Handles Supabase email OTP verification for authentication workflows 
 * such as magic links, email confirmations, or password resets.
 * 
 * Parses `token_hash`, `type`, and `next` parameters from the request URL,
 * validates the token against Supabase, and redirects the user accordingly.
 * 
 * @code
 * ```ts
 * export async function GET(request: NextRequest) {
 *     const { searchParams, origin } = new URL(request.url);
 *     const token_hash = searchParams.get("token_hash");
 *     const type = searchParams.get("type") as EmailOtpType | null;
 *     const next = safeNext(searchParams.get("next"));
 * 
 *     if (token_hash && type) {
 *         const supabase = await createClient();
 *         const { error } = await supabase.auth.verifyOtp({ type, token_hash });
 *         if (!error) return NextResponse.redirect(new URL(next, origin)); // user is now signed in
 *     }
 *     return NextResponse.redirect(new URL("/login", origin));
 * }
 * ```
 * @param request - The incoming NextRequest containing authentication query parameters.
 * @returns A NextResponse redirect to the target destination on success, or to the sign-in page on failure.
 */

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = safeNext(searchParams.get("next"));

    if (token_hash && type) {
        const supabase = await createClient();
        const { error } = await supabase.auth.verifyOtp({ type, token_hash });
        if (!error) return NextResponse.redirect(new URL(next, origin)); // user is now signed in
    }
    // Expired or already-used link — send them to sign-in, where they can request a new one.
    return NextResponse.redirect(new URL("/login", origin));
}