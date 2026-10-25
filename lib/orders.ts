// The order domain, shared by the storefront, the COD board and the rider app.
//
// Nothing in here touches the network: the types describe a parcel, and the helpers
// turn a status into the five-step timeline the customer sees. Database reads live in
// lib/order-queries.ts, which is what keeps this file importable from Client
// Components — orders used to be persisted here, in localStorage, which is why the
// old version of this file could never see another device's order.

export type OrderItem = {
    name: string;
    options: string[];
    qty: number;
    price: number;
    image: string;
};

export type Totals = {
    subtotal: number;
    shipping: number;
    total: number;
};

export type Recipient = {
    name: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
};

/** The shape the confirmation screen renders, exactly as create_order() returns it. */
export type Order = {
    id: string;
    placedAt: string;
    eta: string;
    recipient: Recipient;
    items: OrderItem[];
    totals: Totals;
};

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "packed"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "attempted"
    | "returned";

export const ORDER_STATUSES: OrderStatus[] = [
    "pending", "confirmed", "packed", "out_for_delivery", "delivered", "attempted", "cancelled", "returned",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    packed: "Packed",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    attempted: "Attempted",
    cancelled: "Cancelled",
    returned: "Returned",
};

/** The five states a parcel actually walks through, in order. */
export const TIMELINE: OrderStatus[] = ["pending", "confirmed", "packed", "out_for_delivery", "delivered"];

/** Statuses only a rider may report — the shop keeps the rest. */
export const DRIVER_STATUSES: OrderStatus[] = ["out_for_delivery", "delivered", "attempted"];

export const isClosedStatus = (s: OrderStatus) => s === "cancelled" || s === "returned";

export const isTerminalStatus = (s: OrderStatus) => s === "delivered" || isClosedStatus(s);

export const isFailureStatus = (s: OrderStatus) => s === "attempted" || s === "cancelled" || s === "returned";

const OPEN_FLOW: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["packed", "cancelled"],
    packed: ["out_for_delivery", "cancelled"],
    out_for_delivery: ["delivered", "attempted", "returned"],
    delivered: [],
    attempted: ["out_for_delivery", "delivered", "returned"],
    cancelled: [],
    returned: [],
};

/** Statuses the UI offers next. The database still enforces who may set what. */
export function nextStatuses(current: OrderStatus, actor: "admin" | "driver"): OrderStatus[] {
    if (actor === "driver") {
        if (isTerminalStatus(current)) return [];
        return DRIVER_STATUSES.filter((s) => s !== current);
    }
    return OPEN_FLOW[current] ?? [];
}

/** A failed attempt does not move the parcel off its route — it stays on "out for delivery". */
export const stepIndex = (s: OrderStatus) =>
    s === "attempted" ? 3 : Math.max(0, TIMELINE.indexOf(s));

export type StepState = "done" | "current" | "next";

export type TrackingStep = {
    status: OrderStatus;
    title: string;
    place: string;
    detail: string;
    at: string; // ISO, empty until the step is reached
    state: StepState;
};

const ROUTE: { status: OrderStatus; title: string; detail: string; place: (city: string) => string }[] = [
    {
        status: "pending",
        title: "Order received",
        detail: "COD order placed. Nothing has been charged — you pay the rider.",
        place: () => "Organic Ghee — Gulberg III, Lahore",
    },
    {
        status: "confirmed",
        title: "Order confirmed",
        detail: "Checked and confirmed by our team. We call before dispatch.",
        place: () => "Organic Ghee — Gulberg III, Lahore",
    },
    {
        status: "packed",
        title: "Packed & sealed",
        detail: "Jar hand-checked, sealed and boxed for transit.",
        place: () => "Dairy Fulfilment Centre — Sundar Estate, Lahore",
    },
    {
        status: "out_for_delivery",
        title: "Out for delivery",
        detail: "Assigned to a rider. Please keep this phone reachable.",
        place: (city) => `Local delivery station — ${city}`,
    },
    {
        status: "delivered",
        title: "Delivered",
        detail: "Handed over and paid in cash. Thank you.",
        place: (city) => `${city} — delivery address`,
    },
];

const reachedAt = (events: OrderEvent[], status: OrderStatus) =>
    events.find((e) => e.status === status)?.at ?? "";

/**
 * The timeline as shown to a customer. Real event timestamps drive it, so a step is
 * only ticked once somebody actually reported it.
 */
export function buildTracking(order: {
    status: OrderStatus;
    city: string;
    events: OrderEvent[];
}): TrackingStep[] {
    const idx = stepIndex(order.status);
    const closed = isClosedStatus(order.status);
    const city = order.city || "Lahore";

    return ROUTE.map((s, i) => {
        const at = reachedAt(order.events, s.status);
        const state: StepState = closed
            ? at
                ? "done"
                : "next"
            : i < idx
              ? "done"
              : i === idx
                ? "current"
                : "next";

        return { status: s.status, title: s.title, place: s.place(city), detail: s.detail, at, state };
    });
}

export const currentStep = (steps: TrackingStep[]) =>
    steps.find((s) => s.state === "current") ?? steps[0];

export type OrderEvent = {
    status: OrderStatus | null;
    note: string | null;
    at: string;
};

export type OrderNotice = { tone: "warn" | "bad"; title: string; body: string };

/** The header a parcel needs when it is not simply walking the happy path. */
export function statusNotice(status: OrderStatus): OrderNotice | null {
    if (status === "attempted") {
        return {
            tone: "warn",
            title: "Delivery attempted",
            body: "The rider reached the address and could not hand the parcel over. We will call you to arrange another attempt.",
        };
    }
    if (status === "cancelled") {
        return { tone: "bad", title: "Order cancelled", body: "This order was cancelled and will not be dispatched." };
    }
    if (status === "returned") {
        return {
            tone: "bad",
            title: "Returned to the dairy",
            body: "The parcel came back to us after a failed delivery. Call us and we will arrange a re-send.",
        };
    }
    return null;
}

/** What the public tracking lookup is allowed to reveal — no street address, no full number. */
export type TrackedOrder = {
    id: string;
    status: OrderStatus;
    placedAt: string;
    eta: string | null;
    city: string;
    name: string;
    phoneTail: string;
    totals: Totals;
    items: OrderItem[];
    events: OrderEvent[];
};

/** A full order as staff and riders see it. */
export type OrderRecord = {
    id: string;
    status: OrderStatus;
    placedAt: string;
    eta: string | null;
    recipient: Recipient;
    items: OrderItem[];
    totals: Totals;
    driverId: string | null;
    events: OrderEvent[];
};

/** The lighter row the status board and the rider queue are built from. */
export type OrderSummary = {
    id: string;
    status: OrderStatus;
    placedAt: string;
    eta: string | null;
    customerName: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
    total: number;
    driverId: string | null;
};

export const DEMO_ORDER_ID = "OG-DEMO24";

export const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

/** "3 hours ago" / "in 2 days" — the board is read at a glance, not for exact times. */
export function relativeTime(iso: string, now = Date.now()): string {
    const diff = now - new Date(iso).getTime();
    const mins = Math.round(Math.abs(diff) / 60_000);
    const ahead = diff < 0;
    const say = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;

    if (mins < 1) return "just now";
    if (mins < 60) return ahead ? `in ${say(mins, "min")}` : `${say(mins, "min")} ago`;

    const hours = Math.round(mins / 60);
    if (hours < 24) return ahead ? `in ${say(hours, "hour")}` : `${say(hours, "hour")} ago`;

    const days = Math.round(hours / 24);
    return ahead ? `in ${say(days, "day")}` : `${say(days, "day")} ago`;
}
