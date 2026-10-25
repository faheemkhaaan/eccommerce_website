import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import AdminNav from "./AdminNav";

/**
 * Static chrome for the staff surfaces. It renders no dynamic data of its own, so
 * the only thing waiting on the role check is the content inside {children}.
 */
export default function AdminFrame({
    email,
    children,
}: {
    email?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="border-b border-line bg-sand/60 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-3 px-5 py-5">
                    <Link href="/" className="font-serif text-base tracking-[0.16em]">Organic Ghee</Link>
                    <span className="label-sm rounded-full bg-ink px-2 py-0.5 text-[9px] text-white">Admin</span>
                </div>
                <nav aria-label="Admin sections" className="px-3 pb-4">
                    <AdminNav />
                </nav>
                <div className="hidden border-t border-line px-5 py-4 lg:block">
                    <p className="truncate text-[11px] text-muted">
                        Signed in as <span className="text-ink">{email ?? "staff"}</span>
                    </p>
                    <form action={signOut} className="mt-3">
                        <button
                            type="submit"
                            className="label-sm text-[10px] text-muted transition hover:text-accent"
                        >
                            Sign out
                        </button>
                    </form>
                </div>
            </aside>

            <div className="flex min-h-screen flex-col">
                <header className="flex flex-wrap items-center gap-3 border-b border-line bg-paper/85 px-5 py-4 backdrop-blur-sm md:px-8 lg:justify-end">
                    <p className="truncate text-[11px] text-muted lg:hidden">
                        Signed in as <span className="text-ink">{email ?? "staff"}</span>
                    </p>
                    <div className="ml-auto flex items-center gap-2">
                        <Link href="/collections" className="btn border border-line text-ink hover:opacity-70">
                            View shop
                        </Link>
                        <form action={signOut} className="lg:hidden">
                            <button type="submit" className="btn btn-solid hover:opacity-85">
                                Sign out
                            </button>
                        </form>
                    </div>
                </header>

                <main className="flex-1 px-5 py-8 md:px-8 md:py-10">{children}</main>
            </div>
        </div>
    );
}
