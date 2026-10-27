import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import StatusNote, { NotesType } from "@/components/admin/StatusNote";
import { money } from "@/lib/cart-math";
import { listDriverOrders } from "@/lib/order-queries";
import { STATUS_LABEL, isTerminalStatus } from "@/lib/orders";

export const metadata: Metadata = { title: "Today’s parcels — Organic Ghee" };

type Props = { searchParams: Promise<{ status?: NotesType }> };

export default function DriverHomePage({ searchParams }: Props) {
    return (
        <Suspense fallback={<p className="text-[0.85rem] text-muted">Loading your queue…</p>}>
            <ResolvedQueue searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedQueue({ searchParams }: Props) {
    const [{ status }, orders] = await Promise.all([searchParams, listDriverOrders()]);
    const open = orders.filter((o) => !isTerminalStatus(o.status));
    const done = orders.filter((o) => isTerminalStatus(o.status));
    const cash = open.reduce((sum, o) => sum + o.totals.total, 0);

    return (
        <div>
            <header>
                <p className="eyebrow">Rider</p>
                <h1 className="mt-2 font-serif text-[1.8rem] leading-tight">Your parcels</h1>
                <p className="mt-2 text-[0.85rem] text-muted">
                    {open.length} open · collect {money(cash)} in cash
                </p>
                <p className="mt-3 text-[0.78rem] leading-relaxed text-muted">
                    On your phone: Share → Add to Home Screen. The rider app opens full-screen from there.
                </p>
                <StatusNote status={status} />
            </header>

            {open.length === 0 ? (
                <p className="mt-8 rounded-xl border border-dashed border-line px-4 py-10 text-center text-[0.85rem] text-muted">
                    Nothing assigned to you yet. The shop will hand you a parcel from the COD board.
                </p>
            ) : (
                <ul className="mt-6 space-y-3">
                    {open.map((o) => (
                        <li key={o.id}>
                            <Link
                                href={`/driver/${o.id}`}
                                className="block rounded-2xl border border-line bg-white p-4 active:bg-sand"
                            >
                                <div className="flex items-baseline justify-between gap-2">
                                    <p className="font-serif text-lg">{o.id}</p>
                                    <span className="label-sm text-[9px] text-muted">{STATUS_LABEL[o.status]}</span>
                                </div>
                                <p className="mt-2 text-[0.9rem]">{o.recipient.name}</p>
                                <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
                                    {o.recipient.address}, {o.recipient.city}
                                </p>
                                <p className="mt-3 font-serif text-xl">{money(o.totals.total)}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {done.length > 0 && (
                <section className="mt-10">
                    <h2 className="label-sm text-[10px] text-muted">Closed today</h2>
                    <ul className="mt-3 space-y-2">
                        {done.map((o) => (
                            <li key={o.id} className="flex items-center justify-between gap-3 text-[0.85rem]">
                                <Link href={`/driver/${o.id}`} className="underline underline-offset-4">
                                    {o.id}
                                </Link>
                                <span className="text-muted">
                                    {STATUS_LABEL[o.status]} · {money(o.totals.total)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
