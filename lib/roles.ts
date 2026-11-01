import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "customer" | "admin" | "driver";

export type CurrentUser = { userId: string; email?: string; role: AppRole };
type Roles = AppRole | AppRole[];
const allows = (user: CurrentUser, roles: Roles) =>
    (Array.isArray(roles) ? roles : [roles]).includes(user.role);

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

export const homeFor = (role: AppRole) =>
    role === "admin" ? "/admin" : role === "driver" ? "/driver" : "/";


/**
 * Guards a server-rendered route. Redirects rather than returning, so callers can
 * treat a successful return as an authorisation guarantee.
 */
export async function requireRole(roles: Roles, nextPath = "/"): Promise<CurrentUser> {
    const user = await getCurrentUser();
    console.log(user)
    if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
    // A rider who wanders onto an admin-only page lands on their board, not the shop.
    if (!allows(user, roles)) redirect(homeFor(user.role));
    return user;
}

/** Throwing variant for server actions, which must authorise close to the data. */
export async function assertRole(roles: Roles): Promise<CurrentUser> {
    const user = await getCurrentUser();
    if (!user || !allows(user, roles)) throw new Error("Not authorised");
    return user;
}

export type StaffRole = Exclude<AppRole, "customer">; // "admin" | "driver"

/** requireRole for staff pages, with the role narrowed so it can be passed straight to staff-only APIs. */
export async function requireStaff(nextPath = "/admin/orders"): Promise<CurrentUser & { role: StaffRole }> {
    const user = await requireRole(["admin", "driver"], nextPath);
    console.log(user)
    // requireRole has already redirected anyone else, so this narrowing is safe.
    return user as CurrentUser & { role: StaffRole };
}