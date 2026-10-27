import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { reportDelivery } from "@/app/driver/actions";
import StatusNote, { NotesType } from "@/components/admin/StatusNote";
import { money } from "@/lib/cart-math";
import { getOrder } from "@/lib/order-queries";
import { STATUS_LABEL, fmtDay, nextStatuses } from "@/lib/orders";

export const metadata: Metadata = { title: "Parcel — Organic Ghee" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ status?: NotesType }> };

export default function DriverOrderPage({ params, searchParams }: Props) {
    return (
        <Suspense fallback={<p className="text-[0.85rem] text-muted">Loading parcel…</p>}>
            <ResolvedParcel params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedParcel({ params, searchParams }: Props) {
    const { id } = await params;
    const { status } = await searchParams;
    const order = await getOrder(id);
    if (!order) notFound();

    const next = nextStatuses(order.status, "driver");
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.recipient.address}, ${order.recipient.city}`)}`;
    const path = `/driver/${order.id}`;

    return (
        <div>
            <p className="text-[0.8rem]">
                <Link href="/driver" className="text-muted hover:text-ink">
                    Queue
                </Link>
                <span className="mx-2 text-muted">/</span>
                {order.id}
            </p>

            <h1 className="mt-3 font-serif text-[1.8rem] leading-tight">{order.recipient.name}</h1>
            <p className="mt-1 text-[0.8rem] text-muted">
                {STATUS_LABEL[order.status]} · {fmtDay(order.placedAt)}
            </p>
            <StatusNote status={status} />

            <p className="mt-5 font-serif text-4xl">{money(order.totals.total)}</p>
            <p className="mt-1 text-[0.8rem] text-muted">Cash to collect on handover</p>

            <address className="mt-6 rounded-2xl bg-white p-4 text-sm not-italic leading-relaxed">
                {order.recipient.address}
                <br />
                {order.recipient.city}
                {order.recipient.notes && <p className="mt-2 text-muted">“{order.recipient.notes}”</p>}
            </address>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={`tel:${order.recipient.phone}`} className="btn btn-solid h-12 hover:opacity-85">
                    Call
                </a>
                <a href={maps} target="_blank" rel="noreferrer" className="btn h-12 border border-line text-ink hover:opacity-70">
                    Maps
                </a>
            </div>

            <ul className="mt-6 space-y-2 text-[0.85rem]">
                {order.items.map((i) => (
                    <li key={i.name + i.options.join()} className="flex justify-between gap-3">
                        <span>
                            {i.name} · {i.options.join(", ")} × {i.qty}
                        </span>
                        <span>{money(i.price * i.qty)}</span>
                    </li>
                ))}
            </ul>

            {next.length > 0 && (
                <section className="mt-8 space-y-3">
                    <h2 className="label-sm text-[10px] text-muted">At the door</h2>
                    {next.map((s) => (
                        <form key={s} action={reportDelivery} className="rounded-2xl border border-line bg-white p-4">
                            <input type="hidden" name="order_id" value={order.id} />
                            <input type="hidden" name="status" value={s} />
                            <input type="hidden" name="next" value={path} />
                            {s === "attempted" && (
                                <label className="mb-3 block">
                                    <span className="label-sm mb-2 block text-[10px] text-muted">What happened</span>
                                    <input
                                        name="note"
                                        placeholder="No one home, wrong address…"
                                        className="field"
                                    />
                                </label>
                            )}
                            <button
                                type="submit"
                                className={`btn h-12 w-full ${s === "delivered" ? "btn-solid" : "border border-line text-ink"} hover:opacity-85`}
                            >
                                {s === "delivered"
                                    ? `Collected ${money(order.totals.total)}`
                                    : STATUS_LABEL[s]}
                            </button>
                        </form>
                    ))}
                </section>
            )}
        </div>
    );
}
