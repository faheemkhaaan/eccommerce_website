import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Browsing stays open; only the buy + account areas need a session.
// COD tracking is deliberately public — guests track with their Order ID and phone.
const PROTECTED = ["/account", "/checkout"];

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                },
            },
        },
    );

    // Refreshes the token and verifies it. Never trust getSession() in server code.
    const { data } = await supabase.auth.getClaims();
    const signedIn = !!data?.claims;
    const { pathname } = request.nextUrl;

    if (!signedIn && PROTECTED.some((p) => pathname.startsWith(p))) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.search = `?next=${encodeURIComponent(pathname)}`;
        const redirect = NextResponse.redirect(url);
        response.cookies.getAll().forEach((c) => redirect.cookies.set(c)); // keep refreshed cookies
        return redirect;
    }

    return response;
}