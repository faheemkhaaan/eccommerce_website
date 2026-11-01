import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/roles";

/**
 * Shows a shortcut into the staff area for admins and riders only.
 * Customers and guests get nothing. The role lookup reads the session cookie,
 * so it sits behind Suspense and doesn't block the rest of the header.
 */
export default function StaffLink() {
    return (
        <Suspense fallback={null}>
            <ResolvedStaffLink />
        </Suspense>
    );
}

async function ResolvedStaffLink() {
    const user = await getCurrentUser();
    if (!user || user.role === "customer") return null;

    const isAdmin = user.role === "admin";

    return (
        <Link
            href={isAdmin ? "/admin" : "/admin/orders"}
            className="label-sm rounded-full border border-current px-3 py-1 text-[10px] tracking-widest transition hover:opacity-70"
        >
            {isAdmin ? "Admin" : "My deliveries"}
        </Link>
    );
}