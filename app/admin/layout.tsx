import type { Metadata } from "next";
import { Suspense } from "react";
import AdminFrame from "@/components/admin/AdminFrame";
import { requireRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Admin — Organic Ghee" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // The role check reads the session cookie, so it can't be part of the static
    // shell. Everything the boundary contains — including {children} — renders only
    // after the check passes, so a denied request never streams page data.
    return (
        <Suspense fallback={<AdminLoading />}>
            <AdminGate>{children}</AdminGate>
        </Suspense>
    );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
    const user = await requireRole("admin", "/admin");
    return <AdminFrame email={user.email}>{children}</AdminFrame>;
}

function AdminLoading() {
    return (
        <div className="wrap py-16">
            <p className="eyebrow">Checking access</p>
            <div className="mt-6 h-8 w-56 animate-pulse rounded bg-muted/15" />
            <div className="mt-10 h-40 animate-pulse rounded-lg bg-muted/10" />
        </div>
    );
}
