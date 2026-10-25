import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { assignDriver, setOrderStatus } from "@/app/admin/orders/actions";
import StatusNote from "@/components/admin/StatusNote";
import { money } from "@/lib/cart-math";
import { getOrder, listDrivers } from "@/lib/order-queries";
import {
    STATUS_LABEL,
    buildTracking,
    fmtDay,
    fmtTime,
    nextStatuses,
    relativeTime,
} from "@/lib/orders";

export const metadata: Metadata = { title: "Order — Organic Ghee" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ status?: string }> };

export default function AdminOrderPage({ params, searchParams }: Props) {
    return (
        <Suspense fallback={<p className="text-[0.85rem] text-muted">Loading order…</p>}>
            <ResolvedOrder params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedOrder({ params, searchParams }: Props) {
    const { id } = await params;
    const { status } = await searchParams;
    const [order, drivers] = await Promise.all([getOrder(id), listDrivers()]);
    if (!order) notFound();

    const next = nextStatuses(order.status, "admin");
    const steps = buildTracking({ status: order.status, city: order.recipient.city, events: order.events });
    const path = `/admin/orders/${order.id}`;

    return (
        <div className="max-w-4xl">
            <p className="text-[0.8rem]">
                <Link href="/admin/orders" className="text-muted hover:text-ink">
                    COD board
                </Link>
                <span className="mx-2 text-muted">/</span>
                <span>{order.id}</span>
            </p>

            <header className="mt-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight tracking-tight">
                        {order.id}
                    </h1>
                    <span className="label-sm rounded-full bg-sand px-3 py-1 text-[10px]">
                        {STATUS_LABEL[order.status]}
                    </span>
                </div>
                <p className="mt-2 text-[0.85rem] text-muted">
                    Placed {fmtDay(order.placedAt)} · {relativeTime(order.placedAt)}
                    {order.eta ? ` · ETA ${fmtDay(order.eta)}` : ""}
                </p>
                <StatusNote status={status} />
            </header>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-line bg-sand/40 p-5">
                    <h2 className="label-sm text-[10px] text-muted">Recipient</h2>
                    <p className="mt-3 text-[0.95rem]">{order.recipient.name}</p>
                    <p className="mt-1 text-[0.85rem]">
                        <a href={`tel:${order.recipient.phone}`} className="underline underline-offset-4">
                            {order.recipient.phone}
                        </a>
                    </p>
                    <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
                        {order.recipient.address}
                        {order.recipient.city ? `, ${order.recipient.city}` : ""}
                    </p>
                    {order.recipient.notes && (
                        <p className="mt-3 text-[0.8rem] italic text-muted">“{order.recipient.notes}”</p>
                    )}
                </section>

                <section className="rounded-xl border border-line bg-sand/40 p-5">
                    <h2 className="label-sm text-[10px] text-muted">Cash on delivery</h2>
                    <p className="mt-3 font-serif text-3xl">{money(order.totals.total)}</p>
                    <p className="mt-2 text-[0.8rem] text-muted">
                        {money(order.totals.subtotal)} items
                        {order.totals.shipping === 0 ? " · free delivery" : ` · ${money(order.totals.shipping)} delivery`}
                    </p>
                    <ul className="mt-4 space-y-2 text-[0.85rem]">
                        {order.items.map((i) => (
                            <li key={i.name + i.options.join()} className="flex justify-between gap-4">
                                <span>
                                    {i.name} · {i.options.join(", ")} × {i.qty}
                                </span>
                                <span>{money(i.price * i.qty)}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <section className="mt-6 rounded-xl border border-line p-5">
                <h2 className="label-sm text-[10px] text-muted">Assign rider</h2>
                <form action={assignDriver} className="mt-4 flex flex-wrap gap-2">
                    <input type="hidden" name="order_id" value={order.id} />
                    <input type="hidden" name="next" value={path} />
                    <select
                        name="driver_id"
                        defaultValue={order.driverId ?? ""}
                        className="field max-w-sm flex-1"
                    >
                        <option value="">Unassigned</option>
                        {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.email}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="btn btn-solid hover:opacity-85">
                        Save assignment
                    </button>
                </form>
                {drivers.length === 0 && (
                    <p className="mt-3 text-[0.8rem] text-muted">
                        No rider accounts.{" "}
                        <Link href="/admin/team" className="underline">
                            Grant the driver role
                        </Link>{" "}
                        first.
                    </p>
                )}
            </section>

            {next.length > 0 && (
                <section className="mt-6 rounded-xl border border-line p-5">
                    <h2 className="label-sm text-[10px] text-muted">Move status</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {next.map((s) => (
                            <form key={s} action={setOrderStatus}>
                                <input type="hidden" name="order_id" value={order.id} />
                                <input type="hidden" name="status" value={s} />
                                <input type="hidden" name="next" value={path} />
                                <button type="submit" className="btn btn-solid hover:opacity-85">
                                    {STATUS_LABEL[s]}
                                </button>
                            </form>
                        ))}
                    </div>
                </section>
            )}

            <section className="mt-6 rounded-xl border border-line p-5">
                <h2 className="label-sm text-[10px] text-muted">Trail</h2>
                <ol className="mt-4 space-y-3">
                    {order.events.map((e, i) => (
                        <li key={`${e.at}-${i}`} className="flex justify-between gap-4 text-[0.85rem]">
                            <span>
                                {e.status ? STATUS_LABEL[e.status] : "Note"}
                                {e.note ? ` — ${e.note}` : ""}
                            </span>
                            <span className="shrink-0 text-muted">
                                {fmtDay(e.at)} · {fmtTime(e.at)}
                            </span>
                        </li>
                    ))}
                </ol>
                <ol className="mt-6 border-t border-line pt-4 text-[0.8rem] text-muted">
                    {steps.map((s) => (
                        <li key={s.status} className="py-1">
                            {s.title}
                            {s.at ? ` · ${fmtTime(s.at)}` : s.state === "current" ? " · now" : ""}
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    );
}
