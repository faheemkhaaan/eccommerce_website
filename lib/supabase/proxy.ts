import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Browsing stays open; only the buy + account areas need a session.
// COD tracking is deliberately public — guests track with their Order ID and phone.
const PROTECTED = ["/account", "/checkout"];

// Staff surfaces. A signed-out visitor is sent to /login; a signed-in customer is
// sent home rather than told the dashboard exists.
const ADMIN_ONLY = ["/admin"];

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
    const claims = data?.claims;
    const { pathname } = request.nextUrl;

    // Carry any refreshed auth cookies over to the redirect, or the session is lost.
    const redirectTo = (to: string, search = "") => {
        const url = request.nextUrl.clone();
        url.pathname = to;
        url.search = search;
        const redirect = NextResponse.redirect(url);
        response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
        return redirect;
    };

    const wantsAdmin = ADMIN_ONLY.some((p) => pathname.startsWith(p));

    if (!claims && (wantsAdmin || PROTECTED.some((p) => pathname.startsWith(p)))) {
        return redirectTo("/login", `?next=${encodeURIComponent(pathname)}`);
    }

    // Signed in but not staff. This is a routing convenience, not the security
    // boundary: the admin layout re-checks the role server-side and RLS guards the
    // data itself, so a forged request gets nothing.
    if (claims && wantsAdmin) {
        const { data: roleRow } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", claims.sub)
            .maybeSingle();

        if (roleRow?.role !== "admin") return redirectTo("/");
    }

    return response;
}