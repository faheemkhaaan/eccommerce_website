import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "customer" | "admin" | "driver";

export type CurrentUser = { userId: string; email?: string; role: AppRole };

/**
 * Resolves the signed-in user together with their application role.
 * Reads the role from the user_roles table rather than user_metadata, which the
 * client can write to. Returns null when there is no session.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;

    if (typeof claims?.sub !== "string") return null;

    const { data: row } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", claims.sub)
        .maybeSingle();

    // A user with no row is an ordinary customer; only the service role can grant more.
    return {
        userId: claims.sub,
        email: typeof claims.email === "string" ? claims.email : undefined,
        role: (row?.role as AppRole | undefined) ?? "customer",
    };
}

/**
 * Guards a server-rendered route. Redirects rather than returning, so callers can
 * treat a successful return as an authorisation guarantee.
 */
export async function requireRole(role: AppRole, nextPath = "/"): Promise<CurrentUser> {
    const user = await getCurrentUser();

    if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
    if (user.role !== role) redirect("/");

    return user;
}

/** Throwing variant for server actions, which must authorise close to the data. */
export async function assertRole(role: AppRole): Promise<CurrentUser> {
    const user = await getCurrentUser();

    if (!user || user.role !== role) throw new Error("Not authorised");

    return user;
}
