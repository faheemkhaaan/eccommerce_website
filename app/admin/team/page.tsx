import type { Metadata } from "next";
import { Suspense } from "react";
import { grantRole } from "@/app/admin/team/actions";
import StatusNote, { NotesType } from "@/components/admin/StatusNote";
import { listStaffUsers } from "@/lib/order-queries";
import { fmtDay } from "@/lib/orders";

export const metadata: Metadata = { title: "Riders & roles — Organic Ghee" };

type Props = { searchParams: Promise<{ status?: NotesType; q?: string }> };

export default function AdminTeamPage({ searchParams }: Props) {
    return (
        <Suspense fallback={<p className="text-[0.85rem] text-muted">Loading accounts…</p>}>
            <ResolvedTeam searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedTeam({ searchParams }: Props) {
    const { status, q } = await searchParams;
    const query = typeof q === "string" ? q : "";
    const users = await listStaffUsers(query);

    return (
        <div className="max-w-4xl">
            <header>
                <p className="eyebrow">Staff</p>
                <h1 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight tracking-tight">
                    Riders &amp; roles
                </h1>
                <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                    Promote a signed-up account to rider so it appears on the COD board. Roles live in the
                    database, not in profile metadata.
                </p>
                <StatusNote status={status} />
            </header>

            <form className="mt-8 flex gap-2" action="/admin/team">
                <label htmlFor="team-q" className="sr-only">
                    Search by email
                </label>
                <input
                    id="team-q"
                    name="q"
                    defaultValue={query}
                    placeholder="Search email…"
                    className="field max-w-sm flex-1"
                />
                <button type="submit" className="btn btn-solid hover:opacity-85">
                    Search
                </button>
            </form>

            <ul className="mt-6 divide-y divide-line">
                {users.map((u) => (
                    <li key={u.userId} className="flex flex-wrap items-center gap-3 py-4">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[0.95rem]">{u.email || u.userId}</p>
                            <p className="mt-0.5 text-[0.75rem] text-muted">Joined {fmtDay(u.joinedAt)}</p>
                        </div>
                        <form action={grantRole} className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="user_id" value={u.userId} />
                            <input type="hidden" name="q" value={query} />
                            <select name="role" defaultValue={u.role} className="field w-36 py-1.5">
                                <option value="customer">Customer</option>
                                <option value="driver">Driver</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button type="submit" className="btn border border-line text-ink hover:opacity-70">
                                Update
                            </button>
                        </form>
                    </li>
                ))}
                {users.length === 0 && (
                    <li className="py-8 text-[0.85rem] text-muted">
                        No accounts match. They need to register on the shop first.
                    </li>
                )}
            </ul>
        </div>
    );
}
