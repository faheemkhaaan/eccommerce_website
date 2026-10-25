import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import OrderCard from "@/components/admin/OrderCard";
import StatusNote from "@/components/admin/StatusNote";
import { listBoardOrders, listDrivers } from "@/lib/order-queries";
import { STATUS_LABEL, isTerminalStatus, type OrderStatus } from "@/lib/orders";
import { money } from "@/lib/cart-math";

export const metadata: Metadata = { title: "COD board — Organic Ghee" };

const OPEN_COLUMNS: OrderStatus[] = ["pending", "confirmed", "packed", "out_for_delivery", "attempted"];

type Props = { searchParams: Promise<{ status?: string; view?: string }> };

export default function AdminOrdersPage({ searchParams }: Props) {
    return (
        <Suspense fallback={<p className="text-[0.85rem] text-muted">Loading the COD board…</p>}>
            <ResolvedBoard searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedBoard({ searchParams }: Props) {
    const [{ status, view }, orders, drivers] = await Promise.all([
        searchParams,
        listBoardOrders(),
        listDrivers(),
    ]);

    const closedView = view === "closed";
    const visible = orders.filter((o) => (closedView ? isTerminalStatus(o.status) : !isTerminalStatus(o.status)));
    const pending = orders.filter((o) => o.status === "pending").length;
    const out = orders.filter((o) => o.status === "out_for_delivery").length;
    const unassigned = orders.filter((o) => o.status === "packed" && !o.driverId).length;
    const cashOut = orders
        .filter((o) => o.status === "out_for_delivery" || o.status === "attempted")
        .reduce((sum, o) => sum + o.total, 0);

    const grouped = OPEN_COLUMNS.map((col) => ({
        col,
        rows: visible.filter((o) => o.status === col),
    }));

    const returnTo = closedView ? "/admin/orders?view=closed" : "/admin/orders";

    return (
        <div>
            <header>
                <p className="eyebrow">Operations</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                    <h1 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight tracking-tight">
                        COD status board
                    </h1>
                    <Link href="/admin/team" className="btn border border-line text-ink hover:opacity-70 ml-auto">
                        Riders &amp; roles
                    </Link>
                </div>
                <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                    Confirm the call, pack the jar, hand it to a rider. Status here is what the customer sees on
                    tracking.
                </p>
                <StatusNote status={status} />
            </header>

            <dl className="mt-8 grid gap-3 sm:grid-cols-4">
                {[
                    { label: "Waiting on a call", value: String(pending), sub: "pending confirmation" },
                    { label: "Need a rider", value: String(unassigned), sub: "packed, unassigned" },
                    { label: "Out with a rider", value: String(out), sub: "cash still on the road" },
                    { label: "Cash on the road", value: money(cashOut), sub: "out for delivery + attempted" },
                ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-line bg-sand/40 p-5">
                        <dt className="label-sm text-[10px] text-muted">{s.label}</dt>
                        <dd className="mt-2 font-serif text-3xl leading-none">{s.value}</dd>
                        <dd className="mt-2 text-[0.78rem] text-muted">{s.sub}</dd>
                    </div>
                ))}
            </dl>

            {drivers.length === 0 && (
                <p className="mt-6 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-[0.8rem] text-accent">
                    No rider accounts yet. Promote someone on{" "}
                    <Link href="/admin/team" className="underline">
                        Riders &amp; roles
                    </Link>{" "}
                    before you can assign parcels.
                </p>
            )}

            <div className="mt-8 flex gap-2">
                <Link
                    href="/admin/orders"
                    className={`btn ${closedView ? "border border-line text-ink" : "btn-solid"} hover:opacity-85`}
                >
                    Open
                </Link>
                <Link
                    href="/admin/orders?view=closed"
                    className={`btn ${closedView ? "btn-solid" : "border border-line text-ink"} hover:opacity-85`}
                >
                    Closed
                </Link>
            </div>

            {closedView ? (
                <ul className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {visible.map((order) => (
                        <li key={order.id}>
                            <OrderCard order={order} drivers={drivers} returnTo={returnTo} />
                        </li>
                    ))}
                    {visible.length === 0 && (
                        <li className="py-8 text-[0.85rem] text-muted">No delivered, cancelled or returned orders yet.</li>
                    )}
                </ul>
            ) : (
                <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
                    {grouped.map(({ col, rows }) => (
                        <section key={col} className="w-72 shrink-0">
                            <header className="mb-3 flex items-baseline justify-between gap-2">
                                <h2 className="label-sm text-[10px] text-muted">{STATUS_LABEL[col]}</h2>
                                <span className="text-[0.75rem] text-muted">{rows.length}</span>
                            </header>
                            <ul className="space-y-3">
                                {rows.map((order) => (
                                    <li key={order.id}>
                                        <OrderCard order={order} drivers={drivers} returnTo={returnTo} />
                                    </li>
                                ))}
                                {rows.length === 0 && (
                                    <li className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-[0.78rem] text-muted">
                                        None
                                    </li>
                                )}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
