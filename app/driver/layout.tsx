import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { signOutDriver } from "@/app/driver/actions";
import AutoRefresh from "@/components/driver/AutoRefresh";
import RegisterSW from "@/components/driver/RegisterSW";
import { requireRole } from "@/lib/roles";

export const metadata: Metadata = {
    title: "Rider — Organic Ghee",
    manifest: "/driver/manifest.webmanifest",
    appleWebApp: { capable: true, title: "Rider", statusBarStyle: "default" },
    icons: {
        apple: "/driver-icon-192.png",
        icon: "/driver-icon-192.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#2b231b",
    viewportFit: "cover",
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<DriverLoading />}>
            <DriverGate>{children}</DriverGate>
        </Suspense>
    );
}

async function DriverGate({ children }: { children: React.ReactNode }) {
    const user = await requireRole("driver", "/driver");

    return (
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-paper">
            <RegisterSW />
            <AutoRefresh />
            <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur-sm">
                <div className="min-w-0 flex-1">
                    <p className="font-serif text-base tracking-[0.12em]">Organic Ghee</p>
                    <p className="truncate text-[11px] text-muted">{user.email ?? "Rider"}</p>
                </div>
                <Link href="/driver" className="btn border border-line text-ink hover:opacity-70">
                    Queue
                </Link>
                <form action={signOutDriver}>
                    <button type="submit" className="btn btn-solid hover:opacity-85">
                        Sign out
                    </button>
                </form>
            </header>
            <main className="flex-1 px-4 py-5 pb-8">{children}</main>
        </div>
    );
}

function DriverLoading() {
    return (
        <div className="mx-auto max-w-lg px-4 py-16">
            <p className="eyebrow">Checking rider access</p>
            <div className="mt-6 h-8 w-40 animate-pulse rounded bg-muted/15" />
            <div className="mt-8 h-40 animate-pulse rounded-xl bg-muted/10" />
        </div>
    );
}
