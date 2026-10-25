import Link from "next/link";
import { assignDriver, setOrderStatus } from "@/app/admin/orders/actions";
import { money } from "@/lib/cart-math";
import type { DriverOption } from "@/lib/order-queries";
import {
    STATUS_LABEL,
    nextStatuses,
    relativeTime,
    type OrderStatus,
    type OrderSummary,
} from "@/lib/orders";

const TONE: Record<OrderStatus, string> = {
    pending: "bg-accent/15 text-accent",
    confirmed: "bg-ink/10 text-ink",
    packed: "bg-leaf/15 text-leaf",
    out_for_delivery: "bg-leaf/15 text-leaf",
    delivered: "bg-leaf/15 text-leaf",
    attempted: "bg-accent/15 text-accent",
    cancelled: "bg-muted/15 text-muted",
    returned: "bg-muted/15 text-muted",
};

export default function OrderCard({
    order,
    drivers,
    returnTo,
}: {
    order: OrderSummary;
    drivers: DriverOption[];
    returnTo: string;
}) {
    const next = nextStatuses(order.status, "admin");
    const rider = drivers.find((d) => d.id === order.driverId);

    return (
        <article className="rounded-xl border border-line bg-paper p-4">
            <div className="flex items-start justify-between gap-2">
                <Link href={`/admin/orders/${order.id}`} className="font-serif text-lg hover:text-accent">
                    {order.id}
                </Link>
                <span className={`label-sm rounded-full px-2 py-1 text-[9px] ${TONE[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                </span>
            </div>
            <p className="mt-2 text-[0.85rem]">{order.customerName}</p>
            <p className="mt-0.5 text-[0.78rem] text-muted">
                {order.city} · {money(order.total)}
            </p>
            <p className="mt-1 text-[0.72rem] text-muted">{relativeTime(order.placedAt)}</p>
            {!order.driverId && order.status === "packed" && (
                <p className="mt-2 text-[0.72rem] text-accent">Needs a rider</p>
            )}
            {rider && <p className="mt-2 truncate text-[0.72rem] text-muted">Rider {rider.email}</p>}

            <form action={assignDriver} className="mt-3">
                <input type="hidden" name="order_id" value={order.id} />
                <input type="hidden" name="next" value={returnTo} />
                <label className="label-sm sr-only" htmlFor={`driver-${order.id}`}>
                    Assign rider
                </label>
                <div className="flex gap-2">
                    <select
                        id={`driver-${order.id}`}
                        name="driver_id"
                        defaultValue={order.driverId ?? ""}
                        className="field min-w-0 flex-1 py-1.5 text-[0.75rem]"
                    >
                        <option value="">Unassigned</option>
                        {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.email}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="btn border border-line text-ink hover:opacity-70">
                        Save
                    </button>
                </div>
            </form>

            {next.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {next.map((status) => (
                        <form key={status} action={setOrderStatus}>
                            <input type="hidden" name="order_id" value={order.id} />
                            <input type="hidden" name="status" value={status} />
                            <input type="hidden" name="next" value={returnTo} />
                            <button type="submit" className="btn border border-line bg-sand text-ink hover:opacity-70">
                                {STATUS_LABEL[status]}
                            </button>
                        </form>
                    ))}
                </div>
            )}
        </article>
    );
}
