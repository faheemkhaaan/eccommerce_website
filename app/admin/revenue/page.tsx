import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { money } from "@/lib/cart-math";
import { listBoardOrders } from "@/lib/order-queries";
import { fmtDay } from "@/lib/orders";
import { requireRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Revenue — Organic Ghee" };

/**
 * Revenue is entirely derived from delivered COD orders, so this page stays a
 * thin read-only view over the order board data.
 */
export default function AdminRevenuePage() {
    return (
        <Suspense fallback={<RevenueSkeleton />}>
            <ResolvedRevenue />
        </Suspense>
    );
}

/** Loads delivered-order sales metrics for the admin dashboard. */
async function ResolvedRevenue() {
    await requireRole("admin", "/admin/revenue");

    const orders = await listBoardOrders();
    const delivered = orders.filter((o) => o.status === "delivered");
    const cashReceived = delivered.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = delivered.length ? cashReceived / delivered.length : 0;
    const cashOnRoad = orders
        .filter((o) => o.status === "out_for_delivery" || o.status === "attempted")
        .reduce((sum, o) => sum + o.total, 0);

    const byCity = [...delivered.reduce((map, order) => {
        map.set(order.city, (map.get(order.city) ?? 0) + order.total);
        return map;
    }, new Map<string, number>())]
        .sort((a, b) => b[1] - a[1]);

    return (
        <div className="max-w-5xl">
            <header>
                <p className="eyebrow">Sales</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                    <h1 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight tracking-tight">
                        Revenue
                    </h1>
                    <Link href="/admin/orders?view=closed" className="btn border border-line text-ink hover:opacity-70 ml-auto">
                        Closed orders
                    </Link>
                </div>
                <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                    Cash only counts once a parcel is marked delivered. Parcels still on the road stay
                    out of revenue and show separately below.
                </p>
            </header>

            <dl className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: "Cash received", value: money(cashReceived), sub: "delivered COD orders" },
                    { label: "Delivered orders", value: String(delivered.length), sub: "handed over and paid" },
                    { label: "Average order", value: money(avgOrderValue), sub: "per delivered parcel" },
                    { label: "Cash on the road", value: money(cashOnRoad), sub: "out for delivery + attempted" },
                ].map((card) => (
                    <div key={card.label} className="rounded-xl border border-line bg-sand/40 p-5">
                        <dt className="label-sm text-[10px] text-muted">{card.label}</dt>
                        <dd className="mt-2 font-serif text-3xl leading-none">{card.value}</dd>
                        <dd className="mt-2 text-[0.78rem] text-muted">{card.sub}</dd>
                    </div>
                ))}
            </dl>

            <div className="mt-8 grid gap-6 xl:grid-cols-[7fr_5fr]">
                <section className="rounded-xl border border-line p-5">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="label-sm text-[10px] text-muted">Delivered orders</h2>
                        <span className="text-[0.78rem] text-muted">{delivered.length} total</span>
                    </div>
                    {delivered.length === 0 ? (
                        <p className="mt-6 text-[0.85rem] text-muted">No delivered orders yet.</p>
                    ) : (
                        <ul className="mt-4 divide-y divide-line">
                            {delivered.slice(0, 12).map((order) => (
                                <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                    <div>
                                        <Link href={`/admin/orders/${order.id}`} className="font-serif hover:text-accent">
                                            {order.id}
                                        </Link>
                                        <p className="mt-1 text-[0.78rem] text-muted">
                                            {order.customerName} · {order.city} · {fmtDay(order.placedAt)}
                                        </p>
                                    </div>
                                    <span className="font-serif text-lg">{money(order.total)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded-xl border border-line p-5">
                    <h2 className="label-sm text-[10px] text-muted">Revenue by city</h2>
                    {byCity.length === 0 ? (
                        <p className="mt-6 text-[0.85rem] text-muted">City totals will appear after the first delivery.</p>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {byCity.map(([city, total]) => (
                                <li key={city} className="flex items-center justify-between gap-3 rounded-lg bg-sand/40 px-4 py-3">
                                    <span>{city}</span>
                                    <span className="font-serif">{money(total)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}

/** Shape-matched fallback for the revenue dashboard while orders stream in. */
function RevenueSkeleton() {
    return (
        <div className="max-w-5xl">
            <div className="h-3 w-20 animate-pulse rounded-full bg-muted/15" />
            <div className="mt-4 h-10 w-56 animate-pulse rounded-full bg-muted/15" />
            <div className="mt-3 h-3 w-full max-w-2xl animate-pulse rounded-full bg-muted/10" />

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-line bg-sand/40 p-5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-muted/15" />
                        <div className="mt-4 h-9 w-28 animate-pulse rounded-full bg-muted/15" />
                        <div className="mt-3 h-3 w-36 animate-pulse rounded-full bg-muted/10" />
                    </div>
                ))}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[7fr_5fr]">
                <div className="rounded-xl border border-line p-5">
                    <div className="h-3 w-28 animate-pulse rounded-full bg-muted/15" />
                    <div className="mt-4 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between gap-3 py-3">
                                <div className="min-w-0 flex-1">
                                    <div className="h-4 w-24 animate-pulse rounded-full bg-muted/15" />
                                    <div className="mt-2 h-3 w-40 animate-pulse rounded-full bg-muted/10" />
                                </div>
                                <div className="h-5 w-20 animate-pulse rounded-full bg-muted/15" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-xl border border-line p-5">
                    <div className="h-3 w-28 animate-pulse rounded-full bg-muted/15" />
                    <div className="mt-4 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg bg-sand/40 px-4 py-3">
                                <div className="h-4 w-20 animate-pulse rounded-full bg-muted/15" />
                                <div className="h-4 w-16 animate-pulse rounded-full bg-muted/15" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
