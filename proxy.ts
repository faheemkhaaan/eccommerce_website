import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/** Runs the Supabase session refresh on every matched request. */
export async function proxy(request: NextRequest) {
    return updateSession(request);
}

export const config = {
    // api/auth/send-sms is the Supabase "Send SMS" hook: Supabase calls it with no
    // cookies and no session, so it must bypass the session refresh entirely.
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth/send-sms|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};